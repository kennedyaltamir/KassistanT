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
  "0005_commercial_runtime.sql"
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
      if (raw.length > 2_000_000) {
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

function ensureStore(database, storeId, storeName) {
  database.prepare("INSERT OR IGNORE INTO store(id, name) VALUES (?, ?)").run(storeId, storeName);
}

function normalizeParticipant(value) {
  const raw = String(value || "").trim();
  return raw || "unknown";
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (raw.endsWith("@lid") || raw.endsWith("@s.whatsapp.net")) return raw;
  const digits = raw.replace(/\D/g, "");
  return digits ? `${digits}@s.whatsapp.net` : raw;
}

function parseDataJson(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
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
  const phoneNormalized = normalizePhone(externalThreadId);
  const messageType = ["TEXT", "IMAGE", "VIDEO", "DOCUMENT", "AUDIO"].includes(String(message.message_type)) ? String(message.message_type) : "TEXT";
  const text = typeof message.text === "string" ? message.text : null;
  const mediaPath = typeof message.media_path === "string" ? message.media_path : null;

  return database.transaction(() => {
    ensureStore(database, storeId, storeName);
    const customer = database.prepare("SELECT id FROM customer WHERE store_id = ? AND phone_normalized = ?").get(storeId, phoneNormalized);
    const customerId = customer?.id || crypto.randomUUID();
    if (!customer) {
      database.prepare(`INSERT INTO customer (id, store_id, phone_normalized, name, notes, first_order_at, last_order_at, order_count, total_spent_cents, currency, status, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, NULL, NULL, 0, 0, 'BRL', 'ACTIVE', ?, ?)`)
        .run(customerId, storeId, phoneNormalized, message.push_name || null, now, now);
    } else if (message.push_name) {
      database.prepare("UPDATE customer SET name = COALESCE(?, name), updated_at = ? WHERE id = ?").run(message.push_name, now, customerId);
    }

    const conversation = database.prepare("SELECT id FROM conversation WHERE store_id = ? AND external_thread_id = ?").get(storeId, externalThreadId);
    const conversationId = conversation?.id || crypto.randomUUID();
    if (!conversation) {
      database.prepare(`INSERT INTO conversation (id, store_id, customer_id, external_thread_id, lifecycle_state, ownership, ai_state, unread_count, created_at, updated_at) VALUES (?, ?, ?, ?, 'OPEN', 'AI', 'ACTIVE', ?, ?, ?)`)
        .run(conversationId, storeId, customerId, externalThreadId, direction === "INBOUND" ? 1 : 0, now, now);
    } else {
      database.prepare("UPDATE conversation SET customer_id = ?, unread_count = unread_count + ?, updated_at = ? WHERE id = ?")
        .run(customerId, direction === "INBOUND" ? 1 : 0, now, conversationId);
    }

    const insertResult = database.prepare(`INSERT OR IGNORE INTO message (id, store_id, conversation_id, external_message_id, direction, sender_type, message_type, text, raw_event_reference, lifecycle_state, correlation_id, causation_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(String(message.id || crypto.randomUUID()), storeId, conversationId, externalMessageId, direction, direction === "INBOUND" ? "CUSTOMER" : "ASSISTANT", messageType, text, JSON.stringify({ ...event, message: { ...message, media_path: mediaPath } }), direction === "INBOUND" ? "RECEIVED" : "SENT", correlationId, causationId, now, now);

    if (insertResult.changes === 1) {
      const eventType = direction === "INBOUND" ? "message.received" : "message.sent";
      database.prepare(`INSERT OR IGNORE INTO domain_outbox (id, idempotency_key, event_type, aggregate_id, payload, occurred_at_utc, attempts, processed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?)`)
        .run(crypto.randomUUID(), `${eventType}:${storeId}:${externalMessageId}`, eventType, conversationId, JSON.stringify({ message_id: externalMessageId, conversation_id: conversationId, direction, message_type: messageType }), typeof message.timestamp === "number" ? new Date(message.timestamp * 1000).toISOString() : now, now);

      const email = typeof message.customer_email === "string" ? message.customer_email.trim() : null;
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        database.prepare("UPDATE customer SET email = ?, updated_at = ? WHERE id = ?").run(email, now, customerId);
      }
    }

    return { persisted: insertResult.changes === 1, conversation_id: conversationId, customer_id: customerId };
  })();
}

function storeConfig(database, storeId, storeName) {
  ensureStore(database, storeId, storeName);
  const row = database.prepare("SELECT id, name, delivery_enabled, delivery_fee_cents, min_order_cents, business_form_json FROM store WHERE id = ?").get(storeId);
  return {
    id: row.id,
    name: row.name,
    deliveryEnabled: row.delivery_enabled === 1,
    deliveryFeeCents: Number(row.delivery_fee_cents || 0),
    minOrderCents: Number(row.min_order_cents || 0),
    businessForm: parseDataJson(row.business_form_json),
  };
}

function validateProductInput(body) {
  const name = String(body.name || "").trim();
  if (!name) throw new Error("Product name is required");
  const priceCents = Number(body.price_cents ?? body.priceCents);
  if (!Number.isInteger(priceCents) || priceCents < 0) throw new Error("price_cents must be a non-negative integer");
  return { name, description: body.description == null ? null : String(body.description), priceCents, categoryId: body.category_id || null, available: body.available !== false, imagePath: body.image_path ? String(body.image_path) : null };
}

function createOrder(database, storeId, storeName, body) {
  const phone = normalizePhone(body.phone || body.jid);
  if (!phone || phone === "unknown") throw new Error("Customer phone is required");
  const itemsInput = Array.isArray(body.items) ? body.items : [];
  if (!itemsInput.length) throw new Error("At least one order item is required");
  const store = storeConfig(database, storeId, storeName);
  const now = new Date().toISOString();
  return database.transaction(() => {
    let customer = database.prepare("SELECT * FROM customer WHERE store_id = ? AND phone_normalized = ?").get(storeId, phone);
    if (!customer) {
      const customerId = crypto.randomUUID();
      database.prepare(`INSERT INTO customer (id, store_id, phone_normalized, name, email, notes, first_order_at, last_order_at, order_count, total_spent_cents, currency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, 0, 0, 'BRL', 'ACTIVE', ?, ?)`)
        .run(customerId, storeId, phone, body.customer_name || null, body.email || null, now, now);
      customer = database.prepare("SELECT * FROM customer WHERE id = ?").get(customerId);
    }

    let conversation = database.prepare("SELECT * FROM conversation WHERE store_id = ? AND external_thread_id = ?").get(storeId, phone);
    if (!conversation) {
      const id = crypto.randomUUID();
      database.prepare(`INSERT INTO conversation (id, store_id, customer_id, external_thread_id, lifecycle_state, ownership, ai_state, unread_count, created_at, updated_at) VALUES (?, ?, ?, ?, 'OPEN', 'AI', 'ACTIVE', 0, ?, ?)`)
        .run(id, storeId, customer.id, phone, now, now);
      conversation = database.prepare("SELECT * FROM conversation WHERE id = ?").get(id);
    }

    const resolvedItems = [];
    let subtotal = 0;
    for (const item of itemsInput) {
      const productId = String(item.product_id || item.productId || "").trim();
      const quantity = Number(item.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity <= 0) throw new Error("Invalid order item");
      const product = database.prepare("SELECT id, name, price_cents, available FROM product WHERE store_id = ? AND id = ?").get(storeId, productId);
      if (!product) throw new Error(`Product not found: ${productId}`);
      if (product.available !== 1) throw new Error(`Product unavailable: ${product.name}`);
      const itemSubtotal = product.price_cents * quantity;
      subtotal += itemSubtotal;
      resolvedItems.push({ product, quantity, subtotal: itemSubtotal });
    }

    const delivery = String(body.delivery_type || body.deliveryType || "PICKUP").toUpperCase();
    if (!["PICKUP", "DELIVERY"].includes(delivery)) throw new Error("delivery_type must be PICKUP or DELIVERY");
    if (subtotal < store.minOrderCents) throw new Error(`Minimum order is ${store.minOrderCents} cents`);
    const deliveryFee = delivery === "DELIVERY" ? store.deliveryFeeCents : 0;
    const total = subtotal + deliveryFee;
    const orderId = crypto.randomUUID();
    const displayNumber = String(database.prepare("SELECT COALESCE(MAX(CAST(display_number AS INTEGER)), 0) + 1 AS next FROM \"order\" WHERE store_id = ?").get(storeId).next);

    let addressId = null;
    if (delivery === "DELIVERY") {
      const address = body.address || {};
      if (!address.street || !address.number || !address.neighborhood || !address.city || !address.state || !address.postal_code) throw new Error("Complete delivery address is required");
      addressId = crypto.randomUUID();
      database.prepare(`INSERT INTO customer_address (id, customer_id, label, street, number, complement, neighborhood, city, state, postal_code, reference, created_at, updated_at) VALUES (?, ?, 'delivery', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(addressId, customer.id, String(address.street), String(address.number), address.complement || null, String(address.neighborhood), String(address.city), String(address.state), String(address.postal_code), address.reference || null, now, now);
    }

    let paymentMethodId = null;
    if (body.payment_method || body.paymentMethod) {
      paymentMethodId = crypto.randomUUID();
      const label = String(body.payment_method || body.paymentMethod);
      database.prepare(`INSERT INTO payment_method (id, customer_id, method_type, display_label, created_at) VALUES (?, ?, ?, ?, ?)`)
        .run(paymentMethodId, customer.id, label.toLowerCase(), label, now);
    }

    database.prepare(`INSERT INTO \"order\" (id, store_id, display_number, customer_id, conversation_id, lifecycle_state, subtotal_cents, discount_cents, delivery_fee_cents, total_cents, currency, delivery_type, address_id, payment_method_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'CONFIRMED', ?, 0, ?, ?, 'BRL', ?, ?, ?, ?, ?, ?)`)
      .run(orderId, storeId, displayNumber, customer.id, conversation.id, subtotal, deliveryFee, total, delivery, addressId, paymentMethodId, body.notes || null, now, now);

    for (const item of resolvedItems) {
      database.prepare(`INSERT INTO order_item (id, order_id, product_id, product_name_snapshot, unit_price_cents_snapshot, quantity, subtotal_cents) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(crypto.randomUUID(), orderId, item.product.id, item.product.name, item.product.price_cents, item.quantity, item.subtotal);
    }

    const firstOrderAt = customer.first_order_at || now;
    database.prepare("UPDATE customer SET name = COALESCE(?, name), email = COALESCE(?, email), first_order_at = ?, last_order_at = ?, order_count = order_count + 1, total_spent_cents = total_spent_cents + ?, updated_at = ? WHERE id = ?")
      .run(body.customer_name || null, body.email || null, firstOrderAt, now, total, now, customer.id);

    database.prepare(`INSERT INTO domain_outbox (id, idempotency_key, event_type, aggregate_id, payload, occurred_at_utc, attempts, processed_at, created_at) VALUES (?, ?, 'order.confirmed', ?, ?, ?, 0, NULL, ?)`)
      .run(crypto.randomUUID(), `order.confirmed:${orderId}`, orderId, JSON.stringify({ order_id: orderId, customer_id: customer.id, total_cents: total }), now, now);

    return { order_id: orderId, display_number: displayNumber, customer_id: customer.id, subtotal_cents: subtotal, delivery_fee_cents: deliveryFee, total_cents: total, delivery_type: delivery, currency: "BRL" };
  })();
}

function dashboardData(database, storeId, storeName) {
  const store = storeConfig(database, storeId, storeName);
  const customers = database.prepare("SELECT COUNT(*) AS total FROM customer WHERE store_id = ?").get(storeId).total;
  const conversations = database.prepare("SELECT COUNT(*) AS total FROM conversation WHERE store_id = ? AND lifecycle_state = 'OPEN'").get(storeId).total;
  const messagesToday = database.prepare("SELECT COUNT(*) AS total FROM message WHERE store_id = ? AND created_at >= date('now')").get(storeId).total;
  const salesToday = database.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(total_cents),0) AS total_cents FROM \"order\" WHERE store_id = ? AND created_at >= date('now') AND lifecycle_state <> 'CANCELLED'").get(storeId);
  const pendingOrders = database.prepare("SELECT COUNT(*) AS total FROM \"order\" WHERE store_id = ? AND lifecycle_state IN ('CONFIRMED','IN_PRODUCTION','READY','OUT_FOR_DELIVERY')").get(storeId).total;
  return { store, customers: Number(customers), openConversations: Number(conversations), messagesToday: Number(messagesToday), salesToday: { count: Number(salesToday.count), totalCents: Number(salesToday.total_cents), currency: "BRL" }, pendingOrders: Number(pendingOrders) };
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
    try {
      const url = new URL(request.url || "/", `http://${host}`);
      if (request.method === "GET" && url.pathname === "/health") return json(response, 200, { status: "ok", database: filePath });

      if (request.method === "POST" && url.pathname === "/internal/v1/whatsapp/message") {
        const event = await readJson(request);
        return json(response, 200, persistMessage(database, storeId, storeName, event));
      }

      if (request.method === "GET" && url.pathname === "/internal/v1/business") return json(response, 200, storeConfig(database, storeId, storeName));
      if (request.method === "PUT" && url.pathname === "/internal/v1/business") {
        const body = await readJson(request);
        const next = storeConfig(database, storeId, storeName);
        const deliveryEnabled = body.delivery_enabled == null ? next.deliveryEnabled : Boolean(body.delivery_enabled);
        const deliveryFeeCents = body.delivery_fee_cents == null ? next.deliveryFeeCents : Number(body.delivery_fee_cents);
        const minOrderCents = body.min_order_cents == null ? next.minOrderCents : Number(body.min_order_cents);
        if (!Number.isInteger(deliveryFeeCents) || deliveryFeeCents < 0 || !Number.isInteger(minOrderCents) || minOrderCents < 0) throw new Error("Invalid delivery/minimum order values");
        const businessForm = body.business_form == null ? next.businessForm : body.business_form;
        database.prepare("UPDATE store SET name = ?, delivery_enabled = ?, delivery_fee_cents = ?, min_order_cents = ?, business_form_json = ? WHERE id = ?")
          .run(body.name ? String(body.name).trim() : next.name, deliveryEnabled ? 1 : 0, deliveryFeeCents, minOrderCents, JSON.stringify(businessForm || {}), storeId);
        return json(response, 200, storeConfig(database, storeId, storeName));
      }

      if (request.method === "GET" && url.pathname === "/internal/v1/products") {
        const products = database.prepare("SELECT id, store_id, category_id, name, description, price_cents, currency, available, image_path, created_at, updated_at FROM product WHERE store_id = ? ORDER BY name COLLATE NOCASE").all(storeId).map((item) => ({ ...item, price_cents: Number(item.price_cents), available: item.available === 1 }));
        return json(response, 200, { products });
      }
      if (request.method === "POST" && url.pathname === "/internal/v1/products") {
        const body = await readJson(request); const p = validateProductInput(body); const id = String(body.id || crypto.randomUUID()); const now = new Date().toISOString();
        database.prepare(`INSERT INTO product (id, store_id, category_id, name, description, price_cents, currency, available, tags, image_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'BRL', ?, NULL, ?, ?, ?)`)
          .run(id, storeId, p.categoryId, p.name, p.description, p.priceCents, p.available ? 1 : 0, p.imagePath, now, now);
        return json(response, 201, { product: database.prepare("SELECT id, store_id, category_id, name, description, price_cents, currency, available, image_path FROM product WHERE id = ?").get(id) });
      }
      const productMatch = url.pathname.match(/^\/internal\/v1\/products\/([^/]+)$/);
      if (productMatch) {
        const id = decodeURIComponent(productMatch[1]);
        if (request.method === "GET") return json(response, 200, { product: database.prepare("SELECT * FROM product WHERE store_id = ? AND id = ?").get(storeId, id) || null });
        if (request.method === "PUT") {
          const body = await readJson(request); const current = database.prepare("SELECT * FROM product WHERE store_id = ? AND id = ?").get(storeId, id); if (!current) return json(response, 404, { error: "Product not found" });
          const p = validateProductInput({ ...current, ...body, price_cents: body.price_cents ?? current.price_cents }); const now = new Date().toISOString();
          database.prepare("UPDATE product SET category_id = ?, name = ?, description = ?, price_cents = ?, available = ?, image_path = ?, updated_at = ? WHERE store_id = ? AND id = ?")
            .run(p.categoryId, p.name, p.description, p.priceCents, p.available ? 1 : 0, p.imagePath, now, storeId, id);
          return json(response, 200, { product: database.prepare("SELECT * FROM product WHERE store_id = ? AND id = ?").get(storeId, id) });
        }
        if (request.method === "DELETE") {
          const result = database.prepare("UPDATE product SET available = 0, updated_at = ? WHERE store_id = ? AND id = ?").run(new Date().toISOString(), storeId, id);
          return json(response, 200, { removed: result.changes === 1, deactivated: true });
        }
      }

      if (request.method === "GET" && url.pathname === "/internal/v1/customers") {
        const customers = database.prepare("SELECT id, store_id, phone_normalized, name, email, notes, first_order_at, last_order_at, order_count, total_spent_cents, currency, status, created_at, updated_at FROM customer WHERE store_id = ? ORDER BY updated_at DESC").all(storeId);
        return json(response, 200, { customers: customers.map((c) => ({ ...c, order_count: Number(c.order_count), total_spent_cents: Number(c.total_spent_cents) })) });
      }
      if (request.method === "GET" && url.pathname === "/internal/v1/customers/by-phone") {
        const phone = normalizePhone(url.searchParams.get("phone")); const customer = database.prepare("SELECT * FROM customer WHERE store_id = ? AND phone_normalized = ?").get(storeId, phone);
        if (!customer) return json(response, 404, { error: "Customer not found" });
        const conversation = database.prepare("SELECT * FROM conversation WHERE store_id = ? AND customer_id = ? ORDER BY updated_at DESC LIMIT 1").get(storeId, customer.id);
        return json(response, 200, { customer, conversation });
      }
      const customerMatch = url.pathname.match(/^\/internal\/v1\/customers\/([^/]+)$/);
      if (customerMatch && request.method === "PUT") {
        const id = decodeURIComponent(customerMatch[1]); const body = await readJson(request); const current = database.prepare("SELECT * FROM customer WHERE store_id = ? AND id = ?").get(storeId, id); if (!current) return json(response, 404, { error: "Customer not found" });
        const now = new Date().toISOString(); const email = body.email == null ? current.email : String(body.email).trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
        database.prepare("UPDATE customer SET name = ?, email = ?, notes = ?, data_json = ?, updated_at = ? WHERE store_id = ? AND id = ?")
          .run(body.name == null ? current.name : String(body.name).trim(), email || null, body.notes == null ? current.notes : String(body.notes), body.data == null ? current.data_json : JSON.stringify(body.data), now, storeId, id);
        return json(response, 200, { customer: database.prepare("SELECT * FROM customer WHERE id = ?").get(id) });
      }

      if (request.method === "GET" && url.pathname === "/internal/v1/orders") {
        const orders = database.prepare(`SELECT o.id, o.display_number, o.customer_id, c.name AS customer_name, c.phone_normalized, o.lifecycle_state, o.subtotal_cents, o.delivery_fee_cents, o.total_cents, o.delivery_type, o.payment_method_id, o.created_at, o.updated_at FROM "order" o JOIN customer c ON c.id = o.customer_id WHERE o.store_id = ? ORDER BY o.created_at DESC`).all(storeId);
        return json(response, 200, { orders });
      }
      if (request.method === "POST" && url.pathname === "/internal/v1/orders") {
        return json(response, 201, { order: createOrder(database, storeId, storeName, await readJson(request)) });
      }
      if (request.method === "GET" && url.pathname === "/internal/v1/dashboard") return json(response, 200, dashboardData(database, storeId, storeName));

      return json(response, 404, { error: "not_found" });
    } catch (error) {
      return json(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
  });

  server.listen(port, host, () => console.log(`[KassisT Desktop] persistence listening on http://${host}:${port}`));
  return { server, database, filePath, close() { server.close(); database.close(); } };
}

module.exports = { startPersistenceServer, ensureMigrations, persistMessage };
