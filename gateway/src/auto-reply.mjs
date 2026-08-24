import { getMessages, sendText, subscribe } from './whatsapp.mjs';
import { generateReply, getLlmStatus } from './llm.mjs';
import { getAiConfig } from './ai-config.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @typedef {{ id: string, jid: string | null, direction: 'INBOUND' | 'OUTBOUND', fromMe: boolean, text: string | null, timestamp: number, status: string }} MessageSnapshot */
/** @typedef {{ role: 'user' | 'assistant', content: string }} ContextMessage */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POLICY_PATH = path.join(__dirname, '..', 'data', 'ai-conversations.json');
const inFlight = new Set();
const lastReplyAt = new Map();
let started = false;
let conversationPolicies = null;

function loadPolicies() {
  if (conversationPolicies) return conversationPolicies;
  try {
    const raw = fs.readFileSync(POLICY_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    conversationPolicies = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    conversationPolicies = {};
  }
  return conversationPolicies;
}

function savePolicies() {
  fs.mkdirSync(path.dirname(POLICY_PATH), { recursive: true });
  const tempPath = `${POLICY_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(loadPolicies(), null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, POLICY_PATH);
}

/** @param {string} jid @returns {{ enabled?: boolean, prompt?: string }} */
function getConversationPolicy(jid) {
  const value = loadPolicies()[jid];
  return value && typeof value === 'object' ? value : {};
}

export function setConversationPolicy(jid, patch = {}) {
  if (typeof jid !== 'string' || !jid.trim()) throw new Error('Conversation JID is required');
  if (!jid.endsWith('@lid') && !jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@g.us')) {
    throw new Error('Unsupported WhatsApp JID');
  }
  const current = getConversationPolicy(jid);
  const next = {
    ...current,
    ...(typeof patch.enabled === 'boolean' ? { enabled: patch.enabled } : {}),
    ...(typeof patch.prompt === 'string' ? { prompt: patch.prompt.trim() } : {}),
  };
  if (!next.prompt) delete next.prompt;
  loadPolicies()[jid] = next;
  savePolicies();
  return { jid, ...next };
}

export function getConversationPolicyStatus(jid) {
  return { jid, ...getConversationPolicy(jid) };
}

export function listConversationPolicies() {
  return Object.entries(loadPolicies()).map(([jid, value]) => ({ jid, ...(value || {}) }));
}

/** @param {string} jid @returns {ContextMessage[]} */
function conversationContext(jid) {
  const maxContextMessages = getAiConfig().contextMessages;
  /** @type {(ContextMessage | null)[]} */
  const context = getMessages(500)
    .filter(message => message.jid === jid && typeof message.text === 'string')
    .slice(-maxContextMessages)
    .map(message => {
      const text = message.text?.trim();
      if (!text) return null;
      return {
        role: message.direction === 'OUTBOUND' ? 'assistant' : 'user',
        content: text,
      };
    });

  return context.filter(message => message !== null);
}

/** @param {string | null} jid */
function isSupportedRecipient(jid) {
  return typeof jid === 'string' && (
    jid.endsWith('@lid') ||
    jid.endsWith('@s.whatsapp.net') ||
    jid.endsWith('@g.us')
  );
}

/** @param {MessageSnapshot | null | undefined} message */
async function handleMessage(message) {
  const status = getLlmStatus();
  if (!status.enabled) return;
  if (!message || message.direction !== 'INBOUND') return;
  if (!isSupportedRecipient(message.jid)) return;
  const text = message.text?.trim();
  if (!text) return;

  const jid = message.jid;
  if (!jid) return;
  const policy = getConversationPolicy(jid);
  if (policy.enabled === false) return;
  if (inFlight.has(jid)) return;

  const config = getAiConfig();
  const now = Date.now();
  const previous = lastReplyAt.get(jid) ?? 0;
  if (now - previous < config.cooldownMs) return;

  const context = conversationContext(jid);
  if (!context.length) return;

  const promptOverride = typeof policy.prompt === 'string' && policy.prompt.trim() ? policy.prompt.trim() : undefined;

  inFlight.add(jid);
  lastReplyAt.set(jid, now);

  try {
    const reply = await generateReply(context, { systemPrompt: promptOverride });
    await sendText(jid, reply);
    console.log(`[KassisT AI] auto-reply sent to ${jid}`);
  } catch (error) {
    console.error(
      '[KassisT AI] auto-reply failed:',
      error instanceof Error ? error.message : error
    );
  } finally {
    inFlight.delete(jid);
  }
}

export function startAutoReply() {
  if (started) return;
  started = true;
  subscribe(event => {
    if (event.type === 'message') {
      void handleMessage(event.message);
    }
  });

  const status = getLlmStatus();
  console.log(
    `[KassisT AI] local auto-reply ${status.enabled ? 'ENABLED' : 'DISABLED'}; model=${status.model}; url=${status.baseUrl}`
  );
}

export function getAutoReplyStatus() {
  const config = getAiConfig();
  return {
    ...getLlmStatus(),
    contextMessages: config.contextMessages,
    cooldownMs: config.cooldownMs,
    inflightConversations: inFlight.size,
    configuredConversations: listConversationPolicies().length,
  };
}
