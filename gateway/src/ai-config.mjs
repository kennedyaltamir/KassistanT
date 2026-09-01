import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'ai-config.json');
const LOCAL_OLLAMA_URLS = new Set(['http://127.0.0.1:11434', 'http://localhost:11434']);
const PROVIDERS = new Set(['ollama', 'groq', 'gemini', 'mistral']);

/** @typedef {{ enabled:boolean, provider:'ollama'|'groq'|'gemini'|'mistral', fallbackProviders:string[], baseUrl:string, model:string, timeoutMs:number, contextMessages:number, cooldownMs:number, systemPrompt:string }} AiConfig */
/** @typedef {Partial<AiConfig>} AiConfigPatch */

const DEFAULT_CONFIG = {
  enabled: false,
  provider: 'ollama',
  fallbackProviders: ['groq', 'gemini'],
  baseUrl: 'http://127.0.0.1:11434',
  model: 'qwen3:14b',
  timeoutMs: 60000,
  contextMessages: 12,
  cooldownMs: 1500,
  systemPrompt: 'Você é o assistente de atendimento do KassisT. Responda em português do Brasil, de forma profissional, clara, objetiva e educada. Use somente informações do contexto e do catálogo fornecidos. Nunca invente preços, disponibilidade, horários, taxas, pagamentos ou pedidos. A IA interpreta; o sistema decide. Não confirme uma venda, pagamento ou alteração de cadastro que o sistema não registrou.',
};

let persisted = null;

function envOverrides() {
  const overrides = {};
  if (process.env.KASSIST_AI_AUTOREPLY !== undefined) overrides.enabled = String(process.env.KASSIST_AI_AUTOREPLY).toLowerCase() === 'true';
  if (process.env.KASSIST_LLM_PROVIDER !== undefined) overrides.provider = String(process.env.KASSIST_LLM_PROVIDER).toLowerCase();
  if (process.env.KASSIST_LLM_FALLBACKS !== undefined) overrides.fallbackProviders = String(process.env.KASSIST_LLM_FALLBACKS).split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (process.env.KASSIST_LLM_URL !== undefined) overrides.baseUrl = String(process.env.KASSIST_LLM_URL);
  if (process.env.KASSIST_LLM_MODEL !== undefined) overrides.model = String(process.env.KASSIST_LLM_MODEL);
  if (process.env.KASSIST_LLM_TIMEOUT_MS !== undefined) overrides.timeoutMs = Number(process.env.KASSIST_LLM_TIMEOUT_MS);
  if (process.env.KASSIST_AI_CONTEXT_MESSAGES !== undefined) overrides.contextMessages = Number(process.env.KASSIST_AI_CONTEXT_MESSAGES);
  if (process.env.KASSIST_AI_COOLDOWN_MS !== undefined) overrides.cooldownMs = Number(process.env.KASSIST_AI_COOLDOWN_MS);
  if (process.env.KASSIST_LLM_SYSTEM_PROMPT !== undefined) overrides.systemPrompt = String(process.env.KASSIST_LLM_SYSTEM_PROMPT);
  return overrides;
}

function normalize(value = {}) {
  const provider = String(value.provider ?? DEFAULT_CONFIG.provider).toLowerCase();
  if (!PROVIDERS.has(provider)) throw new Error(`Unsupported LLM provider: ${provider}`);
  const baseUrl = String(value.baseUrl ?? DEFAULT_CONFIG.baseUrl).replace(/\/$/, '');
  if (provider === 'ollama' && !LOCAL_OLLAMA_URLS.has(baseUrl)) throw new Error('Local Ollama URL must point to localhost:11434');
  const fallbackProviders = [...new Set((Array.isArray(value.fallbackProviders) ? value.fallbackProviders : DEFAULT_CONFIG.fallbackProviders)
    .map((item) => String(item).toLowerCase().trim())
    .filter((item) => PROVIDERS.has(item) && item !== provider))];
  const model = String(value.model ?? DEFAULT_CONFIG.model).trim();
  const systemPrompt = String(value.systemPrompt ?? DEFAULT_CONFIG.systemPrompt).trim();
  if (!model) throw new Error('LLM model is required');
  if (!systemPrompt || systemPrompt.length > 12000) throw new Error('System prompt is invalid');
  const timeoutMs = Number(value.timeoutMs ?? DEFAULT_CONFIG.timeoutMs);
  const contextMessages = Number(value.contextMessages ?? DEFAULT_CONFIG.contextMessages);
  const cooldownMs = Number(value.cooldownMs ?? DEFAULT_CONFIG.cooldownMs);
  if (![timeoutMs, contextMessages, cooldownMs].every(Number.isFinite)) throw new Error('LLM numeric configuration is invalid');
  return {
    enabled: Boolean(value.enabled ?? DEFAULT_CONFIG.enabled),
    provider,
    fallbackProviders,
    baseUrl,
    model,
    timeoutMs: Math.min(300000, Math.max(1000, Math.round(timeoutMs))),
    contextMessages: Math.min(50, Math.max(1, Math.round(contextMessages))),
    cooldownMs: Math.min(60000, Math.max(0, Math.round(cooldownMs))),
    systemPrompt,
  };
}

function loadPersisted() {
  if (persisted) return persisted;
  try { persisted = normalize(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))); } catch { persisted = null; }
  return persisted;
}

function shouldUsePersistence() { return String(process.env.KASSIST_AI_PERSIST_CONFIG ?? 'true').toLowerCase() !== 'false'; }

export function getAiConfig() {
  const fromFile = shouldUsePersistence() ? loadPersisted() : null;
  return normalize({ ...DEFAULT_CONFIG, ...(fromFile ?? {}), ...envOverrides() });
}

export function updateAiConfig(patch = {}) {
  const next = normalize({ ...getAiConfig(), ...patch });
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  const tempPath = `${CONFIG_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, CONFIG_PATH);
  persisted = next;
  return next;
}

export function getAiConfigPath() { return CONFIG_PATH; }
export { DEFAULT_CONFIG };
