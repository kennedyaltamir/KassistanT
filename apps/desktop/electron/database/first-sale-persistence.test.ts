import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { SQLiteDatabase } from "./sqlite-database.js";
import {
  SQLiteConversationRepository,
  SQLiteCustomerRepository,
  SQLiteDomainOutboxRepository,
  SQLiteMessageRepository
} from "./first-sale-persistence.js";

async function openDatabase() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-first-sale-"));
  const database = await SQLiteDatabase.open({
    filePath: path.join(directory, "kassist.sqlite"),
    migrationsPath: path.resolve(__dirname, "../../database/migrations"),
    applicationVersion: "test"
  });
  return { database, directory };
}

function seedStore(database: SQLiteDatabase): void {
  database.execute(`INSERT INTO store(id, name) VALUES (?, ?)`, "store-1", "Test Store");
}

test("customer identity is unique per store and normalized phone", async () => {
  const ctx = await openDatabase();
  try {
    seedStore(ctx.database);
    const repo = new SQLiteCustomerRepository(ctx.database);
    repo.create({ id: "customer-1", store_id: "store-1", phone_normalized: "+5511999999999", name: "Maria" });
    assert.equal(repo.findByPhone("store-1", "+5511999999999")?.id, "customer-1");
    assert.throws(() => repo.create({ id: "customer-2", store_id: "store-1", phone_normalized: "+5511999999999" }));
  } finally {
    ctx.database.close();
    await rm(ctx.directory, { recursive: true, force: true });
  }
});

test("inbound message insertion is idempotent and outbox append is deduplicated", async () => {
  const ctx = await openDatabase();
  try {
    seedStore(ctx.database);
    const customer = new SQLiteCustomerRepository(ctx.database);
    const conversation = new SQLiteConversationRepository(ctx.database);
    customer.create({ id: "customer-1", store_id: "store-1", phone_normalized: "+5511999999999" });
    conversation.create({ id: "conversation-1", store_id: "store-1", customer_id: "customer-1", external_thread_id: "thread-1" });

    const messages = new SQLiteMessageRepository(ctx.database);
    const message = {
      id: "message-1",
      store_id: "store-1",
      conversation_id: "conversation-1",
      external_message_id: "wa-message-1",
      direction: "INBOUND" as const,
      sender_type: "CUSTOMER",
      message_type: "TEXT",
      text: "Quero um sorvete"
    };
    assert.equal(messages.insertInbound(message), true);
    assert.equal(messages.insertInbound({ ...message, id: "message-duplicate" }), false);

    const outbox = new SQLiteDomainOutboxRepository(ctx.database);
    const event = {
      id: "event-1",
      idempotency_key: "order-confirmed:order-1",
      event_type: "order.confirmed",
      aggregate_id: "order-1",
      payload: JSON.stringify({ order_id: "order-1" }),
      occurred_at_utc: new Date().toISOString()
    };
    assert.equal(outbox.append(event), true);
    assert.equal(outbox.append({ ...event, id: "event-duplicate" }), false);
  } finally {
    ctx.database.close();
    await rm(ctx.directory, { recursive: true, force: true });
  }
});
