import { getAiConfig } from './ai-config.mjs';
import { getOllamaModelCapabilities } from './multimodal.mjs';

const MODEL_UPDATE_TIMEOUT_MS = 300000;
let updateInProgress = false;

/** @typedef {{ role: 'system' | 'user' | 'assistant', content: string }} ChatMessage */
/** @typedef {{ format?: unknown, family?: unknown, parameter_size?: unknown, quantization_level?: unknown }} RawOllamaModelDetails */
/** @typedef {{ name: string, size: number | null, digest?: unknown, modified_at?: unknown, details?: RawOllamaModelDetails }} RawOllamaModel */
/** @typedef {{ name: string, identifier: string, runtime: 'ollama', status: 'INSTALLED', available: true, sizeBytes: number | null, digest: string | null, modifiedAt: string | null, details: Record<string, string | null> | null }} NormalizedModel */
/** @typedef {{ runtime: 'ollama', available: boolean, status: 'READY' | 'UNAVAILABLE', models: NormalizedModel[], error: string | null }} ModelInventory */
/** @typedef {{ systemPrompt?: string | undefined, responseFormat?: 'text' | 'json', schema?: unknown }} GenerateReplyOptions */
/** @typedef {{ models?: RawOllamaModel[], message?: { content?: unknown }, error?: unknown, status?: unknown }} OllamaResponseBody */

function normalizeModel(model) {
  const name = typeof model?.name === 'string' ? model.name.trim() : '';
  if (!name) return null;
  const details = model.details;
  return {
    name,
    identifier: name,
    runtime: 'ollama',
    status: 'INSTALLED',
    available: true,
    sizeBytes: Number.isFinite(Number(model.size)) ? Number(model.size) : null,
    digest: typeof model.digest === 'string' ? model.digest : null,
    modifiedAt: typeof model.modified_at === 'string' ? model.modified_at : null,
    details: details && typeof details === 'object' ? {
      format: typeof details.format === 'string' ? details.format : null,
      family: typeof details.family === 'string' ? details.family : null,
      parameterSize: typeof details.parameter_size === 'string' ? details.parameter_size : null,
      quantizationLevel: typeof details.quantization_level === 'string' ? details.quantization_level : null,
    } : null,
  };
}

