import { getConversationContext } from './persistence-client.mjs';

const CANDIDATE_KEYS = new Set([
  'name', 'phone', 'address', 'neighborhood', 'city', 'preferences', 'mentioned_products',
  'interest', 'intent', 'order_information', 'observations'
]);

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function candidate(key, value, sourceMessageId, confidence = 0.95) {
  const observedAt = new Date().toISOString();
  return {
    key,
    value: normalizeText(value),
    confidence,
    resolution_status: 'CANDIDATE',
    source_message_id: sourceMessageId ?? null,
    source_event_reference: null,
    observed_at: observedAt,
    provenance: {
      source: 'conversation_message',
      source_message_id: sourceMessageId ?? null,
      source_event_reference: null,
      observed_at: observedAt
    }
  };
}

function extractFromMessage(message) {
  if (!message || message.direction !== 'INBOUND') return [];

  const text = normalizeText(message.text);
  if (!text) return [];

  const out = [];

  const phone = text.match(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-.\s]?\d{4}/);
  if (phone) out.push(candidate('phone', phone[0], message.id, 0.88));

  const explicitName = text.match(/(?:meu nome [ée]|sou o|sou a)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{1,80}?)(?=\s+(?:e|mas|porém|porque|que|,|\.|$))/i);
  if (explicitName) out.push(candidate('name', explicitName[1], message.id, 0.95));

  const address = text.match(/(?:meu endere[cç]o [ée]|entrega em|pode entregar em)\s+(.{5,180})$/i);
  if (address) out.push(candidate('address', address[1], message.id, 0.72));

  const neighborhood = text.match(/(?:bairro|no bairro)\s+([^,.;]{2,80})/i);
  if (neighborhood) out.push(candidate('neighborhood', neighborhood[1], message.id, 0.9));

  const city = text.match(/(?:cidade|moro em|resido em)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{2,80}?)(?=\s+(?:e|mas|porém|porque|que|,|\.|$))/i);
  if (city) out.push(candidate('city', city[1], message.id, 0.9));

  const preference = text.match(/(?:prefiro|gosto de|sempre peço)\s+(.{2,120})/i);
  if (preference) out.push(candidate('preferences', preference[1], message.id, 0.91));

  const mentionedProducts = text.match(/(?:produto|produtos)\s*(?:chamado[s]?|:)?\s+([^,.!?]{2,120})/i);
  if (mentionedProducts) out.push(candidate('mentioned_products', mentionedProducts[1], message.id, 0.72));

  const interest = text.match(/(?:quero|gostaria de|preciso de|estou procurando)\s+(.{2,160})/i);
  if (interest) out.push(candidate('interest', interest[1], message.id, 0.86));

  const intent = text.match(/(?:quero|gostaria de|preciso de|estou procurando)\s+(?:comprar|pedir|saber|consultar|conhecer|ver)\b/i);
  if (intent) out.push(candidate('intent', intent[0], message.id, 0.86));

  const order = text.match(/(?:pedido|pedir|quero pedir)\s*[:#-]?\s*(.{2,180})/i);
  if (order) out.push(candidate('order_information', order[1], message.id, 0.84));

  const observation = text.match(/(?:observa[cç][aã]o|obs\.?|nota(?:s)?)\s*[:=-]\s*(.{2,180})$/i);
  if (observation) out.push(candidate('observations', observation[1], message.id, 0.78));

  return out.filter((item) => CANDIDATE_KEYS.has(item.key) && item.value);
}

function dedupe(candidates) {
  const seen = new Set();
  return candidates.filter((item) => {
    const identity = `${item.key}|${item.value.toLowerCase()}|${item.source_message_id ?? ''}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function buildConflicts(candidates) {
  const byKey = new Map();
  for (const item of candidates) {
    const key = item.key;
    if (!byKey.has(key)) byKey.set(key, []);
    const values = byKey.get(key);
    if (!values.some((entry) => entry.value.toLowerCase() === item.value.toLowerCase())) {
      values.push(item);
    }
  }
  return [...byKey.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([key, values]) => ({
      key,
      values: values.map((item) => ({ value: item.value, confidence: item.confidence, source_message_id: item.source_message_id })),
      status: 'CONFLICTED'
    }));
}

export function analyzeConversationMessages(messages = []) {
  const candidates = dedupe(messages.filter((message) => message?.direction === 'INBOUND').flatMap(extractFromMessage));
  return { candidates, conflicts: buildConflicts(candidates) };
}

export async function analyzeConversation(jid, limit = 500) {
  const context = await getConversationContext(jid, limit);
  const result = analyzeConversationMessages(context.messages);
  return {
    conversation_id: context.conversation.id,
    customer_id: context.customer.id,
    candidate_count: result.candidates.length,
    candidates: result.candidates,
    conflicts: result.conflicts,
    identity_binding_status: context.identityBindingStatus
  };
}
