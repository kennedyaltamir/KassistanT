PRAGMA foreign_keys = ON;

-- Upgrade legacy conversation rows that predate the canonical external thread identity.
-- The value for old rows is intentionally namespaced by conversation id so migration
-- remains deterministic and does not merge unrelated conversations. New runtime rows
-- continue to use the real WhatsApp JID/LID as external_thread_id.

ALTER TABLE conversation ADD COLUMN external_thread_id TEXT NOT NULL DEFAULT '';

UPDATE conversation
SET external_thread_id = 'legacy:' || id
WHERE external_thread_id = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_store_external_thread
  ON conversation(store_id, external_thread_id);
