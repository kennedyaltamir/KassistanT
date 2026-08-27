CREATE TABLE IF NOT EXISTS order_item_modifier (
  id TEXT PRIMARY KEY,
  order_item_id TEXT NOT NULL,
  modifier_name_snapshot TEXT NOT NULL,
  unit_price_cents_snapshot INTEGER NOT NULL CHECK (unit_price_cents_snapshot >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  FOREIGN KEY (order_item_id) REFERENCES order_item(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_order_item_modifier_order_item_id
  ON order_item_modifier(order_item_id);

INSERT OR REPLACE INTO _schema_metadata(key, value)
VALUES ('schema_version', '0004');
