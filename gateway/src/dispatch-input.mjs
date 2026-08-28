import crypto from 'node:crypto';
import { normalizeRecipient } from './whatsapp.mjs';

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(current.trim()); current = '';
    } else current += char;
  }
  if (quoted) throw new Error('CSV contains an unterminated quoted field');
  cells.push(current.trim());
  return cells;
}

export function parseCsv(text) {
  const lines = String(text ?? '').replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length < 2) throw new Error('CSV must contain a header and at least one row');
  const headers = splitCsvLine(lines[0]).map((value) => value.toLowerCase().trim());
  const phoneIndex = headers.findIndex((value) => ['phone', 'telefone', 'number', 'numero', 'whatsapp'].includes(value));
  if (phoneIndex < 0) throw new Error('CSV requires a phone/telefone/number column');
  const nameIndex = headers.findIndex((value) => ['name', 'nome', 'contact', 'contato'].includes(value));
  const contextIndex = headers.findIndex((value) => ['context', 'contexto', 'observacao', 'observação', 'notes', 'nota'].includes(value));

  const seen = new Set();
  const recipients = [];
  const invalid = [];
  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const row = splitCsvLine(lines[rowIndex]);
    const rawPhone = row[phoneIndex] ?? '';
    try {
      const normalizedNumber = normalizeRecipient(rawPhone);
      if (seen.has(normalizedNumber)) { invalid.push({ row: rowIndex + 1, reason: 'DUPLICATE', raw: rawPhone }); continue; }
      seen.add(normalizedNumber);
      recipients.push({
        normalizedNumber,
        contact: nameIndex >= 0 ? (row[nameIndex] || null) : null,
        context: contextIndex >= 0 ? (row[contextIndex] || '') : '',
      });
    } catch (error) {
      invalid.push({ row: rowIndex + 1, reason: 'INVALID_PHONE', raw: rawPhone, error: error instanceof Error ? error.message : String(error) });
    }
  }
  if (recipients.length === 0) throw new Error('CSV contains no valid recipients');
  const fingerprint = crypto.createHash('sha256').update(JSON.stringify({ headers, recipients, invalid }), 'utf8').digest('hex');
  return { status: 'PREVIEW', fingerprint, sourceName: 'contacts.csv', headers, recipients, invalid, recipientCount: recipients.length };
}

export function createManualPreview(contacts) {
  if (!Array.isArray(contacts) || contacts.length === 0) throw new Error('At least one manual contact is required');
  const seen = new Set();
  const recipients = contacts.map((entry, index) => {
    if (!entry || typeof entry !== 'object') throw new Error(`Contact ${index + 1} is invalid`);
    const normalizedNumber = normalizeRecipient(entry.number ?? entry.phone ?? entry.telefone);
    if (seen.has(normalizedNumber)) throw new Error(`Duplicate recipient: ${normalizedNumber}`);
    seen.add(normalizedNumber);
    return { normalizedNumber, contact: entry.name ? String(entry.name).trim() : null, context: entry.context ? String(entry.context).trim() : '' };
  });
  const fingerprint = crypto.createHash('sha256').update(JSON.stringify(recipients), 'utf8').digest('hex');
  return { status: 'PREVIEW', fingerprint, sourceName: 'manual', recipients, invalid: [], recipientCount: recipients.length };
}
