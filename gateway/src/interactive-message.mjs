// TRANSPORT_STRATEGY: official @whiskeysockets/baileys 7.0.0-rc14 raw-protocol path, isolated inside Gateway.
// VERSION: 7.0.0-rc14. API_USED: generateWAMessageFromContent + relayMessage + official WAProto types.
// COMPATIBILITY_EVIDENCE: rc14 exposes InteractiveMessage/NativeFlowMessage protobufs and relayMessage; sendMessage/AnyMessageContent does not expose outbound buttons.
// SECURITY_IMPACT: no Renderer access, no auth-state exposure, button ids are validated and treated as untrusted input.
// REGRESSION_IMPACT: TEXT/IMAGE continue through existing sendText/sendImage; interactive is a distinct Campaign effect.
// ROLLBACK_STRATEGY: remove the interactive effect/helper and revert Campaign UI fields; existing TEXT/IMAGE contracts remain unchanged.

import { proto } from '@whiskeysockets/baileys';

export const INTERACTIVE_MAX_BUTTONS = 3;
export const INTERACTIVE_BUTTON_TYPE = 'quick_reply';

function requiredText(value, field) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${field} is required`);
  return text;
}
function validateButtonId(value, index) {
  const id = requiredText(value, `button ${index + 1} id`);
  if (id.length > 128) throw new Error(`button ${index + 1} id is too long`);
  if (!/^[A-Za-z0-9._:-]+$/.test(id)) throw new Error(`button ${index + 1} id contains unsupported characters`);
  return id;
}
function validateButtonText(value, index) {
  const text = requiredText(value, `button ${index + 1} text`);
  if (text.length > 200) throw new Error(`button ${index + 1} text is too long`);
  return text;
}
export function canonicalInteractiveButtons(values) {
  if (!Array.isArray(values) || values.length === 0) throw new Error('At least one interactive button is required');
  if (values.length > INTERACTIVE_MAX_BUTTONS) throw new Error(`At most ${INTERACTIVE_MAX_BUTTONS} interactive buttons are supported`);
  const seen = new Set();
  return values.map((button, index) => {
    if (!button || typeof button !== 'object') throw new Error(`button ${index + 1} is invalid`);
    const id = validateButtonId(button.id, index);
    const text = validateButtonText(button.text ?? button.displayText, index);
    if (seen.has(id)) throw new Error(`Duplicate interactive button id: ${id}`);
    seen.add(id);
    return { id, text, order: Number.isInteger(button.order) ? button.order : index, type: INTERACTIVE_BUTTON_TYPE };
  }).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)).map((button, index) => ({ ...button, order: index }));
}
export function buildInteractiveMessage({ body, buttons, imageMessage = null }) {
  const text = requiredText(body, 'interactive body');
  const canonical = canonicalInteractiveButtons(buttons);
  const nativeButtons = canonical.map((button) => proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({ name: INTERACTIVE_BUTTON_TYPE, buttonParamsJson: JSON.stringify({ display_text: button.text, id: button.id }) }));
  return proto.Message.InteractiveMessage.create({ ...(imageMessage ? { header: proto.Message.InteractiveMessage.Header.create({ imageMessage, hasMediaAttachment: true }) } : {}), body: proto.Message.InteractiveMessage.Body.create({ text }), nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: nativeButtons, messageParamsJson: '{}', messageVersion: 1 }) });
}
export function buildInteractiveRelayNodes(isGroup = false) {
  const bizNode = {
    tag: 'biz',
    attrs: {},
    content: [
      {
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [
          {
            tag: 'native_flow',
            attrs: { v: '9', name: 'mixed' },
          },
        ],
      },
    ],
  };
  if (isGroup) return [bizNode];
  return [
    { tag: 'bot', attrs: { biz_bot: '1' } },
    bizNode,
  ];
}
export function parseInteractiveReply(message) {
  const content = message?.message ?? {};
  const response = content.interactiveResponseMessage;
  if (response) {
    let params = {};
    try { params = JSON.parse(String(response.nativeFlowResponseMessage?.paramsJson ?? '{}')); } catch { params = {}; }
    const buttonId = String(params.id ?? params.row_id ?? '').trim();
    const displayText = String(params.display_text ?? response.body?.text ?? '').trim();
    return { messageType: 'INTERACTIVE_RESPONSE', buttonId: buttonId || null, buttonText: displayText || null, sourceMessageId: response.contextInfo?.stanzaId ?? null, provenance: 'interactiveResponseMessage' };
  }
  const buttonsResponse = content.buttonsResponseMessage;
  if (buttonsResponse) return { messageType: 'INTERACTIVE_RESPONSE', buttonId: String(buttonsResponse.selectedButtonId ?? '').trim() || null, buttonText: String(buttonsResponse.selectedDisplayText ?? '').trim() || null, sourceMessageId: buttonsResponse.contextInfo?.stanzaId ?? null, provenance: 'buttonsResponseMessage' };
  const templateResponse = content.templateButtonReplyMessage;
  if (templateResponse) return { messageType: 'INTERACTIVE_RESPONSE', buttonId: String(templateResponse.selectedId ?? '').trim() || null, buttonText: String(templateResponse.selectedDisplayText ?? '').trim() || null, sourceMessageId: templateResponse.contextInfo?.stanzaId ?? null, provenance: 'templateButtonReplyMessage' };
  return null;
}
