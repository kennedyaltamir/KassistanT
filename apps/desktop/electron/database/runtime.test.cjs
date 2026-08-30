const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { startPersistenceServer } = require("./runtime.cjs");

function tempContext() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "kassist-runtime-"));
  return {
    directory,
    filePath: path.join(directory, "kassist.sqlite"),
    migrationsPath: path.resolve(__dirname, "../../database/migrations")
  };
}

async function post(port, event) {
  const response = await fetch(`http://127.0.0.1:${port}/internal/v1/whatsapp/message`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event)
  });
  return { status: response.status, body: await response.json() };
}

test("runtime persists inbound message, customer, conversation and outbox", async () => {
  const ctx = tempContext();
  const runtime = startPersistenceServer({
    filePath: ctx.filePath,
    migrationsPath: ctx.migrationsPath,
    port: 0,
    storeId: "store-test",
    storeName: "Test Store"
  });
  await new Promise((resolve) => runtime.server.once("listening", resolve));
  const port = runtime.server.address().port;

  try {
    const result = await post(port, {
      correlation_id: "corr-1",
      message: {
        id: "wa-1",
        external_message_id: "wa-1",
        jid: "5511999999999@s.whatsapp.net",
        direction: "INBOUND",
        text: "Oi",
        timestamp: 1770000000,
        push_name: "Cliente"
      }
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.persisted, true);
    assert.ok(result.body.conversation_id);

    assert.equal(runtime.database.prepare("SELECT COUNT(*) AS count FROM customer").get().count, 1);
    assert.equal(runtime.database.prepare("SELECT COUNT(*) AS count FROM conversation").get().count, 1);
    assert.equal(runtime.database.prepare("SELECT COUNT(*) AS count FROM message").get().count, 1);
    assert.equal(runtime.database.prepare("SELECT COUNT(*) AS count FROM domain_outbox").get().count, 1);
  } finally {
    runtime.close();
    fs.rmSync(ctx.directory, { recursive: true, force: true });
  }
});

test("runtime deduplicates the same external WhatsApp message", async () => {
  const ctx = tempContext();
  const runtime = startPersistenceServer({
    filePath: ctx.filePath,
    migrationsPath: ctx.migrationsPath,
    port: 0,
    storeId: "store-test",
    storeName: "Test Store"
  });
  await new Promise((resolve) => runtime.server.once("listening", resolve));
  const port = runtime.server.address().port;

  try {
    const event = {
      correlation_id: "corr-2",
      message: {
        id: "wa-duplicate",
        external_message_id: "wa-duplicate",
        jid: "5511888888888@s.whatsapp.net",
        direction: "INBOUND",
        text: "Olá",
        timestamp: 1770000001
      }
    };

    const first = await post(port, event);
    const second = await post(port, event);

    assert.equal(first.body.persisted, true);
    assert.equal(second.body.persisted, false);
    assert.equal(runtime.database.prepare("SELECT COUNT(*) AS count FROM message").get().count, 1);
    assert.equal(runtime.database.prepare("SELECT COUNT(*) AS count FROM domain_outbox").get().count, 1);
  } finally {
    runtime.close();
    fs.rmSync(ctx.directory, { recursive: true, force: true });
  }
});

test("runtime reuses the conversation customer when WhatsApp provides an observed phone identity", async () => {
  const ctx = tempContext();
  const runtime = startPersistenceServer({
    filePath: ctx.filePath,
    migrationsPath: ctx.migrationsPath,
    port: 0,
    storeId: "store-test",
    storeName: "Test Store"
  });
  await new Promise((resolve) => runtime.server.once("listening", resolve));
  const port = runtime.server.address().port;

  try {
    const first = await post(port, {
      message: {
        id: "wa-lid-1",
        external_message_id: "wa-lid-1",
        jid: "246973638648023@lid",
        phone_normalized: "553798353530@s.whatsapp.net",
        direction: "INBOUND",
        text: "Olá",
        timestamp: 1770000002,
        push_name: "Cliente"
      }
    });
    const second = await post(port, {
      message: {
        id: "wa-lid-2",
        external_message_id: "wa-lid-2",
        jid: "246973638648023@lid",
        phone_normalized: "553798353530@s.whatsapp.net",
        direction: "INBOUND",
        text: "Continuando",
        timestamp: 1770000003,
        push_name: "Cliente"
      }
    });

    assert.equal(first.body.persisted, true);
    assert.equal(second.body.persisted, true);
    assert.equal(first.body.conversation_id, second.body.conversation_id);
    assert.equal(runtime.database.prepare("SELECT COUNT(*) AS count FROM customer").get().count, 1);
    assert.equal(runtime.database.prepare("SELECT phone_normalized FROM customer LIMIT 1").get().phone_normalized, "553798353530@s.whatsapp.net");
    assert.equal(runtime.database.prepare("SELECT COUNT(*) AS count FROM conversation").get().count, 1);
  } finally {
    runtime.close();
    fs.rmSync(ctx.directory, { recursive: true, force: true });
  }
});

test("runtime fails closed when an observed phone identity conflicts with another customer", async () => {
  const ctx = tempContext();
  const runtime = startPersistenceServer({
    filePath: ctx.filePath,
    migrationsPath: ctx.migrationsPath,
    port: 0,
    storeId: "store-test",
    storeName: "Test Store"
  });
  await new Promise((resolve) => runtime.server.once("listening", resolve));
  const port = runtime.server.address().port;

  try {
    const owner = await post(port, {
      message: {
        id: "wa-owner-1",
        external_message_id: "wa-owner-1",
        jid: "5511000000000@s.whatsapp.net",
        direction: "INBOUND",
        text: "Primeiro cliente",
        timestamp: 1770000004,
        push_name: "Cliente A"
      }
    });
    assert.equal(owner.status, 200);

    const secondCustomer = await post(port, {
      message: {
        id: "wa-owner-2",
        external_message_id: "wa-owner-2",
        jid: "5511222333444@s.whatsapp.net",
        direction: "INBOUND",
        text: "Segundo cliente",
        timestamp: 1770000005,
        push_name: "Cliente B"
      }
    });
    assert.equal(secondCustomer.status, 200);

    const conflicted = await post(port, {
      message: {
        id: "wa-owner-3",
        external_message_id: "wa-owner-3",
        jid: "5511222333444@s.whatsapp.net",
        direction: "INBOUND",
        text: "Conflito",
        timestamp: 1770000006
      }
    });
    assert.equal(conflicted.status, 200);

    const bindingConflict = await post(port, {
      message: {
        id: "wa-owner-4",
        external_message_id: "wa-owner-4",
        jid: "5511000000000@s.whatsapp.net",
        phone_normalized: "5511222333444@s.whatsapp.net",
        direction: "INBOUND",
        text: "Conflito real",
        timestamp: 1770000007
      }
    });
    assert.equal(bindingConflict.status, 500);
    assert.match(bindingConflict.body.error, /Customer identity conflict/);
    assert.equal(runtime.database.prepare("SELECT COUNT(*) AS count FROM message").get().count, 3);
  } finally {
    runtime.close();
    fs.rmSync(ctx.directory, { recursive: true, force: true });
  }
});

test("dashboard summary exposes real KPI calculations, UTC periods and recent persisted orders", async () => {
  const ctx = tempContext();
  const runtime = startPersistenceServer({ filePath: ctx.filePath, migrationsPath: ctx.migrationsPath, port: 0, storeId: "store-test", storeName: "Test Store" });
  await new Promise((resolve) => runtime.server.once("listening", resolve));
  const port = runtime.server.address().port;
  const nowSec = Math.floor(Date.now() / 1000);
  const oneHourAgo = nowSec - 60 * 60;
  const eightDaysAgo = nowSec - 8 * 24 * 60 * 60;
  const thirtyOneDaysAgo = nowSec - 31 * 24 * 60 * 60;
  try {
    for (const [id, timestamp, direction] of [
      ["dashboard-in-1", oneHourAgo, "INBOUND"], ["dashboard-in-2", eightDaysAgo, "INBOUND"], ["dashboard-in-3", thirtyOneDaysAgo, "INBOUND"],
      ["dashboard-out-1", oneHourAgo, "OUTBOUND"], ["dashboard-out-2", eightDaysAgo, "OUTBOUND"], ["dashboard-out-3", thirtyOneDaysAgo, "OUTBOUND"]
    ]) {
      const result = await post(port, { message: { id, external_message_id: id, jid: "5511999999999@s.whatsapp.net", direction, text: "dashboard", timestamp } });
      assert.equal(result.status, 200);
    }
    const customer = runtime.database.prepare("SELECT id FROM customer LIMIT 1").get();
    const conversation = runtime.database.prepare("SELECT id FROM conversation LIMIT 1").get();
    assert.ok(customer?.id && conversation?.id);
    const nowIso = new Date().toISOString();
    const insertOrder = runtime.database.prepare("INSERT INTO \"order\" (id, store_id, display_number, customer_id, conversation_id, lifecycle_state, subtotal_cents, discount_cents, delivery_fee_cents, total_cents, currency, delivery_type, address_id, payment_method_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'BRL', 'PICKUP', NULL, NULL, NULL, ?, ?)");
    insertOrder.run("dashboard-order-confirmed", "store-test", "DASH-001", customer.id, conversation.id, "CONFIRMED", 12345, 12345, nowIso, nowIso);
    insertOrder.run("dashboard-order-cancelled", "store-test", "DASH-002", customer.id, conversation.id, "CANCELLED", 99999, 99999, nowIso, nowIso);
    const response = await fetch("http://127.0.0.1:" + port + "/internal/v1/dashboard/summary");
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.kpis.activeConversations, 1);
    assert.equal(body.kpis.messagesReceived, 3);
    assert.equal(body.kpis.messagesSentToday, 1);
    assert.equal(body.kpis.messagesSent7d, 1);
    assert.equal(body.kpis.messagesSent30d, 2);
    assert.equal(body.kpis.ignoredMessagesAvailable, false);
    assert.equal(body.kpis.confirmedOrders, 1);
    assert.equal(body.kpis.revenueCents, 12345);
    assert.equal(body.kpis.ticketAverageCents, 12345);
    assert.equal(body.kpis.newCustomersToday, 1);
    assert.equal(body.recentOrders.length, 2);
    assert.equal(body.timezone, "UTC");
  } finally {
    runtime.close();
    fs.rmSync(ctx.directory, { recursive: true, force: true });
  }
});

