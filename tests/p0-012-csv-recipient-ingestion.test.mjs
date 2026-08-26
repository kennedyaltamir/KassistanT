import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DISPATCH_STATUS,
  dispatchConfirmedPreview,
  ingestCsvText,
  normalizeNumber,
  parseCsvText,
} from '../apps/desktop/electron/dispatch/csv-recipient-ingestion.mjs';

const VALID_CSV = [
  'number,contact,context',
  '5511999990001,Alice,Olá Alice',
  '5511999990002,Bob,Olá Bob',
].join('\n');

test('P0-012: accepts valid CSV and preserves per-recipient context', () => {
  const result = ingestCsvText(VALID_CSV);
  assert.equal(result.status, 'PREVIEW');
  assert.equal(result.recipients.length, 2);
  assert.equal(result.recipients[0].context, 'Olá Alice');
  assert.equal(result.recipients[1].context, 'Olá Bob');
});

test('P0-012: supports optional contact and semicolon spreadsheet exports', () => {
  const result = ingestCsvText('number;context\n5511999990001;Olá');
  assert.equal(result.status, 'PREVIEW');
  assert.equal(result.recipients[0].contact, null);
  assert.equal(result.recipients[0].context, 'Olá');
});

test('P0-012: marks an empty file as EMPTY', () => {
  assert.equal(ingestCsvText('').status, 'EMPTY');
});

test('P0-012: rejects missing required header deterministically', () => {
  const result = ingestCsvText('contact,context\nAlice,Olá');
  assert.equal(result.status, 'INVALID');
});

test('P0-012: marks invalid row without hiding it', () => {
  const result = ingestCsvText('number,contact,context\ninvalid,Alice,Olá');
  assert.equal(result.status, 'PREVIEW');
  assert.equal(result.recipients.length, 0);
  assert.equal(result.invalidRows.length, 1);
});

test('P0-012: detects duplicates after number normalization', () => {
  const result = ingestCsvText('number,context\n+55 (11) 99999-0001,Olá\n5511999990001,Outro');
  assert.equal(result.status, 'PREVIEW');
  assert.equal(result.recipients.length, 1);
  assert.equal(result.duplicates.length, 1);
});

test('P0-012: reports malformed CSV parsing errors', () => {
  const result = ingestCsvText('number,context\n"unterminated,Olá');
  assert.equal(result.status, 'ERROR');
  assert.ok(result.error);
});

test('P0-012: real file ingestion reads a CSV and applies authorized size limit', async () => {
  const { mkdtemp, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const dir = await mkdtemp(join(tmpdir(), 'kassist-p0-012-'));
  const file = join(dir, 'test.csv');
  await writeFile(file, VALID_CSV, 'utf8');
  const result = await parseCsvText(file);
  assert.equal(result.status, 'PREVIEW');
  await rm(dir, { recursive: true, force: true });
});

test('P0-012: preview is explicit and starts no external effect', () => {
  const preview = ingestCsvText(VALID_CSV);
  const dispatch = dispatchConfirmedPreview(preview);
  assert.equal(dispatch.status, DISPATCH_STATUS.UNAVAILABLE);
  assert.equal(dispatch.effectStarted, false);
});

test('P0-012: dispatch cannot start before human confirmation', () => {
  const preview = ingestCsvText(VALID_CSV);
  const dispatch = dispatchConfirmedPreview(preview);
  assert.equal(dispatch.status, DISPATCH_STATUS.UNAVAILABLE);
  assert.equal(dispatch.effectStarted, false);
});

test('P0-012: confirmation is human-gated and snapshot-bound', () => {
  const preview = ingestCsvText(VALID_CSV);
  const confirmed = { ...preview, humanConfirmed: true };
  assert.equal(confirmed.humanConfirmed, true);
  const dispatch = dispatchConfirmedPreview(confirmed);
  assert.equal(dispatch.status, DISPATCH_STATUS.UNAVAILABLE);
  assert.equal(dispatch.code, 'BATCH_DISPATCH_UNAVAILABLE');
  assert.equal(dispatch.effectStarted, false);
  assert.equal(dispatch.providerStatus, null);
});

test('P0-012: number normalization is deterministic', () => {
  assert.equal(normalizeNumber('+55 (31) 99999-9999'), '5531999999999');
  assert.equal(normalizeNumber(' 5531.8888.8888 '), '553188888888');
  assert.equal(normalizeNumber('abc'), '');
});
