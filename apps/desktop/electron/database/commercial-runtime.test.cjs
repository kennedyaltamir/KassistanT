const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { startPersistenceServer } = require('./runtime.cjs');

async function createServer() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kassist-commerce-'));
  const runtime = startPersistenceServer({
    filePath: path.join(dir, 'kassist.sqlite'),
    migrationsPath: path.resolve(__dirname, '../../database/migrations'),
    host: '127.0.0.1',
    port: 0,
    storeId: 'test-store',
    storeName: 'Teste'
  });
  await new Promise((resolve) => runtime.server.once('listening', resolve));
  const port = runtime.server.address().port;
  return { runtime, dir, base: `http://127.0.0.1:${port}` };
}

async function call(base, pathName, options = {}) {
  const response = await fetch(`${base}${pathName}`, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
  return body;
}

test('commercial runtime persists product, customer and delivery fee in order', async () => {
  const ctx = await createServer();
  try {
    const business = await call(ctx.base, '/internal/v1/business', { method: 'PUT', body: JSON.stringify({ delivery_enabled: true, delivery_fee_cents: 350, min_order_cents: 0, business_form: { tone: 'profissional' } }) });
    assert.equal(business.deliveryFeeCents, 350);

    const product = await call(ctx.base, '/internal/v1/products', { method: 'POST', body: JSON.stringify({ id: 'p1', name: 'Picolé Chocolate', price_cents: 1000, available: true }) });
    assert.equal(product.product.id, 'p1');

    const order = await call(ctx.base, '/internal/v1/orders', { method: 'POST', body: JSON.stringify({ jid: '5511999999999@s.whatsapp.net', customer_name: 'Maria', email: 'maria@example.com', items: [{ product_id: 'p1', quantity: 2 }], delivery_type: 'DELIVERY', address: { street: 'Rua A', number: '10', neighborhood: 'Centro', city: 'Pomeu', state: 'MG', postal_code: '35680000' }, payment_method: 'PIX' }) });
    assert.equal(order.order.subtotal_cents, 2000);
    assert.equal(order.order.delivery_fee_cents, 350);
    assert.equal(order.order.total_cents, 2350);

    const dashboard = await call(ctx.base, '/internal/v1/dashboard');
    assert.equal(dashboard.customers, 1);
    assert.equal(dashboard.salesToday.count, 1);
    assert.equal(dashboard.salesToday.totalCents, 2350);
  } finally {
    await new Promise((resolve) => ctx.runtime.server.close(resolve));
    ctx.runtime.database.close();
    fs.rmSync(ctx.dir, { recursive: true, force: true });
  }
});
