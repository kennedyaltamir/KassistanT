import { getAiConfig } from './ai-config.mjs';

const MODEL_UPDATE_TIMEOUT_MS = 300000;
const CHAT_MAX_MESSAGES = 50;
const CHAT_MAX_CONTENT_CHARS = 12000;
const MODEL_NAME_PATTERN = /^[A-Za-z0-9._/-]+(?::[A-Za-z0-9._-]+)?$/;
let updateInProgress = false;

/** @typedef {{ role: 'system' | 'user' | 'assistant' | 'tool', content: string, [key: string]: unknown }} ChatMessage */
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

/** @param {string} model */
function validateModelName(model) {
  const name = String(model ?? '').trim();
  if (!name) throw new Error('Model name is required');
  if (name.length > 200 || !MODEL_NAME_PATTERN.test(name)) {
    throw new Error('Invalid Ollama model name');
  }
  return name;
}

/** @param {string} path @param {RequestInit} options @param {number} timeoutMs @returns {Promise<Response>} */
async function ollamaRequest(path, options = {}, timeoutMs = 10000) {
  const value = getAiConfig();
  const controller = new AbortController();
  const effectiveTimeout = Math.min(Math.max(1000, timeoutMs), MODEL_UPDATE_TIMEOUT_MS);
  const timer = setTimeout(() => controller.abort(), effectiveTimeout);
  try {
    return await fetch(`${value.baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Ollama request timed out');
    }
    throw error;
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

/** @returns {Promise<ModelInventory>} */
export async function getLocalModelInventory() {
  try {
    const response = await ollamaRequest('/api/tags');
    /** @type {OllamaResponseBody | null} */
    const body = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(body?.models)) {
      const providerError = typeof body?.error === 'string' ? body.error : `HTTP ${response.status}`;
      return { runtime: 'ollama', available: false, status: 'UNAVAILABLE', models: [], error: providerError };
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
      error: error instanceof Error ? error.message : 'Ollama unavailable',
    };
  }
}

export async function getLlmProviderStatus() {
  const inventory = await getLocalModelInventory();
  const names = inventory.models.map((model) => model.name);
  const value = getAiConfig();
  return {
    reachable: inventory.available,
    error: inventory.error,
    models: names,
    inventory: inventory.models,
    selectedModel: value.model,
    selectedModelAvailable: inventory.available && names.includes(value.model),
  };
}

export async function getLlmHealth() {
  const provider = await getLlmProviderStatus();
  return {
    runtime: 'ollama',
    status: provider.reachable && provider.selectedModelAvailable ? 'READY' : 'DEGRADED',
    reachable: provider.reachable,
    selectedModel: provider.selectedModel,
    selectedModelAvailable: provider.selectedModelAvailable,
    error: provider.error,
  };
}

/** @param {string} name @returns {Promise<{ model: string, runtime: 'ollama', status: 'UPDATED', providerStatus: unknown }>} */
async function updateLocalModelInternal(name) {
  const modelName = validateModelName(name);
  const response = await ollamaRequest('/api/pull', {
    method: 'POST',
    body: JSON.stringify({ model: modelName, stream: false }),
  }, MODEL_UPDATE_TIMEOUT_MS);
  /** @type {OllamaResponseBody | null} */
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof body?.error === 'string' ? `: ${body.error}` : '';
    console.error(`[KassisT LLM] LLM_MODEL_UPDATE_FAILED provider=ollama model=${modelName}`);
    throw new Error(`Ollama model update failed (${response.status})${detail}`);
  }
  console.log(`[KassisT LLM] LLM_MODEL_UPDATE_COMPLETED provider=ollama model=${modelName}`);
  return { model: modelName, runtime: 'ollama', status: 'UPDATED', providerStatus: body?.status ?? 'success' };
}

/** @param {string} model */
export async function updateLocalModel(model) {
  const name = validateModelName(model);
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

    /** @type {{ model: string, runtime: 'ollama', status: 'UPDATED', providerStatus: unknown }[]} */
    const updated = [];
    /** @type {{ model: string, status: 'FAILED', error: string }[]} */
    const failed = [];
    for (const item of inventory.models) {
      try {
        console.log(`[KassisT LLM] LLM_MODEL_UPDATE_STARTED provider=ollama model=${item.name}`);
        updated.push(await updateLocalModelInternal(item.name));
      } catch (error) {
        failed.push({
          model: item.name,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Model update failed',
        });
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
  if (!value.enabled) throw new Error('Local LLM auto-reply is disabled');
  if (!Array.isArray(messages)) throw new Error('LLM messages must be an array');

  const normalizedMessages = messages
    .filter((message) => message && typeof message === 'object')
    .filter((message) => message.role !== 'system')
    .filter((message) => ['user', 'assistant', 'tool'].includes(message.role))
    .map((message) => ({
      role: message.role,
      content: String(message.content ?? '').trim(),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-CHAT_MAX_MESSAGES);

  if (!normalizedMessages.length) throw new Error('At least one non-empty chat message is required');
  if (normalizedMessages.some((message) => message.content.length > CHAT_MAX_CONTENT_CHARS)) {
    throw new Error('LLM message content exceeds the configured safety limit');
  }

  const systemPrompt = typeof options.systemPrompt === 'string' && options.systemPrompt.trim()
    ? options.systemPrompt.trim()
    : value.systemPrompt;
  if (systemPrompt.length > CHAT_MAX_CONTENT_CHARS) throw new Error('System prompt exceeds the configured safety limit');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), value.timeoutMs);

  try {
    const payload = {
      model: value.model,
      messages: [{ role: 'system', content: systemPrompt }, ...normalizedMessages],
      stream: false,
      think: false,
    };

    let response;
    try {
      response = await fetch(`${value.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Local LLM request timed out');
      }
      throw new Error(`Unable to reach local Ollama: ${error instanceof Error ? error.message : String(error)}`);
    }

    /** @type {OllamaResponseBody | null} */
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = typeof body?.error === 'string' ? `: ${body.error}` : '';
      throw new Error(`Local LLM request failed (${response.status})${detail}`);
    }
    const content = body?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Local LLM returned an empty response');
    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}
