const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const Database = require("better-sqlite3");

const MIGRATION_FILES = [
  "0001_bootstrap.sql",
  "0003_first_sale_core.sql",
  "0004_first_sale_order_modifiers.sql"
];

function defaultDatabasePath() {
  const base = process.env.APPDATA || process.env.XDG_DATA_HOME || path.join(os.homedir(), ".config");
  return path.join(base, "KassisT", "database", "kassist.sqlite");
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!raw) return resolve({});
      try {
        const value = JSON.parse(raw);
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          reject(new Error("Invalid JSON object"));
          return;
        }
        resolve(value);
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function json(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(payload)
  });
  response.end(payload);
}

function ensureMigrations(database, migrationsPath) {
  database.exec("PRAGMA foreign_keys = ON");
  database.pragma("journal_mode = WAL");
  database.pragma("busy_timeout = 5000");

  database.exec(
    "CREATE TABLE IF NOT EXISTS _migration_runtime (id TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL)"
  );

  for (const fileName of MIGRATION_FILES) {
    const filePath = path.join(migrationsPath, fileName);
    const sql = fs.readFileSync(filePath);
    const id = path.basename(fileName, ".sql");
    const checksum = crypto.createHash("sha256").update(sql).digest("hex");
    const previous = database.prepare("SELECT checksum FROM _migration_runtime WHERE id = ?").get(id);

    if (previous && previous.checksum !== checksum) {
      throw new Error(`Migration checksum drift: ${id}`);
    }
    if (previous) continue;

    const transaction = database.transaction(() => {
      database.exec(sql.toString("utf8"));
      database.prepare(
        "INSERT INTO _migration_runtime(id, checksum, applied_at) VALUES (?, ?, ?)"
      ).run(id, checksum, new Date().toISOString());
    });
    transaction();
  }
}

function normalizeParticipant(value) {
  const raw = String(value || "").trim();
  if (!raw) return "unknown";
  return raw;
}

function ensureStore(database, storeId, storeName) {
  database.prepare("INSERT OR IGNORE INTO store(id, name) VALUES (?, ?)").run(storeId, storeName);
}

function persistMessage(database, storeId, storeName, event) {
  const message = event.message && typeof event.message === "object" ? event.message : {};
  const externalMessageId = String(message.external_message_id || message.id || "").trim();
  const externalThreadId = normalizeParticipant(message.jid);
  if (!externalMessageId) throw new Error("external_message_id is required");

  const direction = message.direction === "OUTBOUND" ? "OUTBOUND" : "INBOUND";
  const now = new Date().toISOString();
  const correlationId = typeof event.correlation_id === "string" && event.correlation_id ? event.correlation_id : null;
  const causationId = typeof event.causation_id === "string" && event.causation_id ? event.causation_id : null;
  const phoneNormalized = externalThreadId;

  return database.transaction(() => {
    ensureStore(database, storeId, storeName);

    const customer = database.prepare(
      `SELECT id FROM customer WHERE store_id = ? AND phone_normalized = ?`
    ).get(storeId, phoneNormalized);

    const customerId = customer?.id || crypto.randomUUID();
    if (!customer) {
      database.prepare(
        `INSERT INTO customer (
          id, store_id, phone_normalized, name, notes, first_order_at, last_order_at,
          order_count, total_spent_cents, currency, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, NULL, NULL, NULL, 0, 0, 'BRL', 'ACTIVE', ?, ?)`
      ).run(customerId, storeId, phoneNormalized, message.push_name || null, now, now);
    }

    const conversation = database.prepare(
      `SELECT id FROM conversation WHERE store_id = ? AND external_thread_id = ?`
    ).get(storeId, externalThreadId);

    const conversationId = conversation?.id || crypto.randomUUID();
    if (!conversation) {
      database.prepare(
        `INSERT INTO conversation (
          id, store_id, customer_id, external_thread_id, lifecycle_state,
          ownership, ai_state, unread_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'OPEN', 'AI', 'ACTIVE', ?, ?, ?)`
      ).run(conversationId, storeId, customerId, externalThreadId, direction === "INBOUND" ? 1 : 0, now, now);
    }

    const insertResult = database.prepare(
      `INSERT OR IGNORE INTO message (
        id, store_id, conversation_id, external_message_id, direction,
        sender_type, message_type, text, raw_event_reference, lifecycle_state,
        correlation_id, causation_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      String(message.id || crypto.randomUUID()),
      storeId,
      conversationId,
      externalMessageId,
      direction,
      direction === "INBOUND" ? "CUSTOMER" : "ASSISTANT",
      "TEXT",
      typeof message.text === "string" ? message.text : null,
      JSON.stringify(event),
      direction === "INBOUND" ? "RECEIVED" : "SENT",
      correlationId,
      causationId,
      now,
      now
    );

    if (insertResult.changes === 1 && direction === "INBOUND") {
      database.prepare(
        `UPDATE conversation SET unread_count = unread_count + 1, updated_at = ?
         WHERE id = ?`
      ).run(now, conversationId);
    }

    if (insertResult.changes === 1) {
      const outboxId = crypto.randomUUID();
      const eventType = direction === "INBOUND" ? "message.received" : "message.sent";
      const idempotencyKey = `${eventType}:${storeId}:${externalMessageId}`;
      database.prepare(
        `INSERT OR IGNORE INTO domain_outbox (
          id, idempotency_key, event_type, aggregate_id, payload,
          occurred_at_utc, attempts, processed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?)`
      ).run(
        outboxId,
        idempotencyKey,
        eventType,
        conversationId,
        JSON.stringify({ message_id: externalMessageId, conversation_id: conversationId, direction }),
        typeof message.timestamp === "number" ? new Date(message.timestamp * 1000).toISOString() : now,
        now
      );
    }

    return { persisted: insertResult.changes === 1, conversation_id: conversationId };
  })();
}

function startPersistenceServer(options = {}) {
  const filePath = options.filePath || process.env.KASSIST_DB_PATH || defaultDatabasePath();
  const migrationsPath = options.migrationsPath || path.resolve(__dirname, "../../database/migrations");
  const storeId = options.storeId || process.env.KASSIST_STORE_ID || "default-store";
  const storeName = options.storeName || process.env.KASSIST_STORE_NAME || "KassisT";
  const host = options.host || process.env.KASSIST_PERSISTENCE_HOST || "127.0.0.1";
  const port = Number(options.port || process.env.KASSIST_PERSISTENCE_PORT || 3211);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const database = new Database(filePath);
  ensureMigrations(database, migrationsPath);
  ensureStore(database, storeId, storeName);

  const server = http.createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/health") {
      return json(response, 200, { status: "ok", database: filePath });
    }

    if (request.method === "POST" && request.url === "/internal/v1/whatsapp/message") {
      try {
        const event = await readJson(request);
        const result = persistMessage(database, storeId, storeName, event);
        return json(response, 200, result);
      } catch (error) {
        return json(response, 500, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    return json(response, 404, { error: "not_found" });
  });

  server.listen(port, host, () => {
    console.log(`[KassisT Desktop] persistence listening on http://${host}:${port}`);
  });

  return {
    server,
    database,
    filePath,
    close() {
      server.close();
      database.close();
    }
  };
}

module.exports = { startPersistenceServer, ensureMigrations, persistMessage };
