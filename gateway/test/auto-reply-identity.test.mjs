import test from 'node:test';
import assert from 'node:assert/strict';
import { toLlmMessages } from '../src/auto-reply.mjs';

test('LLM history marks no identity as confirmed when runtime binding is legacy', () => {
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
