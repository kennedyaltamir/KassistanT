import test from 'node:test';
import assert from 'node:assert/strict';
import { buildXmlSystemPrompt, toLlmMessages } from './auto-reply.mjs';

test('llm context excludes unverified customer identity fields', () => {
  const context = {
    identityBindingStatus: 'LEGACY_JID_DERIVED',
    customer: {
      id: 'customer-1',
      name: 'Kennedy Altamir',
      phoneNormalized: '246973638648023@lid',
      status: 'ACTIVE'
    },
    conversation: { lifecycleState: 'OPEN', ownership: 'AI', aiState: 'ACTIVE' },
    messages: [
      { direction: 'INBOUND', message_type: 'TEXT', text: 'Meu nome é Carlos.', id: 'message-1', media: null, extractions: [] }
    ],
    availableProducts: [],
    multimodal: []
  };

  const messages = toLlmMessages(context);
  const systemXml = messages[0].content;

  assert.match(systemXml, /<assistant_system>/);
  assert.match(systemXml, /<customer[^>]*trust="trusted"/);
  assert.doesNotMatch(systemXml, /Kennedy Altamir/);
  assert.doesNotMatch(systemXml, /246973638648023@lid/);
  assert.match(systemXml, /<current_user_message[^>]*trust="untrusted">Meu nome é Carlos\.<\/current_user_message>/);
});

test('XML context preserves multimodal provenance as data', () => {
  const xml = buildXmlSystemPrompt('Base instructions', {
    identityBindingStatus: 'CONFIRMED',
    customer: { id: 'customer-2', name: 'Carlos Silva' },
    conversation: { lifecycleState: 'OPEN', ownership: 'AI', aiState: 'ACTIVE' },
    messages: [{ direction: 'INBOUND', message_type: 'IMAGE', text: 'Veja isto', media: { id: 'media-1', mimeType: 'image/jpeg' }, extractions: [{ modality: 'VISION', status: 'COMPLETED', confidence: 0.91 }] }],
    multimodal: [{ modality: 'VISION', status: 'COMPLETED', confidence: 0.91, provider: 'ollama', model: 'gemma3' }],
    customerMemory: { facts: [], sources: [] },
    availableProducts: [],
    activeOrder: null,
    availableActions: ['SEARCH_PRODUCT']
  });

  assert.match(xml, /<multimodal_results trust="trusted">/);
  assert.match(xml, /VISION/);
  assert.match(xml, /gemma3/);
  assert.match(xml, /<message trust="untrusted"/);
  assert.match(xml, /media-1/);
});

test('confirmed customer identity remains available to llm context', () => {
  const xml = buildXmlSystemPrompt('Base instructions', {
    identityBindingStatus: 'CONFIRMED',
    customer: { id: 'customer-2', name: 'Carlos Silva', phoneNormalized: '5511999999999@s.whatsapp.net', status: 'ACTIVE' },
    conversation: { lifecycleState: 'OPEN', ownership: 'AI', aiState: 'ACTIVE' },
    messages: []
  });

  assert.match(xml, /Carlos Silva/);
  assert.match(xml, /5511999999999@s\.whatsapp\.net/);
});
