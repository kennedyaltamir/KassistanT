import { getAiConfig } from './ai-config.mjs';

const MODEL_UPDATE_TIMEOUT_MS = 300000;
let updateInProgress = false;

/** @typedef {{ role: 'system' | 'user' | 'assistant', content: string }} ChatMessage */

function normalizeModel(model) {
  const name = typeof model?.name === 'string' ? model.name.trim() : '';
  if (!name) return null;
  return {
    name,
    identifier: name,
    runtime: 'ollama',
    status: 'INSTALLED',
    available: true,
    sizeBytes: Number.isFinite(Number(model.size)) ? Number(model.size) : null,
    digest: typeof model.digest === 'string' ? model.digest : null,
    modifiedAt: typeof model.modified_at === 'string' ? model.modified_at : null,
    details: model.details && typeof model.details === 'object'
      ? {
          format: typeof model.details.format === 'string' ? model.details.format : null,
          family: typeof model.details.family === 'string' ? model.details.family : null,
          parameterSize: typeof model.details.parameter_size === 'string' ? model.details.parameter_size : null,
          quantizationLevel: typeof model.details.quantization_level === 'string' ? model.details.quantization_level : null,
        }
      : null,
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
  return {
    enabled: value.enabled,
    baseUrl: value.baseUrl,
    model: value.model,
    timeoutMs: value.timeoutMs,
    systemPrompt: value.systemPrompt,
  };
}

export async function getLocalModelInventory() {
  try {
    const response = await ollamaRequest('/api/tags');
    const body = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(body?.models)) {
      return { runtime: 'ollama', available: false, status: 'UNAVAILABLE', models: [], error: `HTTP ${response.status}` };
    }
    return {
      runtime: 'ollama',
      available: true,
      status: 'READY',
      models: body.models.map(normalizeModel).filter(Boolean),
      error: null,
    };
  } catch (error) {
    return {
      runtime: 'ollama',
      available: false,
      status: 'UNAVAILABLE',
      models: [],
      error: error && typeof error === 'object' && error.name === 'AbortError'
        ? 'Ollama request timed out'
        : 'Ollama unavailable',
    };
  }
}

export async function getLlmProviderStatus() {
  const inventory = await getLocalModelInventory();
  const names = inventory.models.map(model => model.name);
  const value = getAiConfig();
  return {
    reachable: inventory.available,
    error: inventory.error,
    models: names,
    inventory: inventory.models,
    selectedModelAvailable: names.includes(value.model),
  };
}

async function updateLocalModelInternal(name) {
  const response = await ollamaRequest('/api/pull', {
    method: 'POST',
    body: JSON.stringify({ model: name, stream: false }),
  }, MODEL_UPDATE_TIMEOUT_MS);
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
  try {
    return await updateLocalModelInternal(name);
  } finally {
    updateInProgress = false;
  }
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

export async function generateReply(messages, options = {}) {
  const value = getAiConfig();
  if (!value.enabled) throw new Error('Local LLM auto-reply is disabled');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), value.timeoutMs);

  try {
    const systemPrompt = typeof options.systemPrompt === 'string' && options.systemPrompt.trim()
      ? options.systemPrompt.trim()
      : value.systemPrompt;
    const payload = {
      model: value.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages.filter(message => message.role !== 'system')],
      stream: false,
      think: false,
    };

    const response = await fetch(`${value.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`Local LLM request failed (${response.status})${body && typeof body.error === 'string' ? `: ${body.error}` : ''}`);
    const content = body?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Local LLM returned an empty response');
    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}
