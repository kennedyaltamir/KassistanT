import { randomUUID } from 'node:crypto';

const PERSISTENCE_BASE = (process.env.KASSIST_PERSISTENCE_URL ?? 'http://127.0.0.1:3211/internal/v1/whatsapp/message')
  .replace(/\/internal\/v1\/whatsapp\/message\/?$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${PERSISTENCE_BASE}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
    signal: options.signal ?? AbortSignal.timeout(8000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body?.error === 'string' ? body.error : `Persistence HTTP ${response.status}`);
  return body;
}

export async function getBusiness() {
  return request('/internal/v1/business');
}

export async function updateBusiness(patch) {
  return request('/internal/v1/business', { method: 'PUT', body: JSON.stringify(patch) });
}

export async function listProducts() {
  return request('/internal/v1/products');
}

export async function createProduct(product) {
  return request('/internal/v1/products', { method: 'POST', body: JSON.stringify({ id: randomUUID(), ...product }) });
}

export async function updateProduct(id, patch) {
  return request(`/internal/v1/products/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch) });
}

export async function deleteProduct(id) {
  return request(`/internal/v1/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function listCustomers() {
  return request('/internal/v1/customers');
}

export async function getCustomerByJid(jid) {
  return request(`/internal/v1/customers/by-phone?phone=${encodeURIComponent(jid)}`);
}

export async function updateCustomer(id, patch) {
  return request(`/internal/v1/customers/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch) });
}

export async function createOrder(input) {
  return request('/internal/v1/orders', { method: 'POST', body: JSON.stringify(input) });
}

export async function listOrders() {
  return request('/internal/v1/orders');
}

export async function dashboard() {
  return request('/internal/v1/dashboard');
}

export async function buildBusinessContext() {
  const [business, products] = await Promise.all([getBusiness(), listProducts()]);
  const availableProducts = (products.products ?? []).filter(item => item.available !== false);
  return {
    business,
    products: availableProducts,
  };
}
