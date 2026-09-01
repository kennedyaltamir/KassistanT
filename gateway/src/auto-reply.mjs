import { getMessages, sendImage, sendText, subscribe } from './whatsapp.mjs';
import { generateReply, getLlmProviderStatus, getLlmStatus } from './llm.mjs';
import { getAiConfig } from './ai-config.mjs';
import { buildBusinessContext, createOrder } from './commerce.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const POLICY_PATH = path.join(process.cwd(), 'gateway', 'data', 'ai-conversations.json');
const inFlight = new Set();
const lastReplyAt = new Map();
let started = false;
let conversationPolicies = {};

async function readPolicies() {
  if (Object.keys(conversationPolicies).length > 0) return conversationPolicies;
  try { conversationPolicies = JSON.parse(await fs.readFile(POLICY_PATH, 'utf8')); } catch { conversationPolicies = {}; }
  return conversationPolicies;
}
async function savePolicies() { await fs.mkdir(path.dirname(POLICY_PATH), { recursive: true }); await fs.writeFile(POLICY_PATH, `${JSON.stringify(conversationPolicies, null, 2)}\n`, 'utf8'); }
async function getConversationPolicy(jid) { const value = (await readPolicies())[jid]; return value && typeof value === 'object' ? value : {}; }

export async function setConversationPolicy(jid, patch = {}) {
  if (!jid || !['@lid','@s.whatsapp.net','@g.us'].some((suffix) => jid.endsWith(suffix))) throw new Error('Unsupported WhatsApp JID');
  const current = await getConversationPolicy(jid); const next = { ...current };
  if (typeof patch.enabled === 'boolean') next.enabled = patch.enabled;
  if (patch.enabled === null) delete next.enabled;
  if (typeof patch.prompt === 'string') { if (patch.prompt.trim()) next.prompt = patch.prompt.trim(); else delete next.prompt; }
  if (Object.keys(next).length) (await readPolicies())[jid] = next; else delete (await readPolicies())[jid];
  await savePolicies(); return { jid, ...next };
}
export async function clearConversationPolicy(jid) { return setConversationPolicy(jid, { enabled: null, prompt: '' }); }
export async function getConversationPolicyStatus(jid) { return { jid, ...(await getConversationPolicy(jid)) }; }
export async function listConversationPolicies() { return Object.entries(await readPolicies()).map(([jid, value]) => ({ jid, ...value })); }

