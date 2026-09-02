import { getAiConfig } from './ai-config.mjs';
import { getCredential } from './credentials.mjs';

const MODEL_UPDATE_TIMEOUT_MS = 300000;
const CHAT_MAX_MESSAGES = 50;
const CHAT_MAX_CONTENT_CHARS = 12000;
const MODEL_NAME_PATTERN = /^[A-Za-z0-9._\/-]+(?::[A-Za-z0-9._-]+)?$/;
let updateInProgress = false;

const PROVIDERS = {
  ollama: { credential: null, baseUrl: null, modelsPath: '/api/tags', chatPath: '/api/chat' },
  groq: { credential: 'GROQ_API_KEY', baseUrl: 'https://api.groq.com/openai/v1', modelsPath: '/models', chatPath: '/chat/completions' },
  gemini: { credential: 'GEMINI_API_KEY', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', modelsPath: '/models', chatPath: '/chat/completions' },
  mistral: { credential: 'MISTRAL_API_KEY', baseUrl: 'https://api.mistral.ai/v1', modelsPath: '/models', chatPath: '/chat/completions' },
};

const DEFAULT_MODELS = { groq: 'openai/gpt-oss-120b', gemini: 'gemini-3.7-flash', mistral: 'mistral-small-latest' };

function validateModelName(model) {
  const name = String(model ?? '').trim();
  if (!name || name.length > 200 || !MODEL_NAME_PATTERN.test(name)) throw new Error('Invalid model name');
  return name;
}

function timeoutSignal(timeoutMs) {
  return AbortSignal.timeout(Math.min(300000, Math.max(1000, Number(timeoutMs) || 10000)));
}

async function fetchJson(url, options = {}, timeoutMs = 10000) {
  let response;
  try {
    response = await fetch(url, { ...options, signal: options.signal ?? timeoutSignal(timeoutMs) });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('LLM request timed out');
    throw error;
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof body?.error === 'string' ? `: ${body.error}` : '';
    throw new Error(`HTTP ${response.status}${detail}`);
  }
  return body;
}

function externalModel(provider, configured) {
  const model = configured === 'qwen3:14b' ? DEFAULT_MODELS[provider] : configured;
  return validateModelName(model);
}

function providerCandidates(config) {
  return [...new Set([config.provider, ...config.fallbackProviders, 'ollama'])].filter((provider) => PROVIDERS[provider]);
}

function providerCredential(provider) {
  const key = PROVIDERS[provider]?.credential;
  return key ? getCredential(key) : null;
}

export function getLlmStatus() {
  const value = getAiConfig();
  return { ...value, model: value.model };
}

function normalizeOllamaDetails(details) {
  if (!details || typeof details !== 'object') return null;
  return {
    format: typeof details.format === 'string' ? details.format : null,
    family: typeof details.family === 'string' ? details.family : null,
    parameterSize: typeof details.parameter_size === 'string' ? details.parameter_size : null,
    quantizationLevel: typeof details.quantization_level === 'string' ? details.quantization_level : null,
  };
}

export async function getLocalModelInventory() {
  try {
    const value = getAiConfig();
    const response = await fetchJson(`${value.baseUrl}/api/tags`, {}, value.timeoutMs);
    const models = Array.isArray(response?.models) ? response.models.map((model) => ({
      name: typeof model?.name === 'string' ? model.name.trim() : '',
      identifier: typeof model?.name === 'string' ? model.name.trim() : '',
      runtime: 'ollama',
      status: 'INSTALLED',
      available: true,
      sizeBytes: Number.isFinite(Number(model?.size)) ? Number(model.size) : null,
      digest: typeof model?.digest === 'string' ? model.digest : null,
      modifiedAt: typeof model?.modified_at === 'string' ? model.modified_at : null,
      details: normalizeOllamaDetails(model?.details),
    })).filter((model) => model.name) : [];
    return { runtime: 'ollama', available: true, reachable: true, status: 'READY', models, error: null };
  } catch (error) {
    return { runtime: 'ollama', available: false, reachable: false, status: 'UNAVAILABLE', models: [], error: error instanceof Error ? error.message : String(error) };
  }
}

async function externalHealth(provider) {
  const definition = PROVIDERS[provider];
  const key = providerCredential(provider);
  if (!definition || !key) return { provider, configured: Boolean(key), reachable: false, error: key ? null : 'Credential not configured', models: [] };
  try {
    const body = await fetchJson(`${definition.baseUrl}${definition.modelsPath}`, { headers: { Authorization: `Bearer ${key}` } }, 8000);
    const models = Array.isArray(body?.data) ? body.data.map((item) => item?.id).filter((id) => typeof id === 'string') : [];
    return { provider, configured: true, reachable: true, error: null, models };
  } catch (error) {
    return { provider, configured: true, reachable: false, error: error instanceof Error ? error.message : String(error), models: [] };
  }
}

export async function getLlmProviderStatus() {
  const config = getAiConfig();
  const results = [];
  for (const provider of providerCandidates(config)) {
    results.push(provider === 'ollama' ? { provider, ...(await getLocalModelInventory()), configured: true } : await externalHealth(provider));
  }
  const selected = results.find((item) => item.provider === config.provider) ?? results[0];
  const selectedModel = config.provider === 'ollama' ? config.model : externalModel(config.provider, config.model);
  const selectedModelAvailable = Boolean(selected?.reachable && (selected.provider === 'ollama' ? selected.models.some((item) => item.name === selectedModel) : selected.models.length === 0 || selected.models.includes(selectedModel)));
  return { selectedProvider: config.provider, selectedModel, selectedModelAvailable, reachable: Boolean(selected?.reachable), error: selected?.error ?? null, providers: results };
}

export async function getLlmHealth() {
  const status = await getLlmProviderStatus();
  return { status: status.reachable && status.selectedModelAvailable ? 'READY' : 'DEGRADED', ...status };
}

async function updateLocalModelInternal(name) {
  const modelName = validateModelName(name);
  const config = getAiConfig();
  const body = await fetchJson(`${config.baseUrl}/api/pull`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: modelName, stream: false }) }, MODEL_UPDATE_TIMEOUT_MS);
  console.log(`[KassisT LLM] LLM_MODEL_UPDATE_COMPLETED provider=ollama model=${modelName}`);
  return { model: modelName, runtime: 'ollama', status: 'UPDATED', providerStatus: body?.status ?? 'success' };
}

