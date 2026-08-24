CREATE TABLE IF NOT EXISTS product (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price_amount_cents INTEGER NOT NULL CHECK (price_amount_cents >= 0),
  price_currency TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "order" (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  status TEXT NOT NULL,
  total_amount_cents INTEGER NOT NULL CHECK (total_amount_cents >= 0),
  total_currency TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_item (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  unit_price_currency TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES "order"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_item_modifier (
  id TEXT PRIMARY KEY,
  order_item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  price_currency TEXT NOT NULL,
  FOREIGN KEY (order_item_id) REFERENCES order_item(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_store_id ON product(store_id);
CREATE INDEX IF NOT EXISTS idx_order_store_id ON "order"(store_id);
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_modifier_order_item_id ON order_item_modifier(order_item_id);

INSERT OR REPLACE INTO _schema_metadata(key, value)
VALUES ('schema_version', '0002');
