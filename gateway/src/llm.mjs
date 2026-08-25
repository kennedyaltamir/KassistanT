import { getCredential } from './credentials.mjs';
import { getAiConfig } from './ai-config.mjs';
import { generateGroqReply } from './llm-groq.mjs';

const MODEL_UPDATE_TIMEOUT_MS = 300000;
let updateInProgress = false;

/** @typedef {{ role: 'system' | 'user' | 'assistant', content: string }} ChatMessage */
/** @typedef {{ format?: unknown, family?: unknown, parameter_size?: unknown, quantization_level?: unknown }} RawOllamaModelDetails */
/** @typedef {{ name: string, size: number | null, digest?: unknown, modified_at?: unknown, details?: RawOllamaModelDetails }} RawOllamaModel */
/** @typedef {{ format: string | null, family: string | null, parameterSize: string | null, quantizationLevel: string | null }} ModelDetails */
/** @typedef {{ name: string, identifier: string, runtime: 'ollama', status: 'INSTALLED', available: true, sizeBytes: number | null, digest: string | null, modifiedAt: string | null, details: ModelDetails | null }} NormalizedModel */
/** @typedef {{ runtime: 'ollama', available: boolean, status: 'READY' | 'UNAVAILABLE', models: NormalizedModel[], error: string | null }} ModelInventory */
/** @typedef {{ systemPrompt?: string | undefined }} GenerateReplyOptions */
/** @typedef {{ models?: RawOllamaModel[], message?: { content?: unknown }, error?: unknown, status?: unknown }} OllamaResponseBody */

/** @param {RawOllamaModel} model @returns {NormalizedModel | null} */
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
    details: details && typeof details === 'object'
      ? {
          format: typeof details.format === 'string' ? details.format : null,
          family: typeof details.family === 'string' ? details.family : null,
          parameterSize: typeof details.parameter_size === 'string' ? details.parameter_size : null,
          quantizationLevel: typeof details.quantization_level === 'string' ? details.quantization_level : null,
        }
      : null,
  };
}

/** @param {string} path @param {RequestInit} options @param {number} timeoutMs @returns {Promise<Response>} */
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
  return {
    provider: value.provider,
    enabled: value.enabled,
    baseUrl: value.baseUrl,
    model: value.model,
    timeoutMs: value.timeoutMs,
    systemPrompt: value.systemPrompt,
  };
}

/** @returns {Promise<ModelInventory>} */
export async function getLocalModelInventory() {
  const value = getAiConfig();
  if (value.provider !== 'ollama_local') {
    return { runtime: 'ollama', available: false, status: 'UNAVAILABLE', models: [], error: 'Local model inventory is unavailable for the selected external provider' };
  }

  try {
    const response = await ollamaRequest('/api/tags');
    /** @type {OllamaResponseBody} */
    const body = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(body?.models)) {
      return { runtime: 'ollama', available: false, status: 'UNAVAILABLE', models: [], error: `HTTP ${response.status}` };
    }
    return {
      runtime: 'ollama',
      available: true,
      status: 'READY',
      models: body.models.map(normalizeModel).filter((model) => model !== null),
      error: null,
    };
  } catch (error) {
    return {
      runtime: 'ollama',
      available: false,
      status: 'UNAVAILABLE',
      models: [],
      error: error instanceof Error && error.name === 'AbortError'
        ? 'Ollama request timed out'
        : 'Ollama unavailable',
    };
  }
}

export async function getLlmProviderStatus() {
  const value = getAiConfig();
  const inventory = await getLocalModelInventory();
  const names = inventory.models.map((model) => model.name);
  return {
    provider: value.provider,
    reachable: value.provider === 'ollama_local' ? inventory.available : true,
    error: value.provider === 'ollama_local' ? inventory.error : null,
    models: names,
    inventory: inventory.models,
    selectedModelAvailable: value.provider === 'ollama_local' ? names.includes(value.model) : null,
  };
}

