import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeRecipient } from '../src/whatsapp.mjs';

test('normalizeRecipient preserves WhatsApp LID unchanged', () => {
  const lid = '246973638648023@lid';
  assert.equal(normalizeRecipient(lid), lid);
});

test('normalizeRecipient preserves regular WhatsApp JID unchanged', () => {
  const jid = '553798253971:14@s.whatsapp.net';
  assert.equal(normalizeRecipient(jid), jid);
});

test('normalizeRecipient preserves group JID unchanged', () => {
  const group = '123456789-123456@g.us';
  assert.equal(normalizeRecipient(group), group);
});

test('normalizeRecipient still converts phone digits to user JID', () => {
  assert.equal(normalizeRecipient('553798253971'), '553798253971@s.whatsapp.net');
});
