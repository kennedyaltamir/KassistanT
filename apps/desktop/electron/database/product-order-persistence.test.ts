import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { addMoney, confirmOrder, createMoney, generateUuidV7, Order, type OrderItem, type OrderItemModifier } from "../../../../packages/domain/src/index.js";
import { SQLiteOrderRepository, SQLiteProductRepository, type ProductRecord } from "./product-order-repository.js";
import { SQLiteDatabase } from "./sqlite-database.js";

async function openTestDatabase() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-c1-"));
  const filePath = path.join(directory, "kassist.sqlite");
  const migrationsPath = path.resolve(__dirname, "../../database/migrations");
  const database = await SQLiteDatabase.open({
    filePath,
    migrationsPath,
    applicationVersion: "test"
  });
  return { database, directory, filePath, migrationsPath };
}

function product(): ProductRecord {
  return {
    id: generateUuidV7(1_759_100_000_100),
    store_id: "store-c1",
    name: "Burger",
    price: createMoney(1500)
  };
}

function modifier(): OrderItemModifier {
  return {
    id: generateUuidV7(1_759_100_000_200),
    name: "Cheese",
    quantity: 1,
    price: createMoney(250)
  };
}

function orderItem(): OrderItem {
  return {
    id: generateUuidV7(1_759_100_000_300),
    name: "Burger",
    quantity: 2,
    unit_price: createMoney(1500),
    modifiers: [modifier()]
  };
}

function draftOrder(): Order {
  const item = orderItem();
  const itemTotal = createMoney(item.unit_price.amount_cents * item.quantity);
  const modifierTotal = createMoney(250);
  const total = addMoney(itemTotal, modifierTotal);
  return Order.createDraft("store-c1", [item], total);
}

test("Product persistence survives close and reopen", async () => {
  const ctx = await openTestDatabase();
  try {
    const repo = new SQLiteProductRepository(ctx.database);
    const expected = product();
    repo.create(expected);
    assert.deepEqual(repo.getById(expected.id), expected);
    ctx.database.close();

    const reopened = await SQLiteDatabase.open({
      filePath: ctx.filePath,
      migrationsPath: ctx.migrationsPath,
      applicationVersion: "test"
    });
    try {
      const recovered = new SQLiteProductRepository(reopened).getById(expected.id);
      assert.deepEqual(recovered, expected);
    } finally {
      reopened.close();
    }
  } finally {
    await rm(ctx.directory, { recursive: true, force: true });
  }
});

test("Confirmed Order, items and modifiers survive close and reopen", async () => {
  const ctx = await openTestDatabase();
  try {
    const productRepo = new SQLiteProductRepository(ctx.database);
    const orderRepo = new SQLiteOrderRepository(ctx.database);
    const expectedProduct = product();
    productRepo.create(expectedProduct);

    const draft = draftOrder();
    const confirmation = confirmOrder(draft, {
      confirmation: { final_summary: "Burger x2 with Cheese", confirmed: true },
      actor_context: Object.freeze({ actor_ref: "local-c1-test" })
    });
    assert.equal(confirmation.ok, true);
    if (!confirmation.ok) return;

    orderRepo.save(confirmation.order);
    assert.equal(orderRepo.getById(confirmation.order.id)?.status, "CONFIRMED");
    ctx.database.close();

    const reopened = await SQLiteDatabase.open({
      filePath: ctx.filePath,
      migrationsPath: ctx.migrationsPath,
      applicationVersion: "test"
    });
    try {
      const recoveredProduct = new SQLiteProductRepository(reopened).getById(expectedProduct.id);
      const recoveredOrder = new SQLiteOrderRepository(reopened).getById(confirmation.order.id);

      assert.deepEqual(recoveredProduct, expectedProduct);
      assert.ok(recoveredOrder);
      assert.equal(recoveredOrder?.status, "CONFIRMED");
      assert.deepEqual(recoveredOrder?.total, { amount_cents: 3250, currency: "BRL" });
      assert.equal(recoveredOrder?.items.length, 1);
      assert.equal(recoveredOrder?.items[0]?.name, "Burger");
      assert.equal(recoveredOrder?.items[0]?.quantity, 2);
      assert.deepEqual(recoveredOrder?.items[0]?.unit_price, { amount_cents: 1500, currency: "BRL" });
      assert.equal(recoveredOrder?.items[0]?.modifiers.length, 1);
      assert.equal(recoveredOrder?.items[0]?.modifiers[0]?.name, "Cheese");
    } finally {
      reopened.close();
    }
  } finally {
    await rm(ctx.directory, { recursive: true, force: true });
  }
});

test("Order persistence is atomic when modifier persistence fails", async () => {
  const ctx = await openTestDatabase();
  try {
    const repo = new SQLiteOrderRepository(ctx.database);
    const duplicatedModifierId = generateUuidV7(1_759_100_001_500);
    const item: OrderItem = {
      id: generateUuidV7(1_759_100_001_100),
      name: "Burger",
      quantity: 1,
      unit_price: createMoney(1500),
      modifiers: [
        { id: duplicatedModifierId, name: "Cheese", quantity: 1, price: createMoney(250) },
        { id: duplicatedModifierId, name: "Bacon", quantity: 1, price: createMoney(300) }
      ]
    };
    const order = Order.createDraft("store-c1", [item], createMoney(2050));

    assert.throws(() => repo.save(order));
    assert.equal(repo.getById(order.id), null);
    assert.equal(
      ctx.database.query(`SELECT COUNT(*) AS count FROM order_item_modifier WHERE id = ?`, duplicatedModifierId)[0]?.count,
      0
    );
  } finally {
    ctx.database.close();
    await rm(ctx.directory, { recursive: true, force: true });
  }
});
