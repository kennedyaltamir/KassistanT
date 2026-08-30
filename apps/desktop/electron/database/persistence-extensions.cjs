const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function json(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(payload)
  });
  response.end(payload);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 30_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!raw) return resolve({});
      try {
        const value = JSON.parse(raw);
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid JSON object");
        resolve(value);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function now() {
  return new Date().toISOString();
}

function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeJson(value, fallback = null) {
  try {
    return JSON.stringify(value ?? fallback);
  } catch {
    return JSON.stringify(fallback);
  }
}

function parseJson(value, fallback = null) {
  if (typeof value !== "string" || value.length === 0) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function ensureSchema(database) {
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS media_asset (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      store_id TEXT NOT NULL,
      media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT')),
      mime_type TEXT NULL,
      storage_reference TEXT NOT NULL,
      size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
      sha256 TEXT NOT NULL,
      download_status TEXT NOT NULL CHECK (download_status IN ('PENDING', 'COMPLETED', 'FAILED')),
      error_code TEXT NULL,
      error_message TEXT NULL,
      downloaded_at TEXT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(store_id, message_id),
      FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE RESTRICT ON UPDATE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS idx_media_asset_message_id ON media_asset(message_id);
    CREATE TABLE IF NOT EXISTS multimodal_extraction (
      id TEXT PRIMARY KEY,
      media_asset_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      modality TEXT NOT NULL CHECK (modality IN ('VISION', 'TRANSCRIPTION')),
      status TEXT NOT NULL CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED', 'UNAVAILABLE', 'TIMEOUT')),
      extracted_text TEXT NULL,
      structured_json TEXT NULL,
      confidence REAL NULL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
      provider TEXT NULL,
      model TEXT NULL,
      error_code TEXT NULL,
      error_message TEXT NULL,
      correlation_id TEXT NULL,
      causation_id TEXT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (media_asset_id) REFERENCES media_asset(id) ON DELETE RESTRICT,
      FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS idx_multimodal_extraction_message_id ON multimodal_extraction(message_id);
    CREATE TABLE IF NOT EXISTS customer_fact (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      fact_key TEXT NOT NULL,
      fact_value TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_message_id TEXT NULL,
      confidence REAL NULL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
      status TEXT NOT NULL CHECK (status IN ('CANDIDATE', 'CONFIRMED', 'CONFLICTED', 'REJECTED')),
      extracted_at TEXT NOT NULL,
      confirmed_at TEXT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT,
      FOREIGN KEY (source_message_id) REFERENCES message(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS idx_customer_fact_customer_key ON customer_fact(customer_id, fact_key, status);
    CREATE INDEX IF NOT EXISTS idx_customer_fact_source ON customer_fact(source_type, source_id);
    CREATE TABLE IF NOT EXISTS customer_source_link (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      metadata_json TEXT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(customer_id, source_type, source_id),
      FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS idx_customer_source_link_source ON customer_source_link(source_type, source_id);
    CREATE TABLE IF NOT EXISTS message_processing (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'UNAVAILABLE', 'TIMEOUT')),
      error_code TEXT NULL,
      error_message TEXT NULL,
      provider TEXT NULL,
      model TEXT NULL,
      correlation_id TEXT NULL,
      causation_id TEXT NULL,
      started_at TEXT NULL,
      completed_at TEXT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(message_id, stage),
      FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS idx_message_processing_message ON message_processing(message_id);
  `);
}

function ensureMessage(database, messageId) {
  const row = database.prepare("SELECT id, store_id, conversation_id FROM message WHERE id = ?").get(messageId);
  if (!row) throw new Error("Message not found");
  return row;
}

function upsertProcessing(database, input) {
  const message = ensureMessage(database, input.messageId);
  const timestamp = now();
  const stage = safeString(input.stage);
  if (!stage) throw new Error("Processing stage is required");
  database.prepare(`
    INSERT INTO message_processing (
      id, message_id, stage, status, error_code, error_message, provider, model,
      correlation_id, causation_id, started_at, completed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(message_id, stage) DO UPDATE SET
      status=excluded.status,
      error_code=excluded.error_code,
      error_message=excluded.error_message,
      provider=excluded.provider,
      model=excluded.model,
      correlation_id=excluded.correlation_id,
      causation_id=excluded.causation_id,
      started_at=excluded.started_at,
      completed_at=excluded.completed_at,
      updated_at=excluded.updated_at
  `).run(
    safeString(input.id) || crypto.randomUUID(), message.id, stage,
    safeString(input.status) || "PENDING", safeString(input.errorCode) || null,
    safeString(input.errorMessage) || null, safeString(input.provider) || null,
    safeString(input.model) || null, safeString(input.correlationId) || null,
    safeString(input.causationId) || null, safeString(input.startedAt) || timestamp,
    safeString(input.completedAt) || null, timestamp, timestamp
  );
  return { messageId: message.id, stage };
}

function persistMedia(database, input, mediaRoot) {
  const message = ensureMessage(database, input.messageId);
  const mediaType = safeString(input.mediaType).toUpperCase();
  if (!["IMAGE", "AUDIO", "VIDEO", "DOCUMENT"].includes(mediaType)) throw new Error("Unsupported media type");
  const mimeType = safeString(input.mimeType) || null;
  const base64 = safeString(input.base64);
  if (!base64) throw new Error("Media base64 content is required");
  const data = Buffer.from(base64, "base64");
  if (data.length === 0) throw new Error("Media content is empty");
  const maxBytes = Number(process.env.KASSIST_MAX_MEDIA_BYTES || 25 * 1024 * 1024);
  if (data.length > maxBytes) throw new Error(`Media exceeds maximum allowed size (${maxBytes} bytes)`);
  const sha256 = crypto.createHash("sha256").update(data).digest("hex");
  const extension = mediaType === "IMAGE" ? ".bin" : mediaType === "AUDIO" ? ".bin" : ".bin";
  const directory = path.join(mediaRoot, "incoming", mediaType.toLowerCase());
  fs.mkdirSync(directory, { recursive: true });
  const storageReference = path.join(directory, `${sha256}${extension}`);
  if (!fs.existsSync(storageReference)) fs.writeFileSync(storageReference, data, { flag: "wx" });
  const timestamp = now();
  const id = crypto.randomUUID();
  database.prepare(`
    INSERT INTO media_asset (
      id, message_id, store_id, media_type, mime_type, storage_reference, size_bytes,
      sha256, download_status, error_code, error_message, downloaded_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', NULL, NULL, ?, ?, ?)
    ON CONFLICT(store_id, message_id) DO UPDATE SET
      media_type=excluded.media_type,
      mime_type=excluded.mime_type,
      storage_reference=excluded.storage_reference,
      size_bytes=excluded.size_bytes,
      sha256=excluded.sha256,
      download_status='COMPLETED',
      error_code=NULL,
      error_message=NULL,
      downloaded_at=excluded.downloaded_at,
      updated_at=excluded.updated_at
  `).run(id, message.id, message.store_id, mediaType, mimeType, storageReference, data.length, sha256, timestamp, timestamp, timestamp);
  const row = database.prepare("SELECT * FROM media_asset WHERE store_id = ? AND message_id = ?").get(message.store_id, message.id);
  return {
    id: row.id,
    messageId: row.message_id,
    mediaType: row.media_type,
    mimeType: row.mime_type,
    storageReference: row.storage_reference,
    sizeBytes: row.size_bytes,
    sha256: row.sha256,
    downloadStatus: row.download_status,
    downloadedAt: row.downloaded_at
  };
}

function persistExtraction(database, input) {
  const message = ensureMessage(database, input.messageId);
  const media = database.prepare("SELECT * FROM media_asset WHERE id = ? AND message_id = ?").get(input.mediaAssetId, message.id);
  if (!media) throw new Error("Media asset not found for message");
  const timestamp = now();
  const modality = safeString(input.modality).toUpperCase();
  if (!["VISION", "TRANSCRIPTION"].includes(modality)) throw new Error("Unsupported extraction modality");
  const status = safeString(input.status).toUpperCase();
  if (!["PROCESSING", "COMPLETED", "FAILED", "UNAVAILABLE", "TIMEOUT"].includes(status)) throw new Error("Unsupported extraction status");
  const extractionId = crypto.randomUUID();
  database.prepare(`
    INSERT INTO multimodal_extraction (
      id, media_asset_id, message_id, modality, status, extracted_text, structured_json,
      confidence, provider, model, error_code, error_message, correlation_id, causation_id,
      started_at, completed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    extractionId, media.id, message.id, modality, status,
    typeof input.extractedText === "string" ? input.extractedText : null,
    input.structured === undefined ? null : safeJson(input.structured),
    input.confidence == null ? null : Number(input.confidence),
    safeString(input.provider) || null, safeString(input.model) || null,
    safeString(input.errorCode) || null, safeString(input.errorMessage) || null,
    safeString(input.correlationId) || null, safeString(input.causationId) || null,
    safeString(input.startedAt) || timestamp, safeString(input.completedAt) || (status === "PROCESSING" ? null : timestamp),
    timestamp, timestamp
  );
  return database.prepare("SELECT * FROM multimodal_extraction WHERE id = ?").get(extractionId);
}

function persistCustomerFacts(database, input) {
  const customerId = safeString(input.customerId);
  if (!customerId) throw new Error("customerId is required");
  const customer = database.prepare("SELECT id FROM customer WHERE id = ?").get(customerId);
  if (!customer) throw new Error("Customer not found");
  const facts = Array.isArray(input.facts) ? input.facts : [];
  const timestamp = now();
  const inserted = [];
  const transaction = database.transaction(() => {
    for (const fact of facts) {
      const key = safeString(fact?.factKey);
      const value = safeString(fact?.factValue);
      const sourceType = safeString(fact?.sourceType) || "conversation_message";
      const sourceId = safeString(fact?.sourceId) || safeString(fact?.sourceMessageId);
      if (!key || !value || !sourceId) continue;
      const sourceMessageId = safeString(fact?.sourceMessageId) || null;
      if (sourceMessageId) ensureMessage(database, sourceMessageId);
      const status = ["CANDIDATE", "CONFIRMED", "CONFLICTED", "REJECTED"].includes(safeString(fact?.status).toUpperCase())
        ? safeString(fact?.status).toUpperCase()
        : "CANDIDATE";
      const existingConfirmed = database.prepare(`
        SELECT id, fact_value FROM customer_fact
        WHERE customer_id = ? AND fact_key = ? AND status = 'CONFIRMED'
        ORDER BY updated_at DESC LIMIT 1
      `).get(customerId, key);
      const finalStatus = existingConfirmed && existingConfirmed.fact_value.toLowerCase() !== value.toLowerCase()
        ? "CONFLICTED"
        : status;
      const id = crypto.randomUUID();
      database.prepare(`
        INSERT INTO customer_fact (
          id, customer_id, fact_key, fact_value, source_type, source_id, source_message_id,
          confidence, status, extracted_at, confirmed_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, customerId, key, value, sourceType, sourceId, sourceMessageId,
        fact?.confidence == null ? null : Number(fact.confidence), finalStatus,
        safeString(fact?.extractedAt) || timestamp,
        finalStatus === "CONFIRMED" ? safeString(fact?.confirmedAt) || timestamp : null,
        timestamp
      );
      inserted.push(id);
    }
  });
  transaction();
  return database.prepare(`SELECT * FROM customer_fact WHERE id IN (${inserted.map(() => "?").join(",") || "NULL"})`).all(...inserted);
}

function linkCustomerSource(database, input) {
  const customerId = safeString(input.customerId);
  const sourceType = safeString(input.sourceType);
  const sourceId = safeString(input.sourceId);
  if (!customerId || !sourceType || !sourceId) throw new Error("customerId, sourceType and sourceId are required");
  if (!database.prepare("SELECT id FROM customer WHERE id = ?").get(customerId)) throw new Error("Customer not found");
  const timestamp = now();
  const id = crypto.randomUUID();
  database.prepare(`
    INSERT INTO customer_source_link (id, customer_id, source_type, source_id, metadata_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(customer_id, source_type, source_id) DO UPDATE SET metadata_json=excluded.metadata_json, updated_at=excluded.updated_at
  `).run(id, customerId, sourceType, sourceId, input.metadata === undefined ? null : safeJson(input.metadata), timestamp, timestamp);
  return database.prepare(`SELECT * FROM customer_source_link WHERE customer_id = ? AND source_type = ? AND source_id = ?`).get(customerId, sourceType, sourceId);
}

function buildContext(database, storeId, jid, limit = 50) {
  const context = database.prepare(`
    SELECT c.id, c.customer_id, c.external_thread_id, c.lifecycle_state, c.ownership, c.ai_state,
      c.unread_count, c.created_at, c.updated_at, cu.name AS customer_name, cu.phone_normalized,
      cu.notes, cu.status AS customer_status
    FROM conversation c JOIN customer cu ON cu.id = c.customer_id
    WHERE c.store_id = ? AND c.external_thread_id = ?
  `).get(storeId, jid);
  if (!context) return null;
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 500));
  const messages = database.prepare(`
    SELECT id, external_message_id, direction, sender_type, message_type, text, lifecycle_state,
      correlation_id, causation_id, created_at, updated_at
    FROM message WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(context.id, safeLimit).reverse();
  const mediaByMessage = new Map();
  for (const row of database.prepare(`SELECT * FROM media_asset WHERE message_id IN (SELECT id FROM message WHERE conversation_id = ?)`).all(context.id)) {
    mediaByMessage.set(row.message_id, {
      id: row.id, mediaType: row.media_type, mimeType: row.mime_type, storageReference: row.storage_reference,
      sizeBytes: row.size_bytes, sha256: row.sha256, downloadStatus: row.download_status,
      errorCode: row.error_code, errorMessage: row.error_message
    });
  }
  const extractions = database.prepare(`
    SELECT * FROM multimodal_extraction WHERE message_id IN (SELECT id FROM message WHERE conversation_id = ?)
    ORDER BY created_at ASC
  `).all(context.id).map((row) => ({
    id: row.id, messageId: row.message_id, mediaAssetId: row.media_asset_id, modality: row.modality,
    status: row.status, extractedText: row.extracted_text, structured: parseJson(row.structured_json),
    confidence: row.confidence, provider: row.provider, model: row.model, errorCode: row.error_code,
    errorMessage: row.error_message, correlationId: row.correlation_id, causationId: row.causation_id,
    startedAt: row.started_at, completedAt: row.completed_at
  }));
  const facts = database.prepare(`
    SELECT id, fact_key, fact_value, source_type, source_id, source_message_id, confidence, status,
      extracted_at, confirmed_at, updated_at FROM customer_fact
    WHERE customer_id = ? AND status <> 'REJECTED' ORDER BY updated_at DESC LIMIT 200
  `).all(context.customer_id).map((row) => ({
    id: row.id, key: row.fact_key, value: row.fact_value, sourceType: row.source_type, sourceId: row.source_id,
    sourceMessageId: row.source_message_id, confidence: row.confidence, status: row.status,
    extractedAt: row.extracted_at, confirmedAt: row.confirmed_at, updatedAt: row.updated_at
  }));
  const sources = database.prepare(`
    SELECT id, source_type, source_id, metadata_json, created_at, updated_at
    FROM customer_source_link WHERE customer_id = ? ORDER BY updated_at DESC
  `).all(context.customer_id).map((row) => ({ id: row.id, sourceType: row.source_type, sourceId: row.source_id, metadata: parseJson(row.metadata_json), createdAt: row.created_at, updatedAt: row.updated_at }));
  const addresses = database.prepare(`
    SELECT id, label, street, number, complement, neighborhood, city, state, postal_code, reference
    FROM customer_address WHERE customer_id = ? ORDER BY updated_at DESC
  `).all(context.customer_id);
  const activeOrder = database.prepare(`
    SELECT id, display_number, lifecycle_state, subtotal_cents, delivery_fee_cents, total_cents,
      currency, delivery_type, address_id, payment_method_id, notes, created_at, updated_at
    FROM "order" WHERE conversation_id = ? AND lifecycle_state NOT IN ('DELIVERED', 'CANCELLED')
    ORDER BY updated_at DESC LIMIT 1
  `).get(context.id) || null;
  const products = database.prepare(`
    SELECT p.id, p.name, p.description, p.price_cents, p.currency, p.stock_quantity, p.available,
      c.name AS category FROM product p LEFT JOIN product_category c ON c.id = p.category_id
    WHERE p.store_id = ? AND p.available = 1 ORDER BY p.name ASC LIMIT 200
  `).all(storeId).map((row) => ({
    id: row.id, name: row.name, description: row.description, priceCents: row.price_cents,
    currency: row.currency, stockQuantity: row.stock_quantity, available: row.available === 1, category: row.category || null
  }));
  return {
    contextVersion: "2",
    identityBindingStatus: context.phone_normalized && context.phone_normalized !== jid ? "OBSERVED_PHONE_IDENTITY" : "LEGACY_JID_DERIVED",
    identity: { channelJid: jid, phoneNormalized: context.phone_normalized, bindingStatus: context.phone_normalized && context.phone_normalized !== jid ? "OBSERVED_PHONE_IDENTITY" : "LEGACY_JID_DERIVED" },
    customer: { id: context.customer_id, name: context.customer_name, phoneNormalized: context.phone_normalized, notes: context.notes, status: context.customer_status, addresses },
    customerMemory: { facts, sources },
    conversation: { id: context.id, externalThreadId: context.external_thread_id, lifecycleState: context.lifecycle_state, ownership: context.ownership, aiState: context.ai_state, unreadCount: context.unread_count, createdAt: context.created_at, updatedAt: context.updated_at },
    currentState: { lifecycleState: context.lifecycle_state, ownership: context.ownership, aiState: context.ai_state },
    messages: messages.map((row) => ({ ...row, media: mediaByMessage.get(row.id) || null, extractions: extractions.filter((item) => item.messageId === row.id) })),
    multimodal: extractions,
    relevantMemories: facts,
    activeOrder,
    availableProducts: products,
    businessContext: { storeId, storeName: process.env.KASSIST_STORE_NAME || "KassisT" },
    availableActions: ["ASK_CLARIFICATION", "SEARCH_PRODUCT", "ADD_TO_CART", "REQUEST_ORDER_CONFIRMATION", "REQUEST_HUMAN_HANDOFF"]
  };
}

function startPersistenceExtensions(options = {}) {
  const database = options.database;
  if (!database) throw new Error("database is required");
  const host = options.host || "127.0.0.1";
  const port = Number(options.port || 3212);
  const storeId = options.storeId || process.env.KASSIST_STORE_ID || "default-store";
  const mediaRoot = path.resolve(options.mediaRoot || process.env.KASSIST_MEDIA_ROOT || path.join(process.cwd(), ".data", "media"));
  fs.mkdirSync(mediaRoot, { recursive: true });
  ensureSchema(database);

  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${host}:${port}`);
    try {
      if (request.method === "GET" && url.pathname === "/health") return json(response, 200, { status: "ok", service: "persistence-extensions", schema: "0006" });
      if (request.method === "POST" && url.pathname === "/internal/v2/message-processing") return json(response, 200, upsertProcessing(database, await readJson(request)));
      if (request.method === "POST" && url.pathname === "/internal/v2/media") return json(response, 201, persistMedia(database, await readJson(request), mediaRoot));
      if (request.method === "POST" && url.pathname === "/internal/v2/extractions") return json(response, 201, persistExtraction(database, await readJson(request)));
      if (request.method === "POST" && url.pathname === "/internal/v2/customer-facts") return json(response, 201, { facts: persistCustomerFacts(database, await readJson(request)) });
      if (request.method === "POST" && url.pathname === "/internal/v2/customer-sources") return json(response, 201, { source: linkCustomerSource(database, await readJson(request)) });
      if (request.method === "GET" && url.pathname === "/internal/v2/conversation-context") {
        const jid = safeString(url.searchParams.get("jid"));
        const context = buildContext(database, storeId, jid, url.searchParams.get("limit"));
        return context ? json(response, 200, context) : json(response, 404, { error: "Conversation not found" });
      }
      return json(response, 404, { error: "not_found" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[KassisT PersistenceExt] ${request.method} ${url.pathname} failed: ${message}`);
      return json(response, 400, { error: message });
    }
  });
  server.listen(port, host, () => console.log(`[KassisT Desktop] persistence extensions listening on http://${host}:${port}`));
  return { server, close() { server.close(); } };
}

module.exports = { startPersistenceExtensions, ensureSchema, buildContext, persistMedia, persistExtraction, persistCustomerFacts, upsertProcessing };
