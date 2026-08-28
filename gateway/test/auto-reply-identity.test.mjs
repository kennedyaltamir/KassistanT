import test from 'node:test';
import assert from 'node:assert/strict';
import { identitySafetyInstruction, toLlmMessages } from '../src/auto-reply.mjs';

test('LLM context omits unverified customer identity fields', () => {
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
        direction: 'INBOUND',
        text: 'Meu nome é Carlos e quero saber quais produtos vocês têm.'
      },
      {
        direction: 'OUTBOUND',
        text: 'Olá Carlos!'
      }
    ]
  });

  const runtimeContext = messages[0].content;
  assert.match(runtimeContext, /"customer":\{"id":"customer-1"\}/);
  assert.doesNotMatch(runtimeContext, /Kennedy Altamir/);
  assert.doesNotMatch(runtimeContext, /246973638648023@lid/);

  const history = messages.slice(1).map(message => message.content).join('\n');
  assert.match(history, /Meu nome é Carlos/);
  assert.match(history, /Olá Carlos/);
});

test('identity safety instruction explicitly blocks unverified names as customer identity', () => {
  const instruction = identitySafetyInstruction('LEGACY_JID_DERIVED');

  assert.match(instruction, /Customer identity is not confirmed by the runtime/);
  assert.match(instruction, /do not address the customer by that name as an established fact/);
  assert.match(instruction, /meu nome é Carlos/);
  assert.equal(identitySafetyInstruction('CONFIRMED'), '');
});
