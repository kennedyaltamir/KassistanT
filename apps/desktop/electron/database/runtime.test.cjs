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
    await post(port, {
      message: {
        id: "wa-owner-1",
        external_message_id: "wa-owner-1",
        jid: "5511000000000@s.whatsapp.net",
        direction: "INBOUND",
        text: "Primeiro",
        timestamp: 1770000004
      }
    });
    await post(port, {
      message: {
        id: "wa-owner-2",
        external_message_id: "wa-owner-2",
        jid: "246973638648023@lid",
        phone_normalized: "5511000000000@s.whatsapp.net",
        direction: "INBOUND",
        text: "Conflito",
        timestamp: 1770000005
      }
    });
    const conflicted = await post(port, {
      message: {
        id: "wa-owner-3",
        external_message_id: "wa-owner-3",
        jid: "246973638648023@lid",
        phone_normalized: "5511000000000@s.whatsapp.net",
        direction: "INBOUND",
        text: "De novo",
        timestamp: 1770000006
      }
    });
    assert.equal(conflicted.status, 500);
    assert.match(conflicted.body.error, /Customer identity conflict/);
  } finally {
    runtime.close();
    fs.rmSync(ctx.directory, { recursive: true, force: true });
  }
});