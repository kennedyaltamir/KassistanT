-- KassisT initial schema contract skeleton.
-- This migration intentionally establishes only a small persistence foundation.
CREATE TABLE IF NOT EXISTS _schema_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO _schema_metadata(key, value)
VALUES ('schema_version', '0001');

-- Future canonical entities must use UUIDv7 identifiers, store_id scoping,
-- UTC timestamps and integer cents for monetary values.
