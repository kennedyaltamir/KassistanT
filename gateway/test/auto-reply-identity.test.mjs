import test from 'node:test';
import assert from 'node:assert/strict';
import { identitySafetyInstruction, sanitizeUnverifiedIdentityInReply, toLlmMessages } from '../src/auto-reply.mjs';

test('LLM context omits unverified customer identity fields and isolates the current user message', () => {
  const messages = toLlmMessages({
    identityBindingStatus: 'LEGACY_JID_DERIVED',
    customer: {
      id: 'customer-1',
      name: 'Kennedy Altamir',
      phoneNormalized: '246973638648023@lid'
    },
    conversation: {
      id: 'conversation-1',
      lifecycleState: 'OPEN',
      ownership: 'AI',
      aiState: 'ACTIVE'
    },
    currentState: {},
    relevantMemories: [],
    activeOrder: null,
    businessContext: {},
    availableProducts: [],
    messages: [
      {
        id: 'm1',
        direction: 'INBOUND',
        text: 'Quero saber quais produtos vocês têm.'
      },
      {
        id: 'm2',
        direction: 'OUTBOUND',
        text: 'Claro, posso apresentar o catálogo.'
      },
      {
        id: 'm3',
        direction: 'INBOUND',
        text: 'Meu nome é Carlos e quero comprar o produto X.'
      }
    ]
  });

  const runtimeContext = messages[0].content;
  assert.match(runtimeContext, /"customer":\{"id":"customer-1"/);
  assert.match(runtimeContext, /"user_message":"Meu nome é Carlos e quero comprar o produto X\."/);
  assert.match(runtimeContext, /"recent_messages"/);
  assert.doesNotMatch(runtimeContext, /Kennedy Altamir/);
  assert.doesNotMatch(runtimeContext, /246973638648023@lid/);

  const history = messages.slice(1).map(message => message.content).join('\n');
  assert.match(history, /Quero saber quais produtos/);
  assert.match(history, /Claro, posso apresentar o catálogo/);

  const currentUserTurn = messages.find(
    message => message.role === 'user' && message.content === 'Meu nome é Carlos e quero comprar o produto X.'
  );
  assert.ok(currentUserTurn);
});

test('identity safety instruction explicitly blocks unverified names as customer identity', () => {
  const instruction = identitySafetyInstruction('LEGACY_JID_DERIVED');

  assert.match(instruction, /Customer identity is not confirmed by the runtime/);
  assert.match(instruction, /do not address the customer by that name as an established fact/);
  assert.match(instruction, /meu nome é Carlos/);
  assert.equal(identitySafetyInstruction('CONFIRMED'), '');
});

test('auto-reply output removes unverified names before external send', () => {
  const sanitized = sanitizeUnverifiedIdentityInReply(
    'Olá Carlos! Posso ajudar você com o catálogo. Kennedy Altamir não está confirmado.',
    {
      identityBindingStatus: 'OBSERVED_PHONE_IDENTITY',
      customer: { name: 'Kennedy Altamir' },
      messages: [
        { direction: 'INBOUND', text: 'Meu nome é Carlos e quero saber os produtos.' }
      ]
    }
  );

  assert.equal(sanitized, 'Olá! Posso ajudar você com o catálogo. não está confirmado.');
});

test('confirmed identity does not sanitize the customer name', () => {
  const reply = 'Olá Carlos! Posso ajudar você.';

  assert.equal(
    sanitizeUnverifiedIdentityInReply(reply, {
      identityBindingStatus: 'CONFIRMED',
      customer: { name: 'Carlos' },
      messages: []
    }),
    reply
  );
});
