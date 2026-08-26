import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  DISPATCH_STATUS,
  INGESTION_STATUS,
  ROW_STATUS,
  confirmDispatchPreview,
  createDispatchPreview,
  dispatchConfirmedPreview,
  ingestCsvFile,
  ingestCsvText,
  normalizeNumber,
} from '../apps/desktop/electron/dispatch/csv-recipient-ingestion.mjs';

test('P0-012: accepts valid CSV and preserves per-recipient context', () => {
  const result = ingestCsvText([
    'number,contact,context',
    '5531999999999,João,"Cliente interessado no combo X"',
    '5531988888888,Maria,"Pediu retorno sobre promoção"',
  ].join('\n'));

  assert.equal(result.status, INGESTION_STATUS.READY);
  assert.deepEqual(result.summary, { total: 2, valid: 2, invalid: 0, duplicate: 0 });
  assert.equal(result.rows[0].normalizedNumber, '5531999999999');
  assert.equal(result.rows[0].context, 'Cliente interessado no combo X');
  assert.equal(result.rows[1].context, 'Pediu retorno sobre promoção');
});

test('P0-012: supports optional contact and semicolon spreadsheet exports', () => {
  const result = ingestCsvText([
    'number;context',
    '55 31 99999-9999;"Contexto preservado"',
  ].join('\r\n'));

  assert.equal(result.status, INGESTION_STATUS.READY);
  assert.equal(result.delimiter, ';');
  assert.equal(result.summary.valid, 1);
  assert.equal(result.rows[0].contact, undefined);
  assert.equal(result.rows[0].normalizedNumber, '5531999999999');
});

test('P0-012: marks an empty file as EMPTY', () => {
  const result = ingestCsvText('');
  assert.equal(result.status, INGESTION_STATUS.EMPTY);
  assert.deepEqual(result.summary, { total: 0, valid: 0, invalid: 0, duplicate: 0 });
});

test('P0-012: rejects missing required header deterministically', () => {
  const result = ingestCsvText([
    'number,contact',
    '5531999999999,João',
  ].join('\n'));

  assert.equal(result.status, INGESTION_STATUS.INVALID_CSV);
  assert.equal(result.issues[0].code, 'MISSING_HEADER');
  assert.equal(result.issues.some(issue => issue.message.includes('context')), true);
});

test('P0-012: marks invalid row without hiding it', () => {
  const result = ingestCsvText([
    'number,contact,context',
    ',João,"Sem número"',
    'abc,Maria,"Número sem dígitos"',
    '5531999999999,Pedro,"Linha válida"',
  ].join('\n'));

  assert.equal(result.summary.total, 3);
  assert.equal(result.summary.invalid, 2);
  assert.equal(result.summary.valid, 1);
  assert.equal(result.rows.length, 3);
  assert.equal(result.rows[0].status, ROW_STATUS.INVALID);
  assert.equal(result.rows[1].status, ROW_STATUS.INVALID);
  assert.equal(result.rows[0].issues.some(issue => issue.code === 'MISSING_NUMBER'), true);
  assert.equal(result.rows[1].issues.some(issue => issue.code === 'INVALID_NUMBER'), true);
});

test('P0-012: detects duplicates after number normalization', () => {
  const result = ingestCsvText([
    'number,contact,context',
    '+55 (31) 99999-9999,João,"Primeiro contexto"',
    '5531999999999,Maria,"Segundo contexto"',
    '5531988888888,Pedro,"Outro contexto"',
  ].join('\n'));

  assert.equal(result.summary.duplicate, 1);
  assert.equal(result.summary.valid, 2);
  assert.equal(result.rows[1].status, ROW_STATUS.DUPLICATE);
  assert.equal(result.rows[1].context, 'Segundo contexto');
  assert.equal(result.rows[1].issues[0].code, 'DUPLICATE_NUMBER');
});

test('P0-012: reports malformed CSV parsing errors', () => {
  const result = ingestCsvText([
    'number,contact,context',
    '5531999999999,João,"Contexto sem fechamento',
  ].join('\n'));

  assert.equal(result.status, INGESTION_STATUS.INVALID_CSV);
  assert.equal(result.parseErrors[0].code, 'UNCLOSED_QUOTE');
  assert.equal(result.parseErrors[0].line, 2);
});

test('P0-012: real file ingestion reads a CSV and applies authorized size limit', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'kassist-p0012-'));
  const filePath = path.join(directory, 'recipients.csv');
  try {
    await writeFile(filePath, 'number,context\n5531999999999,"Contexto de arquivo"\n', 'utf8');
    const accepted = await ingestCsvFile(filePath, { sourceName: 'recipients.csv' });
    assert.equal(accepted.status, INGESTION_STATUS.READY);
    assert.equal(accepted.rows[0].context, 'Contexto de arquivo');

    const rejected = await ingestCsvFile(filePath, { maxBytes: 1 });
    assert.equal(rejected.status, INGESTION_STATUS.FILE_TOO_LARGE);
    assert.equal(rejected.issues[0].code, 'FILE_TOO_LARGE');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('P0-012: preview is explicit and starts no external effect', () => {
  const ingestion = ingestCsvText('number,context\n5531999999999,"Contexto A"\n');
  const preview = createDispatchPreview(ingestion);

  assert.equal(preview.status, DISPATCH_STATUS.PREVIEW);
  assert.equal(preview.effectStarted, false);
  assert.equal(preview.providerStatus, null);
  assert.equal(preview.recipients[0].context, 'Contexto A');
});

test('P0-012: dispatch cannot start before human confirmation', () => {
  const ingestion = ingestCsvText('number,context\n5531999999999,"Contexto A"\n');
  const preview = createDispatchPreview(ingestion);
  const result = dispatchConfirmedPreview(preview);

  assert.equal(result.status, DISPATCH_STATUS.BLOCKED);
  assert.equal(result.code, 'HUMAN_CONFIRMATION_REQUIRED');
  assert.equal(result.effectStarted, false);
  assert.equal(result.providerStatus, null);
});

test('P0-012: confirmation is human-gated and snapshot-bound', () => {
  const ingestion = ingestCsvText('number,context\n5531999999999,"Contexto A"\n');
  const preview = createDispatchPreview(ingestion);

  const wrong = confirmDispatchPreview(preview, 'wrong-fingerprint');
  assert.equal(wrong.status, DISPATCH_STATUS.BLOCKED);
  assert.equal(wrong.code, 'PREVIEW_CHANGED');

  const confirmed = confirmDispatchPreview(preview, preview.fingerprint);
  assert.equal(confirmed.status, DISPATCH_STATUS.CONFIRMED);
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
