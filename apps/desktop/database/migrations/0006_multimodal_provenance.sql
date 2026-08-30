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
CREATE INDEX IF NOT EXISTS idx_media_asset_store_status ON media_asset(store_id, download_status);

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
  FOREIGN KEY (media_asset_id) REFERENCES media_asset(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_multimodal_extraction_message_id ON multimodal_extraction(message_id);
CREATE INDEX IF NOT EXISTS idx_multimodal_extraction_media_status ON multimodal_extraction(media_asset_id, modality, status);

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
  FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (source_message_id) REFERENCES message(id) ON DELETE RESTRICT ON UPDATE RESTRICT
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
  FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT ON UPDATE RESTRICT
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
  FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_message_processing_message ON message_processing(message_id);

INSERT OR REPLACE INTO _schema_metadata(key, value)
VALUES ('schema_version', '0006');
