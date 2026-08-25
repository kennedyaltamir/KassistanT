import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'ai-config.json');
const PROVIDERS = new Set(['ollama_local', 'groq']);
const LOCAL_OLLAMA_URLS = new Set(['http://127.0.0.1:11434', 'http://localhost:11434']);
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

/** @typedef {{ provider: 'ollama_local' | 'groq', enabled: boolean, baseUrl: string, model: string, timeoutMs: number, contextMessages: number, cooldownMs: number, systemPrompt: string }} AiConfig */
/** @typedef {Partial<AiConfig>} AiConfigPatch */

/** @type {AiConfig} */
const DEFAULT_CONFIG = {
  provider: 'ollama_local',
  enabled: false,
  baseUrl: 'http://127.0.0.1:11434',
  model: 'qwen3:14b',
  timeoutMs: 60000,
  contextMessages: 12,
  cooldownMs: 1500,
  systemPrompt:
    'Você é o assistente de atendimento do KassisT. Responda em português do Brasil, de forma curta, clara e educada. Não invente preços, disponibilidade, horários, pedidos ou políticas. Se a informação não estiver disponível no contexto, peça os dados necessários ou diga que precisa verificar. Não confirme ações que o sistema não executou.',
};

/** @type {AiConfig | null} */
let persisted = null;

/** @returns {AiConfig} */
function envConfig() {
  const provider = String(
    process.env.KASSIST_LLM_PROVIDER ?? DEFAULT_CONFIG.provider
  ).trim();

  return {
    provider: /** @type {'ollama_local' | 'groq'} */ (provider),
    enabled: String(process.env.KASSIST_AI_AUTOREPLY ?? '').toLowerCase() === 'true',
    baseUrl: String(process.env.KASSIST_LLM_URL ?? DEFAULT_CONFIG.baseUrl).replace(/\/$/, ''),
    model: String(process.env.KASSIST_LLM_MODEL ?? DEFAULT_CONFIG.model),
    timeoutMs: Math.max(1000, Number(process.env.KASSIST_LLM_TIMEOUT_MS ?? DEFAULT_CONFIG.timeoutMs)),
    contextMessages: Math.max(1, Number(process.env.KASSIST_AI_CONTEXT_MESSAGES ?? DEFAULT_CONFIG.contextMessages)),
    cooldownMs: Math.max(0, Number(process.env.KASSIST_AI_COOLDOWN_MS ?? DEFAULT_CONFIG.cooldownMs)),
    systemPrompt: String(process.env.KASSIST_LLM_SYSTEM_PROMPT ?? DEFAULT_CONFIG.systemPrompt),
  };
}

/** @param {AiConfigPatch} value @returns {AiConfig} */
function normalize(value = {}) {
  const provider = String(value.provider ?? DEFAULT_CONFIG.provider).trim();
  if (!PROVIDERS.has(provider)) throw new Error(`Unsupported LLM provider: ${provider}`);

  const requestedBaseUrl = String(value.baseUrl ?? DEFAULT_CONFIG.baseUrl).replace(/\/$/, '');
  const baseUrl = provider === 'groq'
    ? GROQ_BASE_URL
    : requestedBaseUrl;

  if (provider === 'ollama_local' && !LOCAL_OLLAMA_URLS.has(baseUrl)) {
    throw new Error('Local LLM URL must point to localhost:11434');
  }

  const model = String(value.model ?? DEFAULT_CONFIG.model).trim();
  const systemPrompt = String(value.systemPrompt ?? DEFAULT_CONFIG.systemPrompt).trim();
  if (!model) throw new Error('LLM model is required');
  if (!systemPrompt) throw new Error('System prompt is required');
  if (systemPrompt.length > 12000) throw new Error('System prompt exceeds 12000 characters');

  return {
    provider: /** @type {'ollama_local' | 'groq'} */ (provider),
    enabled: Boolean(value.enabled),
    baseUrl,
    model,
    timeoutMs: Math.min(300000, Math.max(1000, Number(value.timeoutMs ?? DEFAULT_CONFIG.timeoutMs))),
    contextMessages: Math.min(50, Math.max(1, Number(value.contextMessages ?? DEFAULT_CONFIG.contextMessages))),
    cooldownMs: Math.min(60000, Math.max(0, Number(value.cooldownMs ?? DEFAULT_CONFIG.cooldownMs))),
    systemPrompt,
  };
}

/** @returns {AiConfig | null} */
function loadPersisted() {
  if (persisted) return persisted;
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    persisted = normalize(JSON.parse(raw));
  } catch {
    persisted = null;
  }
  return persisted;
}

function shouldUsePersistence() {
  return String(process.env.KASSIST_AI_PERSIST_CONFIG ?? 'true').toLowerCase() !== 'false';
}

export function getAiConfig() {
  const fromFile = shouldUsePersistence() ? loadPersisted() : null;
  const fromEnv = envConfig();
  return normalize(fromFile ? { ...fromEnv, ...fromFile } : fromEnv);
}

/** @param {AiConfigPatch} patch @returns {AiConfig} */
export function updateAiConfig(patch = {}) {
  const next = normalize({ ...getAiConfig(), ...patch });
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  const tempPath = `${CONFIG_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, CONFIG_PATH);
  persisted = next;
  return next;
}

export function getAiConfigPath() {
  return CONFIG_PATH;
}

export { DEFAULT_CONFIG, GROQ_BASE_URL };
