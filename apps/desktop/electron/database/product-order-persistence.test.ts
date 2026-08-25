import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { Order } from "../../../../packages/domain/src/index.js";
import { SQLiteOrderRepository, SQLiteProductRepository, type ProductRecord } from "./product-order-repository.js";
import { SQLiteDatabase } from "./sqlite-database.js";

const DOMAIN = "../../../../packages/domain/src/index.js";

async function openTestDatabase() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-c1-"));
  const filePath = path.join(directory, "kassist.sqlite");
  const migrationsPath = path.resolve(__dirname, "../../database/migrations");
  const database = await SQLiteDatabase.open({ filePath, migrationsPath, applicationVersion: "test" });
  return { database, directory, filePath, migrationsPath };
}

function seedOrderContext(database: SQLiteDatabase): void {
  const now = new Date().toISOString();
  database.execute(`INSERT INTO store (id, name) VALUES (?, ?)`, "store-c1", "Test Store");
  database.execute(
    `INSERT INTO customer (
       id, store_id, phone_normalized, name, notes, first_order_at, last_order_at,
       order_count, total_spent_cents, currency, status, created_at, updated_at
     ) VALUES (?, ?, ?, ?, NULL, NULL, NULL, 0, 0, 'BRL', 'ACTIVE', ?, ?)`,
    "customer-c1", "store-c1", "+5511999999999", "Test Customer", now, now
  );
  database.execute(
    `INSERT INTO conversation (
       id, store_id, customer_id, external_thread_id, lifecycle_state,
       ownership, ai_state, unread_count, created_at, updated_at
     ) VALUES (?, ?, ?, ?, 'OPEN', 'AI', 'ACTIVE', 0, ?, ?)`,
    "conversation-c1", "store-c1", "customer-c1", "thread-c1", now, now
  );
}

async function buildFixtureOrder(productId: string): Promise<Order> {
  const { addMoney, createMoney, generateUuidV7, Order } = await import(DOMAIN);
  const modifier = { id: generateUuidV7(1_759_100_000_200), name: "Cheese", quantity: 1, price: createMoney(250) };
  const item = {
    id: generateUuidV7(1_759_100_000_300),
    product_id: productId,
    name: "Burger",
    quantity: 2,
    unit_price: createMoney(1500),
    modifiers: [modifier]
  };
  const total = addMoney(createMoney(item.unit_price.amount_cents * item.quantity), modifier.price);
  return Order.createDraft("store-c1", [item], total, {
    customer_id: "customer-c1",
    conversation_id: "conversation-c1"
  });
}

function product(generateUuidV7: (seed?: number) => string, createMoney: (amount: number) => { amount_cents: number; currency: "BRL" }): ProductRecord {
  return { id: generateUuidV7(1_759_100_000_100), store_id: "store-c1", name: "Burger", price: createMoney(1500) };
}

test("Product persistence survives close and reopen", async () => {
  const ctx = await openTestDatabase();
  try {
    seedOrderContext(ctx.database);
    const { createMoney, generateUuidV7 } = await import(DOMAIN);
    const repo = new SQLiteProductRepository(ctx.database);
    const expected = product(generateUuidV7, createMoney);
    repo.create(expected);
    assert.deepEqual(repo.getById(expected.id), { ...expected, category_id: null, description: null, available: true });
    ctx.database.close();

    const reopened = await SQLiteDatabase.open({ filePath: ctx.filePath, migrationsPath: ctx.migrationsPath, applicationVersion: "test" });
    try {
      const recovered = new SQLiteProductRepository(reopened).getById(expected.id);
      assert.deepEqual(recovered, { ...expected, category_id: null, description: null, available: true });
    } finally { reopened.close(); }
  } finally { await rm(ctx.directory, { recursive: true, force: true }); }
});

test("Confirmed Order, items and modifiers survive close and reopen", async () => {
  const ctx = await openTestDatabase();
  try {
    seedOrderContext(ctx.database);
    const { confirmOrder } = await import(DOMAIN);
    const { createMoney, generateUuidV7 } = await import(DOMAIN);
    const productRepo = new SQLiteProductRepository(ctx.database);
    const orderRepo = new SQLiteOrderRepository(ctx.database);
    const expectedProduct = product(generateUuidV7, createMoney);
    productRepo.create(expectedProduct);

    const draft = await buildFixtureOrder(expectedProduct.id);
    const confirmation = confirmOrder(draft, {
      confirmation: { final_summary: "Burger x2 with Cheese", confirmed: true },
      actor_context: Object.freeze({ actor_ref: "local-c1-test" })
    });
    assert.equal(confirmation.ok, true);
    if (!confirmation.ok) return;

    orderRepo.save(confirmation.order);
    assert.equal((await orderRepo.getById(confirmation.order.id))?.status, "CONFIRMED");
    ctx.database.close();

    const reopened = await SQLiteDatabase.open({ filePath: ctx.filePath, migrationsPath: ctx.migrationsPath, applicationVersion: "test" });
    try {
      const recoveredProduct = new SQLiteProductRepository(reopened).getById(expectedProduct.id);
      const recoveredOrder = await new SQLiteOrderRepository(reopened).getById(confirmation.order.id);
      assert.deepEqual(recoveredProduct, { ...expectedProduct, category_id: null, description: null, available: true });
      assert.ok(recoveredOrder);
      assert.equal(recoveredOrder?.status, "CONFIRMED");
      assert.deepEqual(recoveredOrder?.total, { amount_cents: 3250, currency: "BRL" });
      assert.equal(recoveredOrder?.items.length, 1);
      assert.equal(recoveredOrder?.items[0]?.name, "Burger");
      assert.equal(recoveredOrder?.items[0]?.quantity, 2);
      assert.deepEqual(recoveredOrder?.items[0]?.unit_price, { amount_cents: 1500, currency: "BRL" });
      assert.equal(recoveredOrder?.items[0]?.modifiers.length, 1);
      assert.equal(recoveredOrder?.items[0]?.modifiers[0]?.name, "Cheese");
    } finally { reopened.close(); }
  } finally { await rm(ctx.directory, { recursive: true, force: true }); }
});

test("Order persistence is atomic when modifier persistence fails", async () => {
  const ctx = await openTestDatabase();
  try {
    seedOrderContext(ctx.database);
    const { createMoney, generateUuidV7, Order } = await import(DOMAIN);
    const repo = new SQLiteOrderRepository(ctx.database);
    const duplicatedModifierId = generateUuidV7(1_759_100_001_500);
    const item = {
      id: generateUuidV7(1_759_100_001_100),
      product_id: generateUuidV7(1_759_100_001_050),
      name: "Burger",
      quantity: 1,
      unit_price: createMoney(1500),
      modifiers: [
        { id: duplicatedModifierId, name: "Cheese", quantity: 1, price: createMoney(250) },
        { id: duplicatedModifierId, name: "Bacon", quantity: 1, price: createMoney(300) }
      ]
    };
    const order = Order.createDraft("store-c1", [item], createMoney(2050), {
      customer_id: "customer-c1",
      conversation_id: "conversation-c1"
    });

    assert.throws(() => repo.save(order));
    assert.equal(await repo.getById(order.id), null);
    assert.equal(
      ctx.database.query<{ count: number }>(`SELECT COUNT(*) AS count FROM order_item_modifier WHERE id = ?`, duplicatedModifierId)[0]?.count,
      0
    );
  } finally {
    ctx.database.close();
    await rm(ctx.directory, { recursive: true, force: true });
  }
});
