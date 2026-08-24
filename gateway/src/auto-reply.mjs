import { getMessages, sendText, subscribe } from './whatsapp.mjs';
import { generateReply, getLlmStatus } from './llm.mjs';
import { getAiConfig } from './ai-config.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @typedef {{ id: string, jid: string | null, direction: 'INBOUND' | 'OUTBOUND', fromMe: boolean, text: string | null, timestamp: number, status: string }} MessageSnapshot */
/** @typedef {{ role: 'user' | 'assistant', content: string }} ContextMessage */
/** @typedef {{ enabled?: boolean, prompt?: string }} ConversationPolicy */
/** @typedef {Record<string, ConversationPolicy>} ConversationPolicyMap */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POLICY_PATH = path.join(__dirname, '..', 'data', 'ai-conversations.json');
const inFlight = new Set();
const lastReplyAt = new Map();
let started = false;
/** @type {ConversationPolicyMap | null} */
let conversationPolicies = null;

/** @returns {ConversationPolicyMap} */
function loadPolicies() {
  if (conversationPolicies) return conversationPolicies;
  try {
    const raw = fs.readFileSync(POLICY_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    conversationPolicies = parsed && typeof parsed === 'object' ? /** @type {ConversationPolicyMap} */ (parsed) : {};
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

/** @param {string} jid @returns {ConversationPolicy} */
function getConversationPolicy(jid) {
  const value = loadPolicies()[jid];
  return value && typeof value === 'object' ? value : {};
}

/** @param {string} jid @param {Partial<ConversationPolicy> & { enabled?: boolean | null }} patch */
export function setConversationPolicy(jid, patch = {}) {
  if (typeof jid !== 'string' || !jid.trim()) throw new Error('Conversation JID is required');
  if (!jid.endsWith('@lid') && !jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@g.us')) {
    throw new Error('Unsupported WhatsApp JID');
  }
  const current = getConversationPolicy(jid);
  const next = { ...current };
  if (typeof patch.enabled === 'boolean') next.enabled = patch.enabled;
  if (patch.enabled === null) delete next.enabled;
  if (typeof patch.prompt === 'string') {
    const prompt = patch.prompt.trim();
    if (prompt) next.prompt = prompt;
    else delete next.prompt;
  }
  if (Object.keys(next).length === 0) {
    delete loadPolicies()[jid];
  } else {
    loadPolicies()[jid] = next;
  }
  savePolicies();
  return { jid, ...next };
}

export function clearConversationPolicy(jid) {
  return setConversationPolicy(jid, { enabled: null, prompt: '' });
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
      if (message.fromMe || message.direction === 'OUTBOUND') {
        return { role: 'assistant', content: message.text };
      }
      return { role: 'user', content: message.text };
    });
  return context.filter((message) => message !== null);
}

export function getAutoReplyStatus() {
  return {
    ...getLlmStatus(),
    inflightConversations: inFlight.size,
    configuredConversations: listConversationPolicies().length,
  };
}

export function startAutoReply() {
  if (started) return;
  started = true;
  subscribe((message) => {
    if (!message || message.direction !== 'INBOUND' || message.fromMe || !message.jid || typeof message.text !== 'string' || !message.text.trim()) {
      return;
    }
    void handleInbound(message);
  });
}

/** @param {MessageSnapshot} message */
async function handleInbound(message) {
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
    const reply = promptOverride
      ? await generateReply(context, { systemPrompt: promptOverride })
      : await generateReply(context);
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
