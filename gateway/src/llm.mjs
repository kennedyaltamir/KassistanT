import { getAiConfig } from './ai-config.mjs';

/** @typedef {{ role: 'system' | 'user' | 'assistant', content: string }} ChatMessage */

/** @returns {{ enabled: boolean, baseUrl: string, model: string, timeoutMs: number, systemPrompt: string }} */
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

async function ollamaRequest(path, options = {}, timeoutMs = 10000) {
  const value = getAiConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, 30000));
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

export async function getLlmProviderStatus() {
  try {
    const response = await ollamaRequest('/api/tags');
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return { reachable: false, error: `HTTP ${response.status}`, models: [], selectedModelAvailable: false };
    }
    const models = Array.isArray(body?.models)
      ? body.models.map(model => typeof model?.name === 'string' ? model.name : '').filter(Boolean)
      : [];
    const value = getAiConfig();
    return {
      reachable: true,
      error: null,
      models,
      selectedModelAvailable: models.includes(value.model),
    };
  } catch (error) {
    return {
      reachable: false,
      error: error instanceof Error ? error.message : String(error),
      models: [],
      selectedModelAvailable: false,
    };
  }
}

export async function updateLocalModel(model) {
  const name = String(model ?? '').trim();
  if (!name) throw new Error('Model name is required');

  const response = await ollamaRequest('/api/pull', {
    method: 'POST',
    body: JSON.stringify({ name, stream: false }),
  }, 300000);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body && typeof body.error === 'string' ? `: ${body.error}` : '';
    throw new Error(`Ollama model update failed (${response.status})${detail}`);
  }

  return { model: name, status: body?.status ?? 'updated' };
}

export async function updateAllLocalModels() {
  const status = await getLlmProviderStatus();
  if (!status.reachable) {
    throw new Error(status.error || 'Ollama indisponível');
  }

  const updated = [];
  const failed = [];
  for (const model of status.models) {
    try {
      updated.push(await updateLocalModel(model));
    } catch (error) {
      failed.push({
        model,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { updated, failed };
}

/**
 * @param {ChatMessage[]} messages
 * @param {{ systemPrompt?: string }} [options]
 * @returns {Promise<string>}
 */
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
      messages: /** @type {ChatMessage[]} */ ([
        { role: 'system', content: systemPrompt },
        ...messages.filter(message => message.role !== 'system'),
      ]),
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
    if (!response.ok) {
      const detail = body && typeof body.error === 'string' ? `: ${body.error}` : '';
      throw new Error(`Local LLM request failed (${response.status})${detail}`);
    }

    const content = body?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('Local LLM returned an empty response');
    }

    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}
