import assert from 'node:assert/strict';
import test from 'node:test';
import { createManualPreview, parseCsv } from './dispatch-input.mjs';

test('parseCsv validates, normalizes and de-duplicates recipients', () => {
  const preview = parseCsv('Nome,Telefone\nAna,(11) 99999-1111\nBruno,5511999992222\nDup,5511999992222\n');
  assert.equal(preview.status, 'PREVIEW');
  assert.equal(preview.recipientCount, 2);
  assert.equal(preview.recipients[0].normalizedNumber, '11999991111@s.whatsapp.net');
  assert.equal(preview.invalid[0].reason, 'DUPLICATE');
  assert.match(preview.fingerprint, /^[a-f0-9]{64}$/);
});

test('parseCsv rejects CSV without phone column', () => {
  assert.throws(() => parseCsv('Nome,Email\nAna,a@example.com\n'), /phone\/telefone\/number column/);
});

test('createManualPreview rejects duplicate recipients', () => {
  assert.throws(() => createManualPreview([
    { name: 'Ana', number: '5511999991111' },
    { name: 'A', number: '5511999991111' }
  ]), /Duplicate recipient/);
});
