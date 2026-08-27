PRAGMA foreign_keys = ON;

-- First-sale physical contract. The historical 0002 migration is intentionally
-- not executed by the migration discovery policy.

CREATE TABLE IF NOT EXISTS store (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_category (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  category_id TEXT NULL,
  name TEXT NOT NULL,
  description TEXT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL CHECK (currency = 'BRL'),
  available INTEGER NOT NULL CHECK (available IN (0, 1)),
  tags TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES product_category(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_product_store_id ON product(store_id);
CREATE INDEX IF NOT EXISTS idx_product_category_id ON product(category_id);

CREATE TABLE IF NOT EXISTS customer (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  phone_normalized TEXT NOT NULL,
  name TEXT NULL,
  notes TEXT NULL,
  first_order_at TEXT NULL,
  last_order_at TEXT NULL,
  order_count INTEGER NOT NULL CHECK (order_count >= 0),
  total_spent_cents INTEGER NOT NULL CHECK (total_spent_cents >= 0),
  currency TEXT NOT NULL CHECK (currency = 'BRL'),
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(store_id, phone_normalized),
  FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE IF NOT EXISTS conversation (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  external_thread_id TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL CHECK (lifecycle_state IN ('OPEN', 'CLOSED')),
  ownership TEXT NOT NULL CHECK (ownership IN ('AI', 'HUMAN')),
  ai_state TEXT NOT NULL CHECK (ai_state IN ('ACTIVE', 'PAUSED', 'UNAVAILABLE')),
  unread_count INTEGER NOT NULL CHECK (unread_count >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(store_id, external_thread_id),
  FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE IF NOT EXISTS message (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  external_message_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  sender_type TEXT NOT NULL,
  message_type TEXT NOT NULL,
  text TEXT NULL,
  raw_event_reference TEXT NULL,
  lifecycle_state TEXT NOT NULL CHECK (lifecycle_state IN ('RECEIVED', 'QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'REJECTED')),
  correlation_id TEXT NULL,
  causation_id TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(store_id, external_message_id),
  FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE IF NOT EXISTS customer_address (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  label TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  reference TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE IF NOT EXISTS payment_method (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  method_type TEXT NOT NULL,
  display_label TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE IF NOT EXISTS "order" (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  display_number TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL CHECK (lifecycle_state IN ('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents INTEGER NOT NULL CHECK (discount_cents = 0),
  delivery_fee_cents INTEGER NOT NULL CHECK (delivery_fee_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  currency TEXT NOT NULL CHECK (currency = 'BRL'),
  delivery_type TEXT NOT NULL,
  address_id TEXT NULL,
  payment_method_id TEXT NULL,
  notes TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(store_id, display_number),
  FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (address_id) REFERENCES customer_address(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (payment_method_id) REFERENCES payment_method(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE IF NOT EXISTS order_item (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name_snapshot TEXT NOT NULL,
  unit_price_cents_snapshot INTEGER NOT NULL CHECK (unit_price_cents_snapshot >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  FOREIGN KEY (order_id) REFERENCES "order"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_order_store_id ON "order"(store_id);
CREATE INDEX IF NOT EXISTS idx_order_customer_id ON "order"(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_conversation_id ON "order"(conversation_id);
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id);

CREATE TABLE IF NOT EXISTS inbound_inbox (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  payload_hash TEXT NULL,
  payload_reference TEXT NULL,
  processing_state TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  correlation_id TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(provider, external_event_id)
);

CREATE TABLE IF NOT EXISTS domain_outbox (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  occurred_at_utc TEXT NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts >= 0),
  processed_at TEXT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_domain_outbox_pending ON domain_outbox(processed_at, occurred_at_utc);

INSERT OR REPLACE INTO _schema_metadata(key, value)
VALUES ('schema_version', '0003');
