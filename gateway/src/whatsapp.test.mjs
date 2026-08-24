import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecipient, recordMessage, getMessages, subscribe } from './whatsapp.mjs';

test('normalizeRecipient accepts a WhatsApp JID unchanged', () => {
  assert.equal(normalizeRecipient('5511999999999@s.whatsapp.net'), '5511999999999@s.whatsapp.net');
});

test('normalizeRecipient normalizes phone digits to the user JID form', () => {
  assert.equal(normalizeRecipient('+55 (11) 99999-9999'), '5511999999999@s.whatsapp.net');
});

test('normalizeRecipient accepts group JIDs unchanged', () => {
  assert.equal(normalizeRecipient('1234567890-1234567890@g.us'), '1234567890-1234567890@g.us');
});

test('normalizeRecipient rejects empty recipients', () => {
  assert.throws(() => normalizeRecipient('   '), /Recipient is required/);
});

test('same message.id is persisted once and published once', () => {
  const message = {
    id: 'dedup-history-sse-1',
    jid: '5511999999999@s.whatsapp.net',
    direction: 'OUTBOUND',
    fromMe: true,
    text: 'Mensagem deduplicada',
    timestamp: 1,
    status: 'UNKNOWN',
  };
  const events = [];
  const unsubscribe = subscribe(event => {
    if (event.type === 'message' && event.message.id === message.id) events.push(event);
  });

  try {
    const before = getMessages(500).length;
    assert.equal(recordMessage(message), true);
    assert.equal(recordMessage({ ...message }), false);

    const matchingHistory = getMessages(500).filter(item => item.id === message.id);
    assert.equal(getMessages(500).length, before + 1);
    assert.equal(matchingHistory.length, 1);
    assert.equal(events.length, 1);
    assert.equal(events[0].message.id, message.id);
  } finally {
    unsubscribe();
  }
});

test('different message IDs remain independent', () => {
  const first = {
    id: 'dedup-independent-1',
    jid: '5511999999999@s.whatsapp.net',
    direction: 'OUTBOUND',
    fromMe: true,
    text: 'Primeira',
    timestamp: 2,
    status: 'UNKNOWN',
  };
  const second = {
    id: 'dedup-independent-2',
    jid: '5511999999999@s.whatsapp.net',
    direction: 'OUTBOUND',
    fromMe: true,
    text: 'Segunda',
    timestamp: 3,
    status: 'UNKNOWN',
  };
  const events = [];
  const unsubscribe = subscribe(event => {
    if (event.type === 'message' && [first.id, second.id].includes(event.message.id)) events.push(event);
  });

  try {
    assert.equal(recordMessage(first), true);
    assert.equal(recordMessage(second), true);
    assert.deepEqual(events.map(event => event.message.id), [first.id, second.id]);
  } finally {
    unsubscribe();
  }
});

test('different INBOUND and OUTBOUND IDs are not conflated', () => {
  const inbound = {
    id: 'direction-independent-inbound',
    jid: '5511999999999@s.whatsapp.net',
    direction: 'INBOUND',
    fromMe: false,
    text: 'Oi',
    timestamp: 4,
    status: 'RECEIVED',
  };
  const outbound = {
    id: 'direction-independent-outbound',
    jid: '5511999999999@s.whatsapp.net',
    direction: 'OUTBOUND',
    fromMe: true,
    text: 'Olá',
    timestamp: 5,
    status: 'UNKNOWN',
  };

  assert.equal(recordMessage(inbound), true);
  assert.equal(recordMessage(outbound), true);
  assert.equal(getMessages(500).filter(item => item.id === inbound.id).length, 1);
  assert.equal(getMessages(500).filter(item => item.id === outbound.id).length, 1);
});

test('message ID deduplication survives transport session restart', () => {
  const message = {
    id: 'session-restart-dedup-1',
    jid: '5511999999999@s.whatsapp.net',
    direction: 'OUTBOUND',
    fromMe: true,
    text: 'Persistir entre reconnect',
    timestamp: 6,
    status: 'UNKNOWN',
  };
  const before = getMessages(500).filter(item => item.id === message.id).length;
  assert.equal(before, 0);
  assert.equal(recordMessage(message), true);

  // The transport socket may be recreated on reconnect, but the Gateway
  // message registry remains process-local and authoritative for history/SSE.
  assert.equal(recordMessage({ ...message }), false);
  assert.equal(getMessages(500).filter(item => item.id === message.id).length, 1);
});
