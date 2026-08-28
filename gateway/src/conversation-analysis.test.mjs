import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeConversationMessages } from './conversation-analysis.mjs';

test('conversation analysis ignores outbound assistant messages', () => {
  const candidates = analyzeConversationMessages([
    {
      id: 'in-1',
      direction: 'INBOUND',
      text: 'Olá, meu nome é Carlos e quero saber quais produtos vocês têm.'
    },
    {
      id: 'out-1',
      direction: 'OUTBOUND',
      text: 'Sou o Assistente KassisT e tenho muitos produtos.'
    }
  ]);

  assert.deepEqual(
    candidates.map(({ key, value, source_message_id }) => ({ key, value, source_message_id })),
    [
      { key: 'name', value: 'Carlos', source_message_id: 'in-1' },
      { key: 'interest', value: 'saber quais produtos vocês têm.', source_message_id: 'in-1' }
    ]
  );
});

test('conversation analysis does not treat arbitrary text as city evidence', () => {
  const candidates = analyzeConversationMessages([
    {
      id: 'in-2',
      direction: 'INBOUND',
      text: 'Olá, gostaria de saber como vocês podem me ajudar.'
    }
  ]);

  assert.equal(candidates.some((item) => item.key === 'city'), false);
});

test('conversation analysis extracts explicit city with supported wording', () => {
  const candidates = analyzeConversationMessages([
    {
      id: 'in-3',
      direction: 'INBOUND',
      text: 'Moro em Belo Horizonte e quero comprar uma camisa.'
    }
  ]);

  const city = candidates.find((item) => item.key === 'city');
  assert.equal(city?.value, 'Belo Horizonte');
  assert.equal(city?.source_message_id, 'in-3');
});