/** @param {string} name @returns {Promise<{ model: string, runtime: 'ollama', status: 'UPDATED', providerStatus: unknown }>} */
async function updateLocalModelInternal(name) {
  const response = await ollamaRequest('/api/pull', {
    method: 'POST',
    body: JSON.stringify({ model: name, stream: false }),
  }, MODEL_UPDATE_TIMEOUT_MS);
  /** @type {OllamaResponseBody} */
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`[KassisT LLM] LLM_MODEL_UPDATE_FAILED provider=ollama model=${name}`);
    throw new Error(`Ollama model update failed (${response.status})`);
  }
  console.log(`[KassisT LLM] LLM_MODEL_UPDATE_COMPLETED provider=ollama model=${name}`);
  return { model: name, runtime: 'ollama', status: 'UPDATED', providerStatus: body?.status ?? 'success' };
}

/** @param {string} model */
export async function updateLocalModel(model) {
  const value = getAiConfig();
  if (value.provider !== 'ollama_local') throw new Error('Local model updates require the ollama_local provider');

  const name = String(model ?? '').trim();
  if (!name) throw new Error('Model name is required');
  if (updateInProgress) throw new Error('Another model update is already running');

  updateInProgress = true;
  console.log(`[KassisT LLM] LLM_MODEL_UPDATE_STARTED provider=ollama model=${name}`);
  try {
    return await updateLocalModelInternal(name);
  } finally {
    updateInProgress = false;
  }
}

export async function updateAllLocalModels() {
  const value = getAiConfig();
  if (value.provider !== 'ollama_local') throw new Error('Local model updates require the ollama_local provider');
  if (updateInProgress) throw new Error('Another model update is already running');
  updateInProgress = true;
  try {
    const inventory = await getLocalModelInventory();
    if (!inventory.available) throw new Error(inventory.error || 'Ollama unavailable');

    /** @type {{ model: string, runtime: 'ollama', status: 'UPDATED', providerStatus: unknown }[]} */
    const updated = [];
    /** @type {{ model: string, status: 'FAILED', error: string }[]} */
    const failed = [];
    for (const item of inventory.models) {
      try {
        console.log(`[KassisT LLM] LLM_MODEL_UPDATE_STARTED provider=ollama model=${item.name}`);
        updated.push(await updateLocalModelInternal(item.name));
      } catch {
        failed.push({ model: item.name, status: 'FAILED', error: 'Model update failed' });
      }
    }
    return { updated, failed };
  } finally {
    updateInProgress = false;
  }
}

export function isModelUpdateInProgress() {
  return updateInProgress;
}

/** @param {ChatMessage[]} messages @param {GenerateReplyOptions} options */
export async function generateReply(messages, options = {}) {
  const value = getAiConfig();
  if (!value.enabled) throw new Error('LLM auto-reply is disabled');

  const systemPrompt = typeof options.systemPrompt === 'string' && options.systemPrompt.trim()
    ? options.systemPrompt.trim()
    : value.systemPrompt;
  const sanitizedMessages = messages.filter(
    (message) => message.role !== 'system'
  );

  /** @type {ChatMessage[]} */
  const finalMessages = [
    { role: 'system', content: systemPrompt },
    ...sanitizedMessages,
  ];

  if (value.provider === 'groq') {
    const credential = getCredential('GROQ_API_KEY');

    if (!credential) {
      throw new Error('Groq API key is not configured');
    }

    return generateGroqReply({
      credential,
      model: value.model,
      messages: finalMessages,
      timeoutMs: value.timeoutMs,
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), value.timeoutMs);

  try {
    const payload = {
      model: value.model,
      messages: finalMessages,
      stream: false,
      think: false,
    };

    const response = await fetch(`${value.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    /** @type {OllamaResponseBody} */
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`Local LLM request failed (${response.status})${body && typeof body.error === 'string' ? `: ${body.error}` : ''}`);
    const content = body?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Local LLM returned an empty response');
    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}
