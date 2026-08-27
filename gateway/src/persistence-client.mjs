const PERSISTENCE_URL = process.env.KASSIST_PERSISTENCE_URL ?? 'http://127.0.0.1:3211/internal/v1/whatsapp/message';
const MAX_ATTEMPTS = 3;

/**
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
function normalizeEvent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Persistence event must be an object');
  }
  return /** @type {Record<string, unknown>} */ (value);
}

/**
 * @param {Record<string, unknown>} event
 * @returns {Promise<{ persisted: boolean, conversation_id?: string }>} 
 */
export async function persistWhatsAppMessage(event) {
  const body = JSON.stringify(normalizeEvent(event));
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(PERSISTENCE_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': String(Buffer.byteLength(body)),
        },
        body,
        signal: AbortSignal.timeout(3000),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof payload?.error === 'string'
            ? payload.error
            : `Persistence endpoint returned HTTP ${response.status}`
        );
      }
      return {
        persisted: payload?.persisted === true,
        conversation_id: typeof payload?.conversation_id === 'string' ? payload.conversation_id : undefined,
      };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 100));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export function getPersistenceUrl() {
  return PERSISTENCE_URL;
}
