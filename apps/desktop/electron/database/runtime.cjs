const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const Database = require("better-sqlite3");

const MIGRATION_FILES = [
  "0001_bootstrap.sql",
  "0003_first_sale_core.sql",
  "0004_first_sale_order_modifiers.sql",
  "0005_assistant_product_fields.sql"
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
  database.exec("CREATE TABLE IF NOT EXISTS _migration_runtime (id TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL)");

  for (const fileName of MIGRATION_FILES) {
    const filePath = path.join(migrationsPath, fileName);
    const sql = fs.readFileSync(filePath);
    const id = path.basename(fileName, ".sql");
    const checksum = crypto.createHash("sha256").update(sql).digest("hex");
    const previous = database.prepare("SELECT checksum FROM _migration_runtime WHERE id = ?").get(id);
    if (previous && previous.checksum !== checksum) throw new Error(`Migration checksum drift: ${id}`);
    if (previous) continue;
    database.transaction(() => {
      database.exec(sql.toString("utf8"));
      database.prepare("INSERT INTO _migration_runtime(id, checksum, applied_at) VALUES (?, ?, ?)").run(id, checksum, new Date().toISOString());
    })();
  }
}

function normalizeParticipant(value) {
  const raw = String(value || "").trim();
  return raw || "unknown";
}

function ensureStore(database, storeId, storeName) {
  database.prepare("INSERT OR IGNORE INTO store(id, name) VALUES (?, ?)").run(storeId, storeName);
}

function messageType(message) {
  const value = String(message.message_type || "TEXT").toUpperCase();
  return new Set(["TEXT", "AUDIO", "IMAGE", "VIDEO", "DOCUMENT", "OTHER"]).has(value) ? value : "OTHER";
}