async function ollamaRequest(path, options = {}, timeoutMs = 10000) {
  const value = getAiConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, MODEL_UPDATE_TIMEOUT_MS));
  try {
    return await fetch(`${value.baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

export function getLlmStatus() {
  const value = getAiConfig();
  return { enabled: value.enabled, baseUrl: value.baseUrl, model: value.model, timeoutMs: value.timeoutMs, systemPrompt: value.systemPrompt };
}

export async function getLocalModelInventory() {
  try {
    const response = await ollamaRequest('/api/tags');
    const body = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(body?.models)) return { runtime: 'ollama', available: false, status: 'UNAVAILABLE', models: [], error: `HTTP ${response.status}` };
    return { runtime: 'ollama', available: true, status: 'READY', models: body.models.map(normalizeModel).filter((model) => model !== null), error: null };
  } catch (error) {
    return { runtime: 'ollama', available: false, status: 'UNAVAILABLE', models: [], error: error instanceof Error && error.name === 'AbortError' ? 'Ollama request timed out' : 'Ollama unavailable' };
  }
}

export async function getLlmProviderStatus() {
  const inventory = await getLocalModelInventory();
  const names = inventory.models.map((model) => model.name);
  const value = getAiConfig();
  const capability = await getOllamaModelCapabilities({ model: value.model, baseUrl: value.baseUrl });
  return {
    reachable: inventory.available,
    error: inventory.error,
    models: names,
    inventory: inventory.models,
    selectedModelAvailable: names.includes(value.model),
    capability,
  };
}

export { getOllamaModelCapabilities };

async function updateLocalModelInternal(name) {
  const response = await ollamaRequest('/api/pull', { method: 'POST', body: JSON.stringify({ model: name, stream: false }) }, MODEL_UPDATE_TIMEOUT_MS);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`[KassisT LLM] LLM_MODEL_UPDATE_FAILED provider=ollama model=${name}`);
    throw new Error(`Ollama model update failed (${response.status})`);
  }
  console.log(`[KassisT LLM] LLM_MODEL_UPDATE_COMPLETED provider=ollama model=${name}`);
  return { model: name, runtime: 'ollama', status: 'UPDATED', providerStatus: body?.status ?? 'success' };
}

export async function updateLocalModel(model) {
  const name = String(model ?? '').trim();
  if (!name) throw new Error('Model name is required');
  if (updateInProgress) throw new Error('Another model update is already running');
  updateInProgress = true;
  console.log(`[KassisT LLM] LLM_MODEL_UPDATE_STARTED provider=ollama model=${name}`);
  try { return await updateLocalModelInternal(name); } finally { updateInProgress = false; }
}

export async function updateAllLocalModels() {
  if (updateInProgress) throw new Error('Another model update is already running');
  updateInProgress = true;
  try {
    const inventory = await getLocalModelInventory();
    if (!inventory.available) throw new Error(inventory.error || 'Ollama unavailable');
    const updated = [];
    const failed = [];
    for (const item of inventory.models) {
      try { console.log(`[KassisT LLM] LLM_MODEL_UPDATE_STARTED provider=ollama model=${item.name}`); updated.push(await updateLocalModelInternal(item.name)); }
      catch { failed.push({ model: item.name, status: 'FAILED', error: 'Model update failed' }); }
    }
    return { updated, failed };
  } finally { updateInProgress = false; }
}

export function isModelUpdateInProgress() { return updateInProgress; }

function decisionSchema() {
  return {
    type: 'object',
    properties: {
      intent: { type: 'string' },
      response_text: { type: 'string' },
      customer_updates: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'string' } }, required: ['key', 'value'], additionalProperties: false } },
      cart_updates: { type: 'array', items: { type: 'object', properties: { action: { type: 'string' }, product_id: { type: ['string', 'null'] }, quantity: { type: ['integer', 'null'] } }, required: ['action', 'product_id', 'quantity'], additionalProperties: false } },
      product_requests: { type: 'array', items: { type: 'string' } },
      delivery_request: { type: ['object', 'null'] },
      order_action: { type: 'string', enum: ['NONE', 'REQUEST_CONFIRMATION'] },
      payment_action: { type: 'string', enum: ['NONE', 'REQUEST_PAYMENT'] },
      human_handoff_required: { type: 'boolean' },
      confidence: { type: 'number', minimum: 0, maximum: 1 }
    },
    required: ['intent', 'response_text', 'customer_updates', 'cart_updates', 'product_requests', 'delivery_request', 'order_action', 'payment_action', 'human_handoff_required', 'confidence'],
    additionalProperties: false
  };
}

export async function generateStructuredDecision(messages, options = {}) {
  const value = getAiConfig();
  if (!value.enabled) throw new Error('Local LLM auto-reply is disabled');
  const schema = options.schema || decisionSchema();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), value.timeoutMs);
  try {
    const systemPrompt = typeof options.systemPrompt === 'string' && options.systemPrompt.trim() ? options.systemPrompt.trim() : value.systemPrompt;
    const response = await fetch(`${value.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: value.model, messages: [{ role: 'system', content: systemPrompt }, ...messages.filter((message) => message.role !== 'system')], stream: false, think: false, format: schema, options: { temperature: 0 } }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`Local LLM request failed (${response.status})${body && typeof body.error === 'string' ? `: ${body.error}` : ''}`);
    const content = body?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Local LLM returned an empty structured response');
    let parsed;
    try { parsed = JSON.parse(content); } catch { throw new Error('Local LLM returned invalid structured JSON'); }
    validateDecision(parsed);
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

function validateDecision(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('LLM decision must be an object');
  if (typeof value.intent !== 'string' || !value.intent.trim()) throw new Error('LLM decision intent is required');
  if (typeof value.response_text !== 'string' || !value.response_text.trim()) throw new Error('LLM decision response_text is required');
  if (!Array.isArray(value.customer_updates) || !Array.isArray(value.cart_updates) || !Array.isArray(value.product_requests)) throw new Error('LLM decision collection fields are invalid');
  if (!['NONE', 'REQUEST_CONFIRMATION'].includes(value.order_action)) throw new Error('LLM decision order_action is invalid');
  if (!['NONE', 'REQUEST_PAYMENT'].includes(value.payment_action)) throw new Error('LLM decision payment_action is invalid');
  if (typeof value.human_handoff_required !== 'boolean') throw new Error('LLM decision human_handoff_required is invalid');
  if (!Number.isFinite(Number(value.confidence)) || Number(value.confidence) < 0 || Number(value.confidence) > 1) throw new Error('LLM decision confidence is invalid');
  return true;
}

export async function generateReply(messages, options = {}) {
  if (options.responseFormat === 'json') return JSON.stringify(await generateStructuredDecision(messages, options));
  const value = getAiConfig();
  if (!value.enabled) throw new Error('Local LLM auto-reply is disabled');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), value.timeoutMs);
  try {
    const systemPrompt = typeof options.systemPrompt === 'string' && options.systemPrompt.trim() ? options.systemPrompt.trim() : value.systemPrompt;
    const payload = { model: value.model, messages: [{ role: 'system', content: systemPrompt }, ...messages.filter((message) => message.role !== 'system')], stream: false, think: false };
    const response = await fetch(`${value.baseUrl}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`Local LLM request failed (${response.status})${body && typeof body.error === 'string' ? `: ${body.error}` : ''}`);
    const content = body?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Local LLM returned an empty response');
    return content.trim();
  } finally { clearTimeout(timer); }
}
