PRAGMA foreign_keys = ON;

ALTER TABLE store ADD COLUMN delivery_enabled INTEGER NOT NULL DEFAULT 1 CHECK (delivery_enabled IN (0, 1));
ALTER TABLE store ADD COLUMN delivery_fee_cents INTEGER NOT NULL DEFAULT 300 CHECK (delivery_fee_cents >= 0);
ALTER TABLE store ADD COLUMN min_order_cents INTEGER NOT NULL DEFAULT 0 CHECK (min_order_cents >= 0);
ALTER TABLE store ADD COLUMN business_form_json TEXT NULL;

ALTER TABLE product ADD COLUMN image_path TEXT NULL;
ALTER TABLE customer ADD COLUMN email TEXT NULL;
ALTER TABLE customer ADD COLUMN data_json TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(store_id, email);
CREATE INDEX IF NOT EXISTS idx_order_created_at ON "order"(store_id, created_at);
CREATE INDEX IF NOT EXISTS idx_message_conversation_created_at ON message(conversation_id, created_at);

INSERT OR REPLACE INTO _schema_metadata(key, value)
VALUES ('schema_version', '0005');
