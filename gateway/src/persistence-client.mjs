const PERSISTENCE_URL = process.env.KASSIST_PERSISTENCE_URL ?? 'http://127.0.0.1:3211/internal/v1/whatsapp/message';
const PERSISTENCE_BASE_URL = PERSISTENCE_URL.replace(/\/internal\/v1\/whatsapp\/message\/?$/, '');
const MAX_ATTEMPTS = 3;

function normalizeEvent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Persistence payload must be an object');
  return value;
}

async function request(path, options = {}) {
  const response = await fetch(`${PERSISTENCE_BASE_URL}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    signal: options.signal ?? AbortSignal.timeout(3000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === 'string' ? payload.error : `Persistence endpoint returned HTTP ${response.status}`);
  return payload;
}

export async function persistWhatsAppMessage(event) {
  const body = JSON.stringify(normalizeEvent(event));
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const payload = await request('/internal/v1/whatsapp/message', {
        method: 'POST',
        headers: { 'content-length': String(Buffer.byteLength(body)) },
        body,
      });
      return {
        persisted: payload?.persisted === true,
        conversation_id: typeof payload?.conversation_id === 'string' ? payload.conversation_id : undefined,
      };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, attempt * 100));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function getConversationContext(jid, limit = 50) {
  const value = String(jid ?? '').trim();
  if (!value) throw new Error('Conversation JID is required');
  return request(`/internal/v1/conversation-context?jid=${encodeURIComponent(value)}&limit=${encodeURIComponent(String(limit))}`);
}

export async function listPersistedConversations(limit = 100) {
  return request(`/internal/v1/conversations?limit=${encodeURIComponent(String(limit))}`);
}

export async function listProducts() {
  return request('/internal/v1/products');
}

export async function createProduct(product) {
  return request('/internal/v1/products', { method: 'POST', body: JSON.stringify(product) });
}

export async function getProduct(id) {
  return request(`/internal/v1/products/${encodeURIComponent(String(id))}`);
}

export async function updateProduct(id, product) {
  return request(`/internal/v1/products/${encodeURIComponent(String(id))}`, { method: 'PUT', body: JSON.stringify(product) });
}

export async function deleteProduct(id) {
  return request(`/internal/v1/products/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
}

export function getPersistenceUrl() {
  return PERSISTENCE_URL;
}
