import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecipient } from './whatsapp.mjs';

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
