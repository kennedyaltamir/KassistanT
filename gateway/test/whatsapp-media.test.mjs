import test from 'node:test';
import assert from 'node:assert/strict';
import { messageType } from '../src/whatsapp.mjs';

test('classifies Baileys nested audio message as AUDIO', () => {
  assert.equal(messageType({ message: { audioMessage: {} } }), 'AUDIO');
});

test('classifies Baileys nested image message as IMAGE', () => {
  assert.equal(messageType({ message: { imageMessage: {} } }), 'IMAGE');
});

test('classifies Baileys nested video message as VIDEO', () => {
  assert.equal(messageType({ message: { videoMessage: {} } }), 'VIDEO');
});

test('classifies Baileys nested document message as DOCUMENT', () => {
  assert.equal(messageType({ message: { documentMessage: {} } }), 'DOCUMENT');
});

test('classifies text message when no supported media payload exists', () => {
  assert.equal(messageType({ message: { conversation: 'Olá' } }), 'TEXT');
});
