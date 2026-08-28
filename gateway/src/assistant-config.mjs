import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', 'data', 'assistant-config.json');

const DEFAULT_CONFIG = Object.freeze({
  assistantName: '',
  businessName: '',
  role: '',
  personality: '',
  toneOfVoice: '',
  language: 'pt-BR',
  responseFormat: 'concise_text',
  commercialRules: '',
  deliveryFeePolicy: {
    enabled: false,
    amountCents: null,
    currency: 'BRL',
    rule: ''
  },
  deliveryInstructions: '',
  businessHours: [],
  behaviorInstructions: '',
  limitations: '',
  llm: {
    provider: 'ollama',
    model: 'qwen3:14b',
    baseUrl: 'http://127.0.0.1:11434'
  },
  autoReplyEnabled: false
});

const RESPONSE_FORMATS = new Set(['concise_text', 'natural_text', 'bullet_points', 'markdown']);
const DAYS = new Set(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
const LOCAL_OLLAMA_URLS = new Set(['http://127.0.0.1:11434', 'http://localhost:11434']);

let cached = null;

function configPath() {
  return process.env.KASSIST_ASSISTANT_CONFIG_PATH || DEFAULT_CONFIG_PATH;
}

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

function nonEmptyString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeHours(value) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const day = String(entry.day ?? '').toUpperCase();
    const open = String(entry.open ?? '');
    const close = String(entry.close ?? '');
    const closed = Boolean(entry.closed);
    if (!DAYS.has(day)) return null;
    if (!closed && (!/^([01]\d|2[0-3]):[0-5]\d$/.test(open) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(close))) {
      throw new Error(`Invalid business hour for ${day}`);
    }
    return { day, open, close, closed };
  }).filter(Boolean);
}

function normalize(input = {}) {
  const delivery = input.deliveryFeePolicy && typeof input.deliveryFeePolicy === 'object' ? input.deliveryFeePolicy : {};
  const llm = input.llm && typeof input.llm === 'object' ? input.llm : {};
  const responseFormat = nonEmptyString(input.responseFormat, DEFAULT_CONFIG.responseFormat);
  if (!RESPONSE_FORMATS.has(responseFormat)) throw new Error('Unsupported response format');

  const baseUrl = nonEmptyString(llm.baseUrl, DEFAULT_CONFIG.llm.baseUrl).replace(/\/$/, '');
  if (!LOCAL_OLLAMA_URLS.has(baseUrl)) throw new Error('Assistant LLM baseUrl must point to local Ollama');

  const amountValue = delivery.amountCents;
  let amountCents = null;
  if (amountValue !== null && amountValue !== undefined && amountValue !== '') {
    amountCents = Number(amountValue);
    if (!Number.isInteger(amountCents) || amountCents < 0) throw new Error('Delivery fee amount must be a non-negative integer in cents');
  }

  return {
    assistantName: nonEmptyString(input.assistantName),
    businessName: nonEmptyString(input.businessName),
    role: nonEmptyString(input.role),
    personality: nonEmptyString(input.personality),
    toneOfVoice: nonEmptyString(input.toneOfVoice),
    language: nonEmptyString(input.language, DEFAULT_CONFIG.language),
    responseFormat,
    commercialRules: nonEmptyString(input.commercialRules),
    deliveryFeePolicy: {
      enabled: Boolean(delivery.enabled),
      amountCents,
      currency: nonEmptyString(delivery.currency, 'BRL'),
      rule: nonEmptyString(delivery.rule)
    },
    deliveryInstructions: nonEmptyString(input.deliveryInstructions),
    businessHours: normalizeHours(input.businessHours),
    behaviorInstructions: nonEmptyString(input.behaviorInstructions),
    limitations: nonEmptyString(input.limitations),
    llm: {
      provider: 'ollama',
      model: nonEmptyString(llm.model, DEFAULT_CONFIG.llm.model),
      baseUrl
    },
    autoReplyEnabled: Boolean(input.autoReplyEnabled)
  };
}

function load() {
  if (cached) return cached;
  try {
    const raw = fs.readFileSync(configPath(), 'utf8');
    cached = normalize(JSON.parse(raw));
  } catch {
    cached = cloneDefault();
  }
  return cached;
}

function configurationVersion(config) {
  return crypto.createHash('sha256').update(JSON.stringify(config), 'utf8').digest('hex').slice(0, 16);
}

export function getAssistantConfig() {
  return load();
}

export function getAssistantConfigPath() {
  return configPath();
}

export function updateAssistantConfig(patch = {}) {
  const next = normalize({ ...getAssistantConfig(), ...patch });
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  const tempPath = `${configPath()}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, configPath());
  cached = next;
  return next;
}

function line(label, value) {
  return value ? `${label}: ${value}` : `${label}: [NOT_CONFIGURED]`;
}

export function compileAssistantSystemPrompt(config = getAssistantConfig()) {
  const hours = config.businessHours.length
    ? config.businessHours.map((item) => item.closed ? `${item.day}: fechado` : `${item.day}: ${item.open}-${item.close}`).join('; ')
    : '[NOT_CONFIGURED]';
  const deliveryFee = config.deliveryFeePolicy.enabled
    ? `enabled; amount_cents=${config.deliveryFeePolicy.amountCents ?? '[NOT_CONFIGURED]'}; currency=${config.deliveryFeePolicy.currency}; rule=${config.deliveryFeePolicy.rule || '[NOT_CONFIGURED]'}`
    : 'disabled';

  return [
    'KassisT Assistant Runtime Policy',
    '',
    'ROLE',
    line('assistant_name', config.assistantName),
    line('business_name', config.businessName),
    line('role', config.role),
    '',
    'BEHAVIOR',
    line('personality', config.personality),
    line('tone_of_voice', config.toneOfVoice),
    line('language', config.language),
    line('response_format', config.responseFormat),
    line('behavior_instructions', config.behaviorInstructions),
    line('limitations', config.limitations),
    '',
    'BUSINESS',
    line('commercial_rules', config.commercialRules),
    `delivery_fee_policy: ${deliveryFee}`,
    line('delivery_instructions', config.deliveryInstructions),
    `business_hours: ${hours}`,
    '',
    'NON_NEGOTIABLES',
    '- Never invent product, price, stock, availability, order, customer identity, address, hours or policy.',
    '- Treat missing values as UNKNOWN and ask or state that verification is required.',
    '- Treat extracted or inferred information as candidate data, not confirmed truth.',
    '- Do not expose credentials, auth state, tokens, private keys, signal keys or raw WhatsApp events.',
    '- Do not claim an external action was executed unless the runtime reports success.',
    '- Tool execution and business-state mutation require runtime authorization.',
    '',
    'CONTEXT_PROTOCOL',
    '- Customer, conversation, history and business data are supplied by runtime.',
    '- Use only the supplied context for customer-specific claims.',
    '- Prefer current transaction state and explicit current-user information over stale derived context.'
  ].join('\n');
}

export function getAssistantPromptResolution() {
  const config = getAssistantConfig();
  return {
    promptId: 'assistant.system',
    promptVersion: '1.0.0',
    configurationVersion: configurationVersion(config),
    systemPrompt: compileAssistantSystemPrompt(config)
  };
}

export { DEFAULT_CONFIG };