function resolveCustomer(database, storeId, externalThreadId, phoneNormalized, pushName, conversation, now) {
  if (conversation) {
    const customer = database.prepare("SELECT id, phone_normalized, name FROM customer WHERE store_id = ? AND id = ?").get(storeId, conversation.customer_id);
    if (!customer) throw new Error("Conversation references a missing customer");

    if (phoneNormalized !== externalThreadId && phoneNormalized !== customer.phone_normalized) {
      const conflictingCustomer = database.prepare("SELECT id FROM customer WHERE store_id = ? AND phone_normalized = ?").get(storeId, phoneNormalized);
      if (conflictingCustomer && conflictingCustomer.id !== customer.id) {
        throw new Error("Customer identity conflict: observed phone is already bound to another customer");
      }
      database.prepare("UPDATE customer SET phone_normalized = ?, updated_at = ? WHERE store_id = ? AND id = ?")
        .run(phoneNormalized, now, storeId, customer.id);
      customer.phone_normalized = phoneNormalized;
    }
    return customer;
  }

  let customer = database.prepare("SELECT id, phone_normalized, name FROM customer WHERE store_id = ? AND phone_normalized = ?")
    .get(storeId, phoneNormalized);
  if (customer) return customer;

  const customerId = crypto.randomUUID();
  database.prepare(`INSERT INTO customer (
    id, store_id, phone_normalized, name, notes, first_order_at, last_order_at,
    order_count, total_spent_cents, currency, status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, NULL, NULL, NULL, 0, 0, 'BRL', 'ACTIVE', ?, ?)`)
    .run(customerId, storeId, phoneNormalized, typeof pushName === "string" ? pushName : null, now, now);
  customer = { id: customerId, phone_normalized: phoneNormalized, name: typeof pushName === "string" ? pushName : null };
  return customer;
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
  const phoneNormalized = normalizeParticipant(message.phone_normalized || externalThreadId);

  return database.transaction(() => {
    ensureStore(database, storeId, storeName);
    const conversation = database.prepare("SELECT id, customer_id FROM conversation WHERE store_id = ? AND external_thread_id = ?")
      .get(storeId, externalThreadId);
    const customer = resolveCustomer(database, storeId, externalThreadId, phoneNormalized, message.push_name, conversation, now);
    const customerId = customer.id;
    const conversationId = conversation?.id || crypto.randomUUID();

    if (!conversation) {
      database.prepare(`INSERT INTO conversation (
        id, store_id, customer_id, external_thread_id, lifecycle_state,
        ownership, ai_state, unread_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'OPEN', 'AI', 'ACTIVE', ?, ?, ?)`)
        .run(conversationId, storeId, customerId, externalThreadId, direction === "INBOUND" ? 1 : 0, now, now);
    } else if (conversation.customer_id !== customerId) {
      throw new Error("Conversation/customer binding conflict");
    }

    const insertResult = database.prepare(`INSERT OR IGNORE INTO message (
      id, store_id, conversation_id, external_message_id, direction,
      sender_type, message_type, text, raw_event_reference, lifecycle_state,
      correlation_id, causation_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        String(message.id || crypto.randomUUID()), storeId, conversationId, externalMessageId,
        direction, direction === "INBOUND" ? "CUSTOMER" : "ASSISTANT", messageType(message),
        typeof message.text === "string" ? message.text : null, JSON.stringify(event),
        direction === "INBOUND" ? "RECEIVED" : "SENT", correlationId, causationId,
        typeof message.timestamp === "number" ? new Date(message.timestamp * 1000).toISOString() : now, now
      );

    if (insertResult.changes === 1 && direction === "INBOUND") {
      database.prepare("UPDATE conversation SET unread_count = unread_count + 1, updated_at = ? WHERE id = ?").run(now, conversationId);
    }

    if (insertResult.changes === 1) {
      const eventType = direction === "INBOUND" ? "message.received" : "message.sent";
      const idempotencyKey = `${eventType}:${storeId}:${externalMessageId}`;
      database.prepare(`INSERT OR IGNORE INTO domain_outbox (
        id, idempotency_key, event_type, aggregate_id, payload,
        occurred_at_utc, attempts, processed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?)`)
        .run(crypto.randomUUID(), idempotencyKey, eventType, conversationId,
          JSON.stringify({ message_id: externalMessageId, conversation_id: conversationId, direction }),
          typeof message.timestamp === "number" ? new Date(message.timestamp * 1000).toISOString() : now, now);
    }

    return { persisted: insertResult.changes === 1, conversation_id: conversationId };
  })();
}

function validateProductInput(input, partial = false) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid product payload");
  const value = {};
  if (!partial || Object.prototype.hasOwnProperty.call(input, "name")) {
    const name = String(input.name ?? "").trim();
    if (!name) throw new Error("Product name is required");
    if (name.length > 200) throw new Error("Product name is too long");
    value.name = name;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(input, "priceCents")) {
    const priceCents = Number(input.priceCents);
    if (!Number.isInteger(priceCents) || priceCents < 0) throw new Error("priceCents must be a non-negative integer");
    value.priceCents = priceCents;
  }
  if (Object.prototype.hasOwnProperty.call(input, "description")) value.description = input.description == null ? null : String(input.description).trim();
  if (Object.prototype.hasOwnProperty.call(input, "category")) value.category = input.category == null ? null : String(input.category).trim();
  if (Object.prototype.hasOwnProperty.call(input, "stockQuantity")) {
    const stockQuantity = Number(input.stockQuantity);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) throw new Error("stockQuantity must be a non-negative integer");
    value.stockQuantity = stockQuantity;
  } else if (!partial) value.stockQuantity = 0;
  if (Object.prototype.hasOwnProperty.call(input, "available")) value.available = Boolean(input.available);
  else if (!partial) value.available = true;
  if (Object.prototype.hasOwnProperty.call(input, "imageReference")) value.imageReference = input.imageReference == null ? null : String(input.imageReference).trim();
  return value;
}

function ensureCategory(database, category) {
  if (!category) return null;
  const existing = database.prepare("SELECT id FROM product_category WHERE name = ? ORDER BY rowid LIMIT 1").get(category);
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  database.prepare("INSERT INTO product_category(id, name) VALUES (?, ?)").run(id, category);
  return id;
}

function productView(row) {
  return {
    id: row.id, storeId: row.store_id, category: row.category_name || null, name: row.name,
    description: row.description, priceCents: row.price_cents, currency: row.currency,
    stockQuantity: row.stock_quantity, available: row.available === 1, imageReference: row.image_reference,
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

function productRow(database, storeId, id) {
  return database.prepare(`SELECT p.id, p.store_id, c.name AS category_name, p.name, p.description,
    p.price_cents, p.currency, p.stock_quantity, p.available, p.image_reference,
    p.created_at, p.updated_at FROM product p LEFT JOIN product_category c ON c.id = p.category_id
    WHERE p.store_id = ? AND p.id = ?`).get(storeId, id);
}

function listProducts(database, storeId) {
  return database.prepare(`SELECT p.id, p.store_id, c.name AS category_name, p.name, p.description,
    p.price_cents, p.currency, p.stock_quantity, p.available, p.image_reference,
    p.created_at, p.updated_at FROM product p LEFT JOIN product_category c ON c.id = p.category_id
    WHERE p.store_id = ? ORDER BY p.updated_at DESC, p.name ASC`).all(storeId).map(productView);
}

function createProduct(database, storeId, input) {
  const product = validateProductInput(input);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const categoryId = ensureCategory(database, product.category || null);
  database.prepare(`INSERT INTO product (
    id, store_id, category_id, name, description, price_cents, currency,
    available, tags, created_at, updated_at, stock_quantity, image_reference
  ) VALUES (?, ?, ?, ?, ?, ?, 'BRL', ?, NULL, ?, ?, ?, ?)`).run(
    id, storeId, categoryId, product.name, product.description ?? null, product.priceCents,
    product.available ? 1 : 0, now, now, product.stockQuantity, product.imageReference ?? null
  );
  const row = productRow(database, storeId, id);
  return row ? productView(row) : null;
}

function updateProduct(database, storeId, id, input) {
  const patch = validateProductInput(input, true);
  const currentRow = productRow(database, storeId, id);
  if (!currentRow) return null;
  const current = productView(currentRow);
  const next = { ...current, ...patch };
  if (Object.prototype.hasOwnProperty.call(patch, "category")) next.category = patch.category;
  const categoryId = ensureCategory(database, next.category);
  const now = new Date().toISOString();
  database.prepare(`UPDATE product SET category_id = ?, name = ?, description = ?, price_cents = ?,
    available = ?, updated_at = ?, stock_quantity = ?, image_reference = ? WHERE store_id = ? AND id = ?`)
    .run(categoryId, next.name, next.description, next.priceCents, next.available ? 1 : 0, now,
      next.stockQuantity, next.imageReference, storeId, id);
  const row = productRow(database, storeId, id);
  return row ? productView(row) : null;
}

function deleteProduct(database, storeId, id) {
  return database.prepare("DELETE FROM product WHERE store_id = ? AND id = ?").run(storeId, id).changes === 1;
}

function listConversations(database, storeId, limit) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  const rows = database.prepare(`SELECT c.id, c.external_thread_id, c.lifecycle_state, c.ownership, c.ai_state,
    c.unread_count, c.created_at, c.updated_at, cu.id AS customer_id, cu.name AS customer_name, cu.phone_normalized
    FROM conversation c JOIN customer cu ON cu.id = c.customer_id
    WHERE c.store_id = ? ORDER BY c.updated_at DESC LIMIT ?`).all(storeId, safeLimit);
  return rows.map((row) => {
    const last = database.prepare(`SELECT id, external_message_id, direction, sender_type, message_type, text, created_at
      FROM message WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1`).get(row.id);
    return {
      id: row.id, externalThreadId: row.external_thread_id, lifecycleState: row.lifecycle_state,
      ownership: row.ownership, aiState: row.ai_state, unreadCount: row.unread_count,
      customer: { id: row.customer_id, name: row.customer_name, phoneNormalized: row.phone_normalized },
      lastMessage: last ? { id: last.id, externalMessageId: last.external_message_id, direction: last.direction,
        senderType: last.sender_type, messageType: last.message_type, text: last.text, createdAt: last.created_at } : null,
      createdAt: row.created_at, updatedAt: row.updated_at
    };
  });
}

function conversationContext(database, storeId, externalThreadId, limit) {
  const conversation = database.prepare(`SELECT c.id, c.external_thread_id, c.lifecycle_state, c.ownership, c.ai_state,
    c.unread_count, c.created_at, c.updated_at, cu.id AS customer_id, cu.name AS customer_name,
    cu.phone_normalized, cu.notes, cu.status AS customer_status
    FROM conversation c JOIN customer cu ON cu.id = c.customer_id
    WHERE c.store_id = ? AND c.external_thread_id = ?`).get(storeId, externalThreadId);
  if (!conversation) return null;
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 500));
  const messages = database.prepare(`SELECT id, external_message_id, direction, sender_type, message_type, text,
    lifecycle_state, correlation_id, causation_id, created_at, updated_at
    FROM message WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?`).all(conversation.id, safeLimit).reverse();
  const addresses = database.prepare(`SELECT id, label, street, number, complement, neighborhood, city, state,
    postal_code, reference FROM customer_address WHERE customer_id = ? ORDER BY updated_at DESC`).all(conversation.customer_id);
  const activeOrder = database.prepare(`SELECT id, display_number, lifecycle_state, subtotal_cents, delivery_fee_cents,
    total_cents, currency, delivery_type, address_id, payment_method_id, notes, created_at, updated_at
    FROM "order" WHERE conversation_id = ? AND lifecycle_state NOT IN ('DELIVERED', 'CANCELLED')
    ORDER BY updated_at DESC LIMIT 1`).get(conversation.id) || null;
  const availableProducts = database.prepare(`SELECT p.id, c.name AS category_name, p.name, p.description, p.price_cents,
    p.currency, p.stock_quantity, p.available, p.image_reference FROM product p
    LEFT JOIN product_category c ON c.id = p.category_id WHERE p.store_id = ? AND p.available = 1
    ORDER BY p.name ASC LIMIT 200`).all(storeId);

  const identityBindingStatus = conversation.phone_normalized && conversation.phone_normalized !== externalThreadId
    ? "OBSERVED_PHONE_IDENTITY"
    : "LEGACY_JID_DERIVED";

  return {
    contextVersion: "1",
    identityBindingStatus,
    identity: {
      channelJid: externalThreadId,
      phoneNormalized: conversation.phone_normalized,
      bindingStatus: identityBindingStatus
    },
    customer: { id: conversation.customer_id, name: conversation.customer_name, phoneNormalized: conversation.phone_normalized,
      notes: conversation.notes, status: conversation.customer_status, addresses },
    conversation: { id: conversation.id, externalThreadId: conversation.external_thread_id,
      lifecycleState: conversation.lifecycle_state, ownership: conversation.ownership, aiState: conversation.ai_state,
      unreadCount: conversation.unread_count, createdAt: conversation.created_at, updatedAt: conversation.updated_at },
    currentState: { lifecycleState: conversation.lifecycle_state, ownership: conversation.ownership, aiState: conversation.ai_state },
    messages,
    relevantMemories: [],
    activeOrder,
    availableProducts: availableProducts.map((row) => ({ id: row.id, category: row.category_name || null,
      name: row.name, description: row.description, priceCents: row.price_cents, currency: row.currency,
      stockQuantity: row.stock_quantity, available: row.available === 1, imageReference: row.image_reference })),
    businessContext: { storeId, storeName: process.env.KASSIST_STORE_NAME || "KassisT" }
  };
}

function startPersistenceServer(options = {}) {
  const filePath = options.filePath || process.env.KASSIST_DB_PATH || defaultDatabasePath();
  const migrationsPath = options.migrationsPath || path.resolve(__dirname, "../../database/migrations");
  const storeId = options.storeId || process.env.KASSIST_STORE_ID || "default-store";
  const storeName = options.storeName || process.env.KASSIST_STORE_NAME || "KassisT";
  const host = options.host || process.env.KASSIST_PERSISTENCE_HOST || "127.0.0.1";
  const port = Number(options.port ?? process.env.KASSIST_PERSISTENCE_PORT ?? 3211);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const database = new Database(filePath);
  ensureMigrations(database, migrationsPath);
  ensureStore(database, storeId, storeName);

  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${host}:${port}`);

    if (request.method === "GET" && url.pathname === "/health") return json(response, 200, { status: "ok", database: filePath });

    if (request.method === "POST" && url.pathname === "/internal/v1/whatsapp/message") {
      try { return json(response, 200, persistMessage(database, storeId, storeName, await readJson(request))); }
      catch (error) { return json(response, 500, { error: error instanceof Error ? error.message : String(error) }); }
    }

    if (url.pathname === "/internal/v1/products") {
      try {
        if (request.method === "GET") return json(response, 200, { products: listProducts(database, storeId) });
        if (request.method === "POST") return json(response, 201, { product: createProduct(database, storeId, await readJson(request)) });
      } catch (error) { return json(response, 400, { error: error instanceof Error ? error.message : String(error) }); }
    }

    const productMatch = url.pathname.match(/^\/internal\/v1\/products\/([^/]+)$/);
    if (productMatch) {
      const id = decodeURIComponent(productMatch[1]);
      try {
        if (request.method === "GET") {
          const row = productRow(database, storeId, id);
          return row ? json(response, 200, { product: productView(row) }) : json(response, 404, { error: "Product not found" });
        }
        if (request.method === "PUT") {
          const product = updateProduct(database, storeId, id, await readJson(request));
          return product ? json(response, 200, { product }) : json(response, 404, { error: "Product not found" });
        }
        if (request.method === "DELETE") {
          const deleted = deleteProduct(database, storeId, id);
          return deleted ? json(response, 200, { deleted: true, id }) : json(response, 404, { error: "Product not found" });
        }
      } catch (error) { return json(response, request.method === "DELETE" ? 409 : 400, { error: error instanceof Error ? error.message : String(error) }); }
    }

    if (request.method === "GET" && url.pathname === "/internal/v1/conversations") {
      return json(response, 200, { conversations: listConversations(database, storeId, url.searchParams.get("limit")) });
    }

    if (request.method === "GET" && url.pathname === "/internal/v1/conversation-context") {
      const jid = normalizeParticipant(url.searchParams.get("jid"));
      const context = conversationContext(database, storeId, jid, url.searchParams.get("limit"));
      return context ? json(response, 200, context) : json(response, 404, { error: "Conversation not found" });
    }

    return json(response, 404, { error: "not_found" });
  });

  server.listen(port, host, () => console.log(`[KassisT Desktop] persistence listening on http://${host}:${port}`));
  return { server, database, filePath, close() { server.close(); database.close(); } };
}

module.exports = { startPersistenceServer, ensureMigrations, persistMessage, conversationContext, listProducts };
