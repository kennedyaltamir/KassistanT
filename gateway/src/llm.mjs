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