test("dashboard KPI windows exclude future records", async () => {
  const ctx = tempContext();
  const runtime = startPersistenceServer({ filePath: ctx.filePath, migrationsPath: ctx.migrationsPath, port: 0, storeId: "store-test", storeName: "Test Store" });
  await new Promise((resolve) => runtime.server.once("listening", resolve));
  const port = runtime.server.address().port;
  const future = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  try {
    const result = await post(port, {
      message: {
        id: "dashboard-future-out",
        external_message_id: "dashboard-future-out",
        jid: "5511777777777@s.whatsapp.net",
        direction: "OUTBOUND",
        text: "future",
        timestamp: Math.floor((Date.parse(future)) / 1000)
      }
    });
    assert.equal(result.status, 200);
    runtime.database.prepare("UPDATE message SET created_at = ? WHERE external_message_id = ?").run(future, "dashboard-future-out");
    const customer = runtime.database.prepare("SELECT id FROM customer WHERE phone_normalized = ?").get("5511777777777@s.whatsapp.net");
    assert.ok(customer?.id);
    runtime.database.prepare("UPDATE customer SET created_at = ?, updated_at = ? WHERE id = ?").run(future, future, customer.id);
    const response = await fetch("http://127.0.0.1:" + port + "/internal/v1/dashboard/summary");
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.kpis.messagesSentToday, 0);
    assert.equal(body.kpis.messagesSent7d, 0);
    assert.equal(body.kpis.messagesSent30d, 0);
    assert.equal(body.kpis.newCustomersToday, 0);
  } finally {
    runtime.close();
    fs.rmSync(ctx.directory, { recursive: true, force: true });
  }
});

test("dashboard summary returns zero and empty recent orders on a fresh database", async () => {
  const ctx = tempContext();
  const runtime = startPersistenceServer({ filePath: ctx.filePath, migrationsPath: ctx.migrationsPath, port: 0, storeId: "store-test", storeName: "Test Store" });
  await new Promise((resolve) => runtime.server.once("listening", resolve));
  const port = runtime.server.address().port;
  try {
    const response = await fetch("http://127.0.0.1:" + port + "/internal/v1/dashboard/summary");
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.kpis.activeConversations, 0);
    assert.equal(body.kpis.messagesReceived, 0);
    assert.equal(body.kpis.messagesSentToday, 0);
    assert.equal(body.kpis.messagesSent7d, 0);
    assert.equal(body.kpis.messagesSent30d, 0);
    assert.equal(body.kpis.confirmedOrders, 0);
    assert.equal(body.kpis.revenueCents, 0);
    assert.equal(body.kpis.ticketAverageCents, 0);
    assert.equal(body.kpis.newCustomersToday, 0);
    assert.deepEqual(body.recentOrders, []);
  } finally {
    runtime.close();
    fs.rmSync(ctx.directory, { recursive: true, force: true });
  }
});
