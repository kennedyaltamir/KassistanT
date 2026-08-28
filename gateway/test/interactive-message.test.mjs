import test from 'node:test';
import assert from 'node:assert/strict';

import {
  INTERACTIVE_MAX_BUTTONS,
  canonicalInteractiveButtons,
  buildInteractiveMessage,
  buildInteractiveRelayNodes,
} from '../src/interactive-message.mjs';

test('native flow accepts canonical quick reply buttons', () => {
  const buttons = canonicalInteractiveButtons([
    { id: 'qa_button_1', text: 'Confirmar' },
  ]);

  assert.equal(buttons.length, 1);
  assert.deepEqual(buttons[0], {
    id: 'qa_button_1',
    text: 'Confirmar',
    order: 0,
    type: 'quick_reply',
  });
});

test('interactive protobuf contains native flow quick reply', () => {
  const message = buildInteractiveMessage({
    body: 'Teste real de botão',
    buttons: [{ id: 'qa_button_1', text: 'Confirmar' }],
  });

  assert.ok(message?.nativeFlowMessage);
  assert.equal(message.nativeFlowMessage.buttons.length, 1);
  assert.equal(message.nativeFlowMessage.buttons[0].name, 'quick_reply');

  const params = JSON.parse(
    message.nativeFlowMessage.buttons[0].buttonParamsJson,
  );

  assert.equal(params.id, 'qa_button_1');
  assert.equal(params.display_text, 'Confirmar');
  assert.equal(message.nativeFlowMessage.messageParamsJson, '{}');
  assert.equal(message.nativeFlowMessage.messageVersion, 1);
});

test('private chat relay envelope contains bot and complete native-flow biz tree', () => {
  const nodes = buildInteractiveRelayNodes(false);

  assert.equal(nodes.length, 2);
  assert.equal(nodes[0].tag, 'bot');
  assert.equal(nodes[0].attrs.biz_bot, '1');

  const biz = nodes[1];
  assert.equal(biz.tag, 'biz');
  assert.equal(biz.attrs?.native_flow_name, undefined);

  const interactive = biz.content?.[0];
  const nativeFlow = interactive?.content?.[0];

  assert.equal(interactive?.tag, 'interactive');
  assert.deepEqual(interactive?.attrs, { type: 'native_flow', v: '1' });
  assert.equal(nativeFlow?.tag, 'native_flow');
  assert.deepEqual(nativeFlow?.attrs, { v: '9', name: 'mixed' });
});

test('group chat relay envelope omits private bot node', () => {
  const nodes = buildInteractiveRelayNodes(true);

  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].tag, 'biz');
  assert.equal(nodes[0].content?.[0]?.tag, 'interactive');
});

test('interactive button limit remains three', () => {
  assert.equal(INTERACTIVE_MAX_BUTTONS, 3);
  assert.throws(() =>
    canonicalInteractiveButtons([
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
      { id: 'c', text: 'C' },
      { id: 'd', text: 'D' },
    ]),
  );
});
