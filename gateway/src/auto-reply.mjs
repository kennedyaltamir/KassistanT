import { getMessages, sendText, subscribe } from './whatsapp.mjs';
import { generateReply, getLlmStatus } from './llm.mjs';

const maxContextMessages = Math.max(1, Number(process.env.KASSIST_AI_CONTEXT_MESSAGES ?? 12));
const cooldownMs = Math.max(0, Number(process.env.KASSIST_AI_COOLDOWN_MS ?? 1500));
const inFlight = new Set();
const lastReplyAt = new Map();
let started = false;

function conversationContext(jid) {
  return getMessages(500)
    .filter(message => message.jid === jid && typeof message.text === 'string' && message.text.trim())
    .slice(-maxContextMessages)
    .map(message => ({
      role: message.direction === 'OUTBOUND' ? 'assistant' : 'user',
      content: message.text.trim(),
    }));
}

function isSupportedRecipient(jid) {
  return typeof jid === 'string' && (
    jid.endsWith('@lid') ||
    jid.endsWith('@s.whatsapp.net') ||
    jid.endsWith('@g.us')
  );
}

async function handleMessage(message) {
  const status = getLlmStatus();
  if (!status.enabled) return;
  if (!message || message.direction !== 'INBOUND') return;
  if (!isSupportedRecipient(message.jid)) return;
  if (typeof message.text !== 'string' || !message.text.trim()) return;

  const jid = message.jid;
  if (inFlight.has(jid)) return;

  const now = Date.now();
  const previous = lastReplyAt.get(jid) ?? 0;
  if (now - previous < cooldownMs) return;

  const context = conversationContext(jid);
  if (!context.length) return;

  inFlight.add(jid);
  lastReplyAt.set(jid, now);

  try {
    const reply = await generateReply(context);
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
  return {
    ...getLlmStatus(),
    contextMessages: maxContextMessages,
    cooldownMs,
    inflightConversations: inFlight.size,
  };
}