export async function updateLocalModel(model) {
  const name = validateModelName(model);
  if (updateInProgress) throw new Error('Another model update is already running');
  updateInProgress = true;
  try { return await updateLocalModelInternal(name); } finally { updateInProgress = false; }
}

export async function updateAllLocalModels() {
  if (updateInProgress) throw new Error('Another model update is already running');
  updateInProgress = true;
  try {
    const inventory = await getLocalModelInventory();
    if (!inventory.available) throw new Error(inventory.error || 'Ollama unavailable');
    const updated = []; const failed = [];
    for (const item of inventory.models) {
      try { updated.push(await updateLocalModelInternal(item.name)); }
      catch (error) { failed.push({ model: item.name, status: 'FAILED', error: error instanceof Error ? error.message : String(error) }); }
    }
    return { updated, failed };
  } finally { updateInProgress = false; }
}

export function isModelUpdateInProgress() { return updateInProgress; }

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) throw new Error('LLM messages must be an array');
  const result = messages.filter((message) => message && typeof message === 'object')
    .filter((message) => ['system', 'user', 'assistant', 'tool'].includes(message.role))
    .map((message) => ({ role: message.role, content: typeof message.content === 'string' ? message.content.trim() : message.content }))
    .filter((message) => Array.isArray(message.content) || (typeof message.content === 'string' && message.content.length > 0))
    .slice(-CHAT_MAX_MESSAGES);
  if (!result.length) throw new Error('At least one non-empty chat message is required');
  return result;
}

function openAiContent(messages) {
  return messages.map((message) => {
    if (typeof message.content === 'string') return message;
    return { role: message.role, content: message.content };
  });
}

async function chatOllama(messages, systemPrompt, config, imageBase64 = null) {
  const prepared = [{ role: 'system', content: systemPrompt }, ...messages];
  if (imageBase64) {
    const last = prepared[prepared.length - 1];
    if (last?.role === 'user' && typeof last.content === 'string') {
      prepared[prepared.length - 1] = { ...last, images: [imageBase64] };
    }
  }
  const response = await fetchJson(`${config.baseUrl}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: config.model, messages: prepared, stream: false, think: false }) }, config.timeoutMs);
  const content = response?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('Ollama returned an empty response');
  return content.trim();
}

async function chatExternal(provider, messages, systemPrompt, config, imageDataUrl = null) {
  const definition = PROVIDERS[provider]; const credential = providerCredential(provider);
  if (!credential) throw new Error(`${provider} credential is not configured`);
  const model = externalModel(provider, config.model);
  let userMessages = messages;
  if (imageDataUrl) {
    const idx = userMessages.length - 1;
    if (idx >= 0 && userMessages[idx].role === 'user') {
      userMessages = [...userMessages];
      const text = typeof userMessages[idx].content === 'string' ? userMessages[idx].content : '';
      userMessages[idx] = { role: 'user', content: [{ type: 'text', text }, { type: 'image_url', image_url: { url: imageDataUrl } }] };
    }
  }
  const response = await fetchJson(`${definition.baseUrl}${definition.chatPath}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${credential}` },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, ...openAiContent(userMessages)], temperature: 0.2 }),
  }, config.timeoutMs);
  const content = response?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error(`${provider} returned an empty response`);
  return content.trim();
}

export async function generateReply(messages, options = {}) {
  const config = getAiConfig();
  if (!config.enabled) throw new Error('LLM auto-reply is disabled');
  const normalizedMessages = normalizeMessages(messages);
  if (normalizedMessages.some((message) => typeof message.content === 'string' && message.content.length > CHAT_MAX_CONTENT_CHARS)) throw new Error('LLM message content exceeds the configured safety limit');
  const systemPrompt = typeof options.systemPrompt === 'string' && options.systemPrompt.trim() ? options.systemPrompt.trim() : config.systemPrompt;
  const candidates = providerCandidates(config);
  const imageDataUrl = typeof options.imageDataUrl === 'string' ? options.imageDataUrl : null;
  const errors = [];
  for (const provider of candidates) {
    try {
      const reply = provider === 'ollama' ? await chatOllama(normalizedMessages.filter((m) => m.role !== 'system'), systemPrompt, config, imageDataUrl ? imageDataUrl.split(',')[1] : null) : await chatExternal(provider, normalizedMessages.filter((m) => m.role !== 'system'), systemPrompt, config, imageDataUrl);
      console.log(`[KassisT LLM] reply provider=${provider} model=${provider === 'ollama' ? config.model : externalModel(provider, config.model)}`);
      return reply;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      errors.push(`${provider}: ${detail}`);
      console.warn(`[KassisT LLM] provider failed provider=${provider}: ${detail}`);
    }
  }
  throw new Error(`All configured LLM providers failed: ${errors.join(' | ')}`);
}
