const test = require("node:test");
const assert = require("node:assert/strict");
const Database = require("better-sqlite3");
const { AssistantConfigurationStore } = require("../assistant-configuration.cjs");

test("assistant configuration round-trips through SQLite with deterministic defaults", () => {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE store (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    INSERT INTO store(id, name) VALUES ('test-store', 'Test Store');
    CREATE TABLE assistant_configuration (
      id TEXT PRIMARY KEY, store_id TEXT NOT NULL UNIQUE,
      company_name TEXT NOT NULL DEFAULT '', company_address TEXT,
      timezone TEXT NOT NULL, business_hours_json TEXT NOT NULL,
      assistant_name TEXT NOT NULL, language TEXT NOT NULL,
      conversation_mode TEXT NOT NULL, behavior_instructions TEXT NOT NULL,
      customer_context_policy_json TEXT NOT NULL, history_policy_json TEXT NOT NULL,
      after_hours_policy_json TEXT NOT NULL, sale_notification_policy_json TEXT NOT NULL,
      enabled INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);

  const store = new AssistantConfigurationStore(db, "test-store");
  const created = store.ensure();
  assert.equal(created.assistant_name, "Kassis");
  assert.equal(created.timezone, "America/Sao_Paulo");

  const saved = store.save({
    company_name: "Kassis Burger",
    company_address: "Rua Teste, 100",
    assistant_name: "Ana",
    conversation_mode: "PROFESSIONAL",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    enabled: true,
    business_hours: { monday: [{ open: "08:00", close: "18:00" }] },
    customer_context_policy: { name: true, order_history: true },
    history_policy: { enabled: true, max_messages: 40 },
    after_hours_policy: { enabled: true, message: "Estamos fechados." },
    sale_notification_policy: { enabled: true, channel: "WHATSAPP" }
  });

  assert.equal(saved.company_name, "Kassis Burger");
  assert.equal(saved.assistant_name, "Ana");
  assert.equal(saved.history_policy.max_messages, 40);
  assert.equal(saved.business_hours.monday[0].open, "08:00");

  assert.throws(
    () => store.save({ company_name: "", assistant_name: "A", timezone: "not-a-zone" }),
    error => error && error.code === "ASSISTANT_CONFIGURATION_INVALID"
  );

  db.close();
});
