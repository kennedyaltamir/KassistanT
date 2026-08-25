CREATE TABLE IF NOT EXISTS assistant_configuration (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL UNIQUE REFERENCES store(id),
  company_name TEXT NOT NULL DEFAULT '',
  company_address TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  business_hours_json TEXT NOT NULL DEFAULT '{}',
  assistant_name TEXT NOT NULL DEFAULT 'Kassis',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  conversation_mode TEXT NOT NULL DEFAULT 'CORDIAL',
  behavior_instructions TEXT NOT NULL DEFAULT '',
  customer_context_policy_json TEXT NOT NULL DEFAULT '{"name":true,"phone":false,"whatsapp_id":true,"preferences":true,"conversation_history":true,"order_history":true,"relationship":false,"address":false,"email":false}',
  history_policy_json TEXT NOT NULL DEFAULT '{"enabled":true,"max_messages":30}',
  after_hours_policy_json TEXT NOT NULL DEFAULT '{"enabled":true,"message":"No momento estamos fora do horário de atendimento."}',
  sale_notification_policy_json TEXT NOT NULL DEFAULT '{"enabled":false,"channel":"WHATSAPP"}',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assistant_configuration_store
  ON assistant_configuration(store_id);
