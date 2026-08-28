import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', 'data', 'assistant-config.json');
const PROMPT_VERSION = '1.2.0';

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

const RESPONSE_FORMAT_ALIASES = new Map([
  ['concise_text', 'concise_text'],
  ['natural_text', 'natural_text'],
  ['bullet_points', 'bullet_points'],
  ['markdown', 'markdown'],
  ['concise', 'concise_text'],
  ['natural', 'natural_text'],
  ['structured', 'bullet_points']
]);
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
    const day = String(entry.day ?? '').trim().toUpperCase();
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

function normalizeResponseFormat(value) {
  const raw = nonEmptyString(value, DEFAULT_CONFIG.responseFormat).toLowerCase();
  const normalized = RESPONSE_FORMAT_ALIASES.get(raw);
  if (!normalized) throw new Error('Unsupported response format');
  return normalized;
}

function normalizeDeliveryPolicy(input) {
  if (typeof input === 'string') {
    const value = input.trim().toUpperCase();
    if (value === 'UNKNOWN') return { ...DEFAULT_CONFIG.deliveryFeePolicy };
    if (value === 'FREE') return { enabled: true, amountCents: 0, currency: 'BRL', rule: 'Frete grátis.' };
    if (value === 'FIXED' || value === 'CALCULATED') {
      return { enabled: true, amountCents: null, currency: 'BRL', rule: value === 'FIXED' ? 'Taxa fixa configurada pelo negócio.' : 'Taxa calculada conforme regra configurada.' };
    }
    throw new Error('Unsupported delivery fee policy');
  }
  const value = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const amountValue = value.amountCents;
  let amountCents = null;
  if (amountValue !== null && amountValue !== undefined && amountValue !== '') {
    amountCents = Number(amountValue);
    if (!Number.isInteger(amountCents) || amountCents < 0) throw new Error('Delivery fee amount must be a non-negative integer in cents');
  }
  return {
    enabled: Boolean(value.enabled),
    amountCents,
    currency: nonEmptyString(value.currency, 'BRL'),
    rule: nonEmptyString(value.rule)
  };
}

function normalize(input = {}) {
  const llm = input.llm && typeof input.llm === 'object' ? input.llm : {};
  const baseUrl = nonEmptyString(llm.baseUrl, DEFAULT_CONFIG.llm.baseUrl).replace(/\/$/, '');
  if (!LOCAL_OLLAMA_URLS.has(baseUrl)) throw new Error('Assistant LLM baseUrl must point to local Ollama');

  return {
    assistantName: nonEmptyString(input.assistantName),
    businessName: nonEmptyString(input.businessName),
    role: nonEmptyString(input.role),
    personality: nonEmptyString(input.personality),
    toneOfVoice: nonEmptyString(input.toneOfVoice),
    language: nonEmptyString(input.language, DEFAULT_CONFIG.language),
    responseFormat: normalizeResponseFormat(input.responseFormat),
    commercialRules: nonEmptyString(input.commercialRules),
    deliveryFeePolicy: normalizeDeliveryPolicy(input.deliveryFeePolicy),
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
  const current = getAssistantConfig();
  const next = normalize({ ...current, ...patch, llm: { ...current.llm, ...(patch.llm || {}) } });
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
    'ASSISTANT_IDENTITY',
    line('assistant_name', config.assistantName),
    line('language', config.language),
    '',
    'BUSINESS_IDENTITY',
    line('business_name', config.businessName),
    '',
    'ROLE',
    line('role', config.role),
    '',
    'PERSONALITY',
    line('personality', config.personality),
    '',
    'TONE',
    line('tone_of_voice', config.toneOfVoice),
    '',
    'COMMERCIAL_POLICIES',
    line('commercial_rules', config.commercialRules),
    '',
    'DELIVERY_POLICIES',
    `delivery_fee_policy: ${deliveryFee}`,
    line('delivery_instructions', config.deliveryInstructions),
    '',
    'BUSINESS_HOURS',
    `business_hours: ${hours}`,
    '',
    'PRODUCT_CATALOG',
    'available_products: [SUPPLIED_AT_RUNTIME]',
    'Product, price, stock and availability claims require runtime-supplied catalog data.',
    '',
    'CUSTOMER_CONTEXT',
    'customer: [SUPPLIED_AT_RUNTIME]',
    'Customer identity fields are trusted only when the runtime reports a confirmed identity binding.',
    '',
    'CONVERSATION_CONTEXT',
    'conversation: [SUPPLIED_AT_RUNTIME]',
    'recent_messages and user_message: [SUPPLIED_AT_RUNTIME]',
    '',
    'AUTHORIZED_MEMORY',
    'relevant_memories: [SUPPLIED_AT_RUNTIME; empty means no authorized memory]',
    '',
    'CURRENT_STATE',
    'current_state: [SUPPLIED_AT_RUNTIME]',
    '',
    'RESPONSE_POLICY',
    line('response_format', config.responseFormat),
    line('behavior_instructions', config.behaviorInstructions),
    'Respond only from supplied runtime context and configured business policy when making customer-specific claims.',
    '',
    'LIMITATIONS',
    line('limitations', config.limitations),
    '',
    'TOOL_POLICY',
    'Runtime is the authority for tool execution, persistence and external effects.',
    'Never claim an external action succeeded without a successful runtime result.',
    '',
    'IDENTITY_SAFETY_POLICY',
    'Unverified names, push names, message text and derived values are not confirmed Customer identity.',
    'Do not complete or promote identity by plausibility, historical repetition or inference.',
    '',
    'NON_NEGOTIABLES',
    '- Never invent product, price, stock, availability, order, customer identity, address, hours or policy.',
    '- Treat missing values as UNKNOWN and ask or state that verification is required.',
    '- Treat extracted or inferred information as candidate data, not confirmed truth.',
    '- Do not expose credentials, auth state, tokens, private keys, signal keys or raw WhatsApp events.',
    '- Tool execution and business-state mutation require runtime authorization.',
    '',
    'CONTEXT_PROTOCOL',
    '- Customer, conversation, history, memory and business data are supplied by runtime.',
    '- Use only the supplied context for customer-specific claims.',
    '- The current user message is a distinct runtime input and must not be confused with persistent Customer identity.',
    '- Prefer current transaction state and explicit current-user information over stale derived context.'
  ].join('\n');
}

export function getAssistantPromptResolution() {
  const config = getAssistantConfig();
  return {
    promptId: 'assistant.system',
    promptVersion: PROMPT_VERSION,
    configurationVersion: configurationVersion(config),
    systemPrompt: compileAssistantSystemPrompt(config)
  };
}

export { DEFAULT_CONFIG, PROMPT_VERSION };