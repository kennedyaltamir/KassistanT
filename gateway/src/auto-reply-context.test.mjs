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
      {
        direction: 'INBOUND',
        message_type: 'TEXT',
        text: 'Meu nome é Carlos.',
        id: 'message-1',
        media: null,
        extractions: []
      }
    ],
    availableProducts: [],
    multimodal: []
  };

  const currentMessage = {
    id: 'current-message',
    direction: 'INBOUND',
    text: 'Meu nome é Carlos.'
  };

  const messages = toLlmMessages(context, currentMessage);
  const systemXml = messages[0].content;

  assert.match(systemXml, /<assistant_system>/);
  assert.match(systemXml, /<customer[^>]*trust="trusted"/);
  assert.doesNotMatch(systemXml, /Kennedy Altamir/);
  assert.doesNotMatch(systemXml, /246973638648023@lid/);

  assert.doesNotMatch(systemXml, /<conversation_history>/);
  assert.doesNotMatch(systemXml, /<current_user_message/);

  assert.equal(messages.at(-1)?.role, 'user');
  assert.equal(messages.at(-1)?.content, 'Meu nome é Carlos.');
});

test('XML context preserves multimodal provenance as data', () => {
  const xml = buildXmlSystemPrompt('Base instructions', {
    identityBindingStatus: 'CONFIRMED',
    customer: { id: 'customer-2', name: 'Carlos Silva' },
    conversation: { lifecycleState: 'OPEN', ownership: 'AI', aiState: 'ACTIVE' },
    messages: [
      {
        direction: 'INBOUND',
        message_type: 'IMAGE',
        text: 'Veja isto',
        media: {
          id: 'media-1',
          mimeType: 'image/jpeg'
        },
        extractions: [
          {
            modality: 'VISION',
            status: 'COMPLETED',
            confidence: 0.91
          }
        ]
      }
    ],
    multimodal: [
      {
        modality: 'VISION',
        status: 'COMPLETED',
        confidence: 0.91,
        provider: 'ollama',
        model: 'gemma3'
      }
    ],
    customerMemory: {
      facts: [],
      sources: []
    },
    availableProducts: [],
    activeOrder: null,
    availableActions: ['SEARCH_PRODUCT']
  });

  assert.match(xml, /<multimodal_results trust="trusted">/);
  assert.match(xml, /VISION/);
  assert.match(xml, /gemma3/);

  assert.doesNotMatch(xml, /<conversation_history>/);
  assert.doesNotMatch(xml, /<current_user_message/);
  assert.doesNotMatch(xml, /<message trust="untrusted"/);
  assert.doesNotMatch(xml, /media-1/);
});

test('confirmed customer identity remains available to llm context', () => {
  const xml = buildXmlSystemPrompt('Base instructions', {
    identityBindingStatus: 'CONFIRMED',
    customer: {
      id: 'customer-2',
      name: 'Carlos Silva',
      phoneNormalized: '5511999999999@s.whatsapp.net',
      status: 'ACTIVE'
    },
    conversation: {
      lifecycleState: 'OPEN',
      ownership: 'AI',
      aiState: 'ACTIVE'
    },
    messages: []
  });

  assert.match(xml, /Carlos Silva/);
  assert.match(xml, /5511999999999@s\.whatsapp\.net/);
});

test('explicit current message is not inferred from historical inbound messages', () => {
  const context = {
    identityBindingStatus: 'CONFIRMED',
    customer: {
      id: 'customer-1'
    },
    conversation: {
      lifecycleState: 'OPEN',
      ownership: 'AI',
      aiState: 'ACTIVE'
    },
    messages: [
      {
        id: 'h1',
        direction: 'INBOUND',
        text: 'TRACE_PIPELINE_005'
      },
      {
        id: 'h2',
        direction: 'OUTBOUND',
        text: 'Entendido.'
      },
      {
        id: 'h3',
        direction: 'INBOUND',
        text: 'AUTO_REPLY_LIVE_TEST_003'
      }
    ],
    availableProducts: [],
    multimodal: []
  };

  const currentMessage = {
    id: 'current',
    direction: 'INBOUND',
    text: 'KASSIST_FINAL_TEST_001'
  };

  const messages = toLlmMessages(context, currentMessage);

  assert.equal(messages.length, 2);

  assert.equal(messages[0]?.role, 'user');
  assert.equal(messages.at(-1)?.role, 'user');
  assert.equal(messages.at(-1)?.content, 'KASSIST_FINAL_TEST_001');

  assert.doesNotMatch(
    messages[0]?.content ?? '',
    /TRACE_PIPELINE_005|Entendido\.|AUTO_REPLY_LIVE_TEST_003/
  );
});
test('current message receives only multimodal results linked to its own message id', () => {
  const currentMessage = {
    id: 'current-image',
    direction: 'INBOUND',
    message_type: 'IMAGE',
    text: 'O que tem nesta imagem?'
  };

  const context = {
    identityBindingStatus: 'CONFIRMED',
    customer: {
      id: 'customer-1',
      name: 'Carlos Silva'
    },
    conversation: {
      lifecycleState: 'OPEN',
      ownership: 'AI',
      aiState: 'ACTIVE'
    },
    messages: [
      {
        id: 'history-image',
        direction: 'INBOUND',
        message_type: 'IMAGE',
        text: 'Imagem antiga'
      }
    ],
    customerMemory: {
      facts: [],
      sources: []
    },
    multimodal: [
      {
        id: 'vision-history',
        messageId: 'history-image',
        modality: 'VISION',
        status: 'COMPLETED',
        extractedText: 'Produto histórico',
        confidence: 0.99
      },
      {
        id: 'vision-current',
        messageId: 'current-image',
        modality: 'VISION',
        status: 'UNAVAILABLE',
        extractedText: null,
        confidence: null
      }
    ],
    activeOrder: null,
    availableActions: []
  };

  const messages =
    toLlmMessages(
      context,
      currentMessage
    );

  assert.equal(
    messages.length,
    2
  );

  const systemXml =
    messages[0]?.content ?? '';

  assert.match(
    systemXml,
    /vision-current/
  );

  assert.doesNotMatch(
    systemXml,
    /vision-history/
  );

  assert.doesNotMatch(
    systemXml,
    /Produto histórico/
  );

  assert.equal(
    messages.at(-1)?.content,
    'O que tem nesta imagem?'
  );
});
test('explicit current message is emitted once and is not duplicated in history', () => {
  const currentMessage = {
    id: 'current-message',
    direction: 'INBOUND',
    text: 'KASSIST_FINAL_TEST_001'
  };

  const context = {
    identityBindingStatus: 'CONFIRMED',
    customer: {
      id: 'customer-1'
    },
    conversation: {
      lifecycleState: 'OPEN',
      ownership: 'AI',
      aiState: 'ACTIVE'
    },
    messages: [
      {
        id: 'history-1',
        direction: 'INBOUND',
        message_type: 'TEXT',
        text: 'TRACE_PIPELINE_005'
      },
      {
        id: 'history-2',
        direction: 'OUTBOUND',
        message_type: 'TEXT',
        text: 'Entendido.'
      },
      currentMessage
    ],
    availableProducts: [],
    multimodal: []
  };

  const messages = toLlmMessages(context, currentMessage);

  const occurrences = messages.filter(
    (message) => message.content === 'KASSIST_FINAL_TEST_001'
  );

  assert.equal(occurrences.length, 1);
  assert.equal(messages.at(-1)?.role, 'user');
  assert.equal(messages.at(-1)?.content, 'KASSIST_FINAL_TEST_001');
});