PRAGMA foreign_keys = ON;

ALTER TABLE product ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0);
ALTER TABLE product ADD COLUMN image_reference TEXT NULL;

INSERT OR REPLACE INTO _schema_metadata(key, value)
VALUES ('schema_version', '0005');
