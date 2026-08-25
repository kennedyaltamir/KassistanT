const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

/** @typedef {{ role: 'system' | 'user' | 'assistant', content: string }} ChatMessage */

/**
 * Execute one non-streaming Groq chat completion through the provider's
 * OpenAI-compatible Chat Completions endpoint.
 *
 * @param {{ credential: string, model: string, messages: ChatMessage[], timeoutMs: number }} input
 * @returns {Promise<string>}
 */
export async function generateGroqReply({ credential, model, messages, timeoutMs }) {
  const apiKey = String(credential ?? '').trim();
  const modelName = String(model ?? '').trim();
  if (!apiKey) throw new Error('Groq API key is not configured');
  if (!modelName) throw new Error('Groq model is required');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        stream: false,
      }),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = body && typeof body.error === 'object' && body.error && typeof body.error.message === 'string'
        ? `: ${body.error.message}`
        : '';
      throw new Error(`Groq LLM request failed (${response.status})${detail}`);
    }

    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('Groq LLM returned an empty response');
    }

    return content.trim();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Groq LLM request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export { GROQ_BASE_URL };
