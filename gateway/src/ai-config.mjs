import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'ai-config.json');
const LOCAL_OLLAMA_URLS = new Set(['http://127.0.0.1:11434', 'http://localhost:11434']);

/** @typedef {{ enabled: boolean, baseUrl: string, model: string, timeoutMs: number, contextMessages: number, cooldownMs: number, systemPrompt: string }} AiConfig */

/** @type {AiConfig} */
const DEFAULT_CONFIG = {
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
  return {
    enabled: String(process.env.KASSIST_AI_AUTOREPLY ?? '').toLowerCase() === 'true',
    baseUrl: String(process.env.KASSIST_LLM_URL ?? DEFAULT_CONFIG.baseUrl).replace(/\/$/, ''),
    model: String(process.env.KASSIST_LLM_MODEL ?? DEFAULT_CONFIG.model),
    timeoutMs: Math.max(1000, Number(process.env.KASSIST_LLM_TIMEOUT_MS ?? DEFAULT_CONFIG.timeoutMs)),
    contextMessages: Math.max(1, Number(process.env.KASSIST_AI_CONTEXT_MESSAGES ?? DEFAULT_CONFIG.contextMessages)),
    cooldownMs: Math.max(0, Number(process.env.KASSIST_AI_COOLDOWN_MS ?? DEFAULT_CONFIG.cooldownMs)),
    systemPrompt: String(process.env.KASSIST_LLM_SYSTEM_PROMPT ?? DEFAULT_CONFIG.systemPrompt),
  };
}

/** @param {Partial<AiConfig>} value @returns {AiConfig} */
function normalize(value = {}) {
  const baseUrl = String(value.baseUrl ?? DEFAULT_CONFIG.baseUrl).replace(/\/$/, '');
  if (!LOCAL_OLLAMA_URLS.has(baseUrl)) {
    throw new Error('Local LLM URL must point to localhost:11434');
  }

  const model = String(value.model ?? DEFAULT_CONFIG.model).trim();
  const systemPrompt = String(value.systemPrompt ?? DEFAULT_CONFIG.systemPrompt).trim();
  if (!model) throw new Error('LLM model is required');
  if (!systemPrompt) throw new Error('System prompt is required');
  if (systemPrompt.length > 12000) throw new Error('System prompt exceeds 12000 characters');

  return {
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
    persisted = normalize(/** @type {Partial<AiConfig>} */ (JSON.parse(raw)));
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

/** @param {Partial<AiConfig>} patch @returns {AiConfig} */
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

export { DEFAULT_CONFIG };
