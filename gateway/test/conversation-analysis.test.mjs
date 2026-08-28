import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeConversationMessages } from '../src/conversation-analysis.mjs';

test('conversation analysis extracts candidates only from inbound messages with provenance', () => {
  const candidates = analyzeConversationMessages([
    { id: 'm1', direction: 'INBOUND', text: 'Meu nome é Carlos e moro em Campinas.' },
    { id: 'm2', direction: 'OUTBOUND', text: 'Carlos, temos vários produtos.' }
  ]);

  const name = candidates.find((item) => item.key === 'name');
  const city = candidates.find((item) => item.key === 'city');
  assert.ok(name);
  assert.equal(name.value, 'Carlos');
  assert.equal(name.resolution_status, 'CANDIDATE');
  assert.equal(name.source_message_id, 'm1');
  assert.equal(name.provenance.source_message_id, 'm1');
  assert.ok(name.provenance.observed_at);
  assert.ok(city);
  assert.equal(candidates.some((item) => item.value.includes('vários produtos')), false);
});

test('conversation analysis preserves conflicting candidates instead of overwriting them', () => {
  const candidates = analyzeConversationMessages([
    { id: 'm1', direction: 'INBOUND', text: 'Meu nome é João.' },
    { id: 'm2', direction: 'INBOUND', text: 'Meu nome é Carlos.' }
  ]);

  const names = candidates.filter((item) => item.key === 'name');
  assert.equal(names.length, 2);
  assert.notEqual(names[0].value, names[1].value);
});

test('conversation analysis exposes candidate fields for product mentions and order information', () => {
  const candidates = analyzeConversationMessages([
    { id: 'm1', direction: 'INBOUND', text: 'Quero saber o produto Pizza Calabresa.' },
    { id: 'm2', direction: 'INBOUND', text: 'Pedido: duas pizzas e entrega amanhã.' }
  ]);

  assert.ok(candidates.some((item) => item.key === 'mentioned_products'));
  assert.ok(candidates.some((item) => item.key === 'interest'));
  assert.ok(candidates.some((item) => item.key === 'order_information'));
});
