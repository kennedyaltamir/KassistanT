const crypto = require("node:crypto");

const DEFAULT_CONFIG = Object.freeze({
  company_name: "",
  company_address: "",
  timezone: "America/Sao_Paulo",
  business_hours: {},
  assistant_name: "Kassis",
  language: "pt-BR",
  conversation_mode: "CORDIAL",
  behavior_instructions: "",
  customer_context_policy: {
    name: true,
    phone: false,
    whatsapp_id: true,
    preferences: true,
    conversation_history: true,
    order_history: true,
    relationship: false,
    address: false,
    email: false
  },
  history_policy: { enabled: true, max_messages: 30 },
  after_hours_policy: {
    enabled: true,
    message: "No momento estamos fora do horário de atendimento."
  },
  sale_notification_policy: { enabled: false, channel: "WHATSAPP" },
  enabled: true
});

const MODES = new Set(["PROFESSIONAL", "CORDIAL", "INFORMAL", "CUSTOM"]);
const LANGUAGES = new Set(["pt-BR", "en-US", "es-ES"]);
const CHANNELS = new Set(["WHATSAPP"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(String(value));
  } catch {
    return clone(fallback);
  }
}

function cleanText(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizeIntervals(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  for (const day of dayNames) {
    const intervals = Array.isArray(value[day]) ? value[day] : [];
    result[day] = intervals
      .map((item) => ({ open: String(item?.open ?? ""), close: String(item?.close ?? "") }))
      .filter((item) => /^([01]\d|2[0-3]):[0-5]\d$/.test(item.open) && /^([01]\d|2[0-3]):[0-5]\d$/.test(item.close) && item.open < item.close);
  }
  return result;
}

function validateConfig(input) {
  const errors = [];
  if (cleanText(input.company_name, 160).length < 2) errors.push("COMPANY_NAME_REQUIRED");
  if (cleanText(input.assistant_name, 80).length < 2) errors.push("ASSISTANT_NAME_REQUIRED");
  if (!LANGUAGES.has(input.language)) errors.push("LANGUAGE_UNSUPPORTED");
  if (!MODES.has(input.conversation_mode)) errors.push("CONVERSATION_MODE_UNSUPPORTED");
  const timezone = cleanText(input.timezone, 80);
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
  } catch {
    errors.push("TIMEZONE_INVALID");
  }
  const historyMax = Number(input.history_policy?.max_messages);
  if (!Number.isInteger(historyMax) || historyMax < 1 || historyMax > 200) errors.push("HISTORY_LIMIT_INVALID");
  if (input.sale_notification_policy?.enabled && !CHANNELS.has(input.sale_notification_policy?.channel)) {
    errors.push("SALE_NOTIFICATION_CHANNEL_UNSUPPORTED");
  }
  if (input.after_hours_policy?.enabled && cleanText(input.after_hours_policy?.message, 500).length < 2) {
    errors.push("AFTER_HOURS_MESSAGE_REQUIRED");
  }
  const days = Object.values(normalizeIntervals(input.business_hours));
  for (const intervals of days) {
    for (let index = 1; index < intervals.length; index += 1) {
      if (intervals[index - 1].close > intervals[index].open) errors.push("BUSINESS_HOURS_OVERLAP");
    }
  }
  return { valid: errors.length === 0, errors };
}