function conversationContext(jid) {
  const max = getAiConfig().contextMessages;
  return getMessages(500).filter((message) => message.jid === jid && typeof message.text === 'string').slice(-max).map((message) => ({ role: message.direction === 'OUTBOUND' ? 'assistant' : 'user', content: message.text.trim() })).filter((message) => message.content);
}
function isSupportedRecipient(jid) { return typeof jid === 'string' && ['@lid','@s.whatsapp.net','@g.us'].some((suffix) => jid.endsWith(suffix)); }
function imageRequest(text) { return /\b(foto|fotos|imagem|imagens|cardápio|cardapio)\b/i.test(text); }
function findProduct(products, text) { const lower = text.toLowerCase(); return products.find((product) => product.image_path && lower.includes(String(product.name).toLowerCase())); }
function parseAction(reply) {
  const match = reply.match(/\[\[KASSIST_ACTION:(\{[\s\S]*?\})\]\]/);
  if (!match) return { reply: reply.trim(), action: null };
  try { return { reply: reply.replace(match[0], '').replace(/\n{3,}/g, '\n\n').trim(), action: JSON.parse(match[1]) }; }
  catch { return { reply: reply.replace(match[0], '').trim(), action: null }; }
}
async function imageDataUrl(mediaPath) {
  if (!mediaPath) return null;
  try { const data = await fs.readFile(mediaPath); const ext = path.extname(mediaPath).toLowerCase(); const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'; return `data:${mime};base64,${data.toString('base64')}`; } catch { return null; }
}

async function handleMessage(message) {
  const status = getLlmStatus();
  if (!status.enabled || !message || message.direction !== 'INBOUND' || !isSupportedRecipient(message.jid)) return;
  const text = message.text?.trim() ?? '';
  if (!text && !message.media_path) return;
  const jid = message.jid;
  const policy = await getConversationPolicy(jid); if (policy.enabled === false || inFlight.has(jid)) return;
  const config = getAiConfig(); const previous = lastReplyAt.get(jid) ?? 0; if (Date.now() - previous < config.cooldownMs) return;
  const provider = await getLlmProviderStatus(); if (!provider.reachable) { console.warn(`[KassisT AI] no LLM provider available; selected=${provider.selectedProvider}`); return; }

  inFlight.add(jid); lastReplyAt.set(jid, Date.now());
  try {
    const businessContext = await buildBusinessContext();
    const systemPrompt = `${policy.prompt?.trim() || config.systemPrompt}\n\nDADOS OPERACIONAIS DO NEGÓCIO (somente leitura):\n${JSON.stringify(businessContext)}\n\nRegras adicionais: use o catálogo e as taxas fornecidas. Não invente produtos. Para uma venda, só use [[KASSIST_ACTION:{"type":"CREATE_ORDER","items":[{"product_id":"...","quantity":1}],"delivery_type":"PICKUP|DELIVERY","address":{},"payment_method":"...","email":"...","customer_name":"..."}]] quando todos os dados necessários estiverem presentes. O sistema validará preços, disponibilidade, taxa e endereço antes de confirmar. Se faltar dado, peça-o. Nunca afirme que um PIX foi pago apenas por existir um comprovante em imagem.\n\nSe o cliente pedir foto/imagem de um produto disponível, responda normalmente e o sistema poderá enviar a foto cadastrada.`;
    const context = conversationContext(jid);
    const dataUrl = message.message_type === 'IMAGE' ? await imageDataUrl(message.media_path) : null;
    const replyWithMarker = await generateReply(context.length ? context : [{ role: 'user', content: text || 'O cliente enviou uma imagem.' }], { systemPrompt, imageDataUrl: dataUrl });
    const parsed = parseAction(replyWithMarker);

    if (parsed.action?.type === 'CREATE_ORDER') {
      try {
        const result = await createOrder({ jid, phone: jid, customer_name: parsed.action.customer_name, email: parsed.action.email, items: parsed.action.items, delivery_type: parsed.action.delivery_type, address: parsed.action.address, payment_method: parsed.action.payment_method, notes: parsed.action.notes });
        const confirmation = parsed.reply || `Pedido #${result.display_number} confirmado. Total: R$ ${(result.total_cents / 100).toFixed(2).replace('.', ',')}.`;
        await sendText(jid, confirmation);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        console.error(`[KassisT AI] order action rejected: ${reason}`);
        await sendText(jid, 'Ainda não consegui confirmar o pedido porque falta validar um dado. Vou precisar que você confira as informações solicitadas antes de finalizar.');
      }
    } else if (parsed.reply) {
      await sendText(jid, parsed.reply);
    }

    const product = imageRequest(text) ? findProduct(businessContext.products ?? [], text) : null;
    if (product?.image_path) {
      try { await sendImage(jid, product.image_path, `Foto: ${product.name}`); }
      catch (error) { console.error(`[KassisT AI] product image send failed: ${error instanceof Error ? error.message : error}`); }
    }
  } catch (error) {
    console.error('[KassisT AI] auto-reply failed:', error instanceof Error ? error.message : error);
  } finally { inFlight.delete(jid); }
}

export function startAutoReply() {
  if (started) return; started = true;
  subscribe((event) => { if (event.type === 'message') void handleMessage(event.message); });
  const status = getLlmStatus(); console.log(`[KassisT AI] auto-reply ${status.enabled ? 'ENABLED' : 'DISABLED'} provider=${status.provider}`);
}
export async function getAutoReplyStatus() { const config = getAiConfig(); return { ...getLlmStatus(), contextMessages: config.contextMessages, cooldownMs: config.cooldownMs, inflightConversations: inFlight.size, configuredConversations: (await listConversationPolicies()).length }; }