function toConfig(row) {
  if (!row) return null;
  return {
    id: row.id,
    store_id: row.store_id,
    company_name: row.company_name,
    company_address: row.company_address || "",
    timezone: row.timezone,
    business_hours: parseJson(row.business_hours_json, {}),
    assistant_name: row.assistant_name,
    language: row.language,
    conversation_mode: row.conversation_mode,
    behavior_instructions: row.behavior_instructions || "",
    customer_context_policy: parseJson(row.customer_context_policy_json, DEFAULT_CONFIG.customer_context_policy),
    history_policy: parseJson(row.history_policy_json, DEFAULT_CONFIG.history_policy),
    after_hours_policy: parseJson(row.after_hours_policy_json, DEFAULT_CONFIG.after_hours_policy),
    sale_notification_policy: parseJson(row.sale_notification_policy_json, DEFAULT_CONFIG.sale_notification_policy),
    enabled: row.enabled === 1,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function normalizeConfig(input) {
  const source = { ...clone(DEFAULT_CONFIG), ...(input || {}) };
  source.company_name = cleanText(source.company_name, 160);
  source.company_address = cleanText(source.company_address, 300);
  source.timezone = cleanText(source.timezone || DEFAULT_CONFIG.timezone, 80);
  source.assistant_name = cleanText(source.assistant_name, 80);
  source.language = String(source.language || DEFAULT_CONFIG.language);
  source.conversation_mode = String(source.conversation_mode || DEFAULT_CONFIG.conversation_mode);
  source.behavior_instructions = cleanText(source.behavior_instructions, 2000);
  source.business_hours = normalizeIntervals(source.business_hours);
  source.history_policy = {
    enabled: source.history_policy?.enabled !== false,
    max_messages: Number(source.history_policy?.max_messages || DEFAULT_CONFIG.history_policy.max_messages)
  };
  source.after_hours_policy = {
    enabled: source.after_hours_policy?.enabled !== false,
    message: cleanText(source.after_hours_policy?.message || DEFAULT_CONFIG.after_hours_policy.message, 500)
  };
  source.customer_context_policy = {
    ...DEFAULT_CONFIG.customer_context_policy,
    ...(source.customer_context_policy || {})
  };
  source.sale_notification_policy = {
    ...DEFAULT_CONFIG.sale_notification_policy,
    ...(source.sale_notification_policy || {})
  };
  source.enabled = source.enabled !== false;
  return source;
}

class AssistantConfigurationStore {
  constructor(database, storeId = process.env.KASSIST_STORE_ID || "default-store") {
    this.database = database;
    this.storeId = storeId;
  }

  get() {
    const row = this.database
      .prepare("SELECT * FROM assistant_configuration WHERE store_id = ?")
      .get(this.storeId);
    return toConfig(row);
  }

  ensure() {
    const existing = this.get();
    if (existing) return existing;
    const now = new Date().toISOString();
    const config = normalizeConfig(DEFAULT_CONFIG);
    this.database.prepare(
      `INSERT INTO assistant_configuration (
        id, store_id, company_name, company_address, timezone, business_hours_json,
        assistant_name, language, conversation_mode, behavior_instructions,
        customer_context_policy_json, history_policy_json, after_hours_policy_json,
        sale_notification_policy_json, enabled, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      crypto.randomUUID(),
      this.storeId,
      config.company_name,
      config.company_address || null,
      config.timezone,
      JSON.stringify(config.business_hours),
      config.assistant_name,
      config.language,
      config.conversation_mode,
      config.behavior_instructions,
      JSON.stringify(config.customer_context_policy),
      JSON.stringify(config.history_policy),
      JSON.stringify(config.after_hours_policy),
      JSON.stringify(config.sale_notification_policy),
      config.enabled ? 1 : 0,
      now,
      now
    );
    return this.get();
  }

  validate(input) {
    const normalized = normalizeConfig({ ...this.ensure(), ...(input || {}) });
    return {
      ...validateConfig(normalized),
      configuration: normalized
    };
  }

  save(input) {
    const validation = this.validate(input);
    if (!validation.valid) {
      const error = new Error("Assistant configuration is invalid");
      error.code = "ASSISTANT_CONFIGURATION_INVALID";
      error.errors = validation.errors;
      throw error;
    }
    const normalized = validation.configuration;
    const existing = this.ensure();
    const now = new Date().toISOString();
    this.database.prepare(
      `UPDATE assistant_configuration
       SET company_name = ?, company_address = ?, timezone = ?, business_hours_json = ?,
           assistant_name = ?, language = ?, conversation_mode = ?, behavior_instructions = ?,
           customer_context_policy_json = ?, history_policy_json = ?, after_hours_policy_json = ?,
           sale_notification_policy_json = ?, enabled = ?, updated_at = ?
       WHERE store_id = ?`
    ).run(
      normalized.company_name,
      normalized.company_address || null,
      normalized.timezone,
      JSON.stringify(normalized.business_hours),
      normalized.assistant_name,
      normalized.language,
      normalized.conversation_mode,
      normalized.behavior_instructions,
      JSON.stringify(normalized.customer_context_policy),
      JSON.stringify(normalized.history_policy),
      JSON.stringify(normalized.after_hours_policy),
      JSON.stringify(normalized.sale_notification_policy),
      normalized.enabled ? 1 : 0,
      now,
      this.storeId
    );
    return this.get() || { ...existing, ...normalized, updated_at: now };
  }
}

module.exports = {
  AssistantConfigurationStore,
  DEFAULT_CONFIG,
  normalizeConfig,
  validateConfig
};
