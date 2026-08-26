import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';

export const REQUIRED_HEADERS = Object.freeze(['number', 'context']);
export const OPTIONAL_HEADERS = Object.freeze(['contact']);
export const SUPPORTED_HEADERS = Object.freeze([...REQUIRED_HEADERS, ...OPTIONAL_HEADERS]);

const STATUS = Object.freeze({
  READY: 'READY',
  EMPTY: 'EMPTY',
  INVALID_CSV: 'INVALID_CSV',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
});

const ROW_STATUS = Object.freeze({
  VALID: 'VALID',
  INVALID: 'INVALID',
  DUPLICATE: 'DUPLICATE',
});

const DISPATCH_STATUS = Object.freeze({
  PREVIEW: 'PREVIEW',
  CONFIRMED: 'CONFIRMED',
  BLOCKED: 'BLOCKED',
  UNAVAILABLE: 'UNAVAILABLE',
});

/** @param {unknown} value @returns {string} */
function normalizeHeader(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim().toLowerCase();
}

/**
 * Read the first CSV record without interpreting delimiters inside quoted fields.
 * Used only to deterministically detect semicolon-separated CSV files common in
 * spreadsheet exports; comma remains the default.
 *
 * @param {string} text
 * @returns {string}
 */
function firstRecord(text) {
  let quoted = false;
  let result = '';
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        result += '""';
        index += 1;
        continue;
      }
      quoted = !quoted;
      result += char;
      continue;
    }
    if (!quoted && (char === '\n' || char === '\r')) break;
    result += char;
  }
  return result;
}

/** @param {string} text @param {string} delimiter @returns {{records: Array<{line: number, fields: string[]}>, errors: Array<{line: number, code: string, message: string}>}} */
function parseRecords(text, delimiter) {
  const records = [];
  const errors = [];
  let fields = [];
  let field = '';
  let quoted = false;
  let quoteClosed = false;
  let line = 1;
  let recordLine = 1;

  const pushRecord = () => {
    if (fields.length === 1 && fields[0].trim() === '') {
      fields = [];
      field = '';
      quoteClosed = false;
      recordLine = line;
      return;
    }
    fields.push(field);
    records.push({ line: recordLine, fields });
    fields = [];
    field = '';
    quoteClosed = false;
    recordLine = line;
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
          quoteClosed = true;
        }
        continue;
      }
      if (char === '\r') {
        if (text[index + 1] === '\n') index += 1;
        field += '\n';
        line += 1;
        continue;
      }
      if (char === '\n') {
        field += '\n';
        line += 1;
        continue;
      }
      field += char;
      continue;
    }

    if (quoteClosed) {
      if (char === ' ' || char === '\t') {
        continue;
      }
      if (char === delimiter) {
        fields.push(field);
        field = '';
        quoteClosed = false;
        continue;
      }
      if (char === '\r' || char === '\n') {
        if (char === '\r' && text[index + 1] === '\n') index += 1;
        line += 1;
        pushRecord();
        continue;
      }
      errors.push({
        line: recordLine,
        code: 'UNEXPECTED_CHARACTER_AFTER_QUOTE',
        message: 'Caractere inesperado após campo entre aspas.',
      });
      while (index < text.length && text[index] !== '\n' && text[index] !== '\r') index += 1;
      if (index < text.length) {
        index -= 1;
      }
      quoteClosed = false;
      fields = [];
      field = '';
      continue;
    }

    if (char === '"') {
      if (field.trim() !== '') {
        errors.push({
          line: recordLine,
          code: 'UNEXPECTED_QUOTE',
          message: 'Aspas encontradas no meio de um campo não citado.',
        });
        while (index < text.length && text[index] !== '\n' && text[index] !== '\r') index += 1;
        if (index < text.length) index -= 1;
        fields = [];
        field = '';
        continue;
      }
      quoted = true;
      continue;
    }

    if (char === delimiter) {
      fields.push(field);
      field = '';
      continue;
    }

    if (char === '\r' || char === '\n') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      line += 1;
      pushRecord();
      continue;
    }

    field += char;
  }

  if (quoted) {
    errors.push({
      line: recordLine,
      code: 'UNCLOSED_QUOTE',
      message: 'Campo entre aspas não foi fechado.',
    });
  } else if (field !== '' || fields.length > 0) {
    pushRecord();
  }

  return { records, errors };
}

/** @param {string} text @returns {string} */
function detectDelimiter(text) {
  const record = firstRecord(text);
  const commaFields = record.split(',').length;
  const semicolonFields = record.split(';').length;
  if (commaFields === 1 && semicolonFields > 1) return ';';
  return ',';
}

/** @param {string} value @returns {string} */
export function normalizeNumber(value) {
  const raw = String(value ?? '').trim();
  return raw.replace(/\D/g, '');
}

/** @param {string} value @returns {{ok: true, normalized: string} | {ok: false, code: string, message: string}} */
function validateNumber(value) {
  const normalized = normalizeNumber(value);
  if (!normalized) {
    return {
      ok: false,
      code: 'INVALID_NUMBER',
      message: 'Número inválido: informe ao menos um dígito.',
    };
  }
  return { ok: true, normalized };
}

/** @param {string[]} headers @returns {{ok: true, index: Record<string, number>} | {ok: false, errors: Array<{code: string, message: string}>}} */
function validateHeaders(headers) {
  const normalized = headers.map(normalizeHeader);
  const errors = [];
  const index = {};

  normalized.forEach((header, position) => {
    if (!header) {
      errors.push({ code: 'EMPTY_HEADER', message: `Cabeçalho vazio na coluna ${position + 1}.` });
      return;
    }
    if (index[header] !== undefined) {
      errors.push({ code: 'DUPLICATE_HEADER', message: `Cabeçalho duplicado: ${header}.` });
      return;
    }
    index[header] = position;
  });

  for (const required of REQUIRED_HEADERS) {
    if (index[required] === undefined) {
      errors.push({ code: 'MISSING_HEADER', message: `Cabeçalho obrigatório ausente: ${required}.` });
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true, index };
}

/** @param {{line: number, fields: string[]} record @param {string[]} headers @param {Record<string, number>} index */
function validateRow(record, headers, index) {
  const { line, fields } = record;
  const issues = [];
  if (fields.length !== headers.length) {
    issues.push({
      row: line,
      code: 'FIELD_COUNT_MISMATCH',
      message: `Linha ${line}: esperado ${headers.length} campos, recebido ${fields.length}.`,
    });
  }

  const number = fields[index.number] ?? '';
  const context = fields[index.context] ?? '';
  const contact = fields[index.contact] ?? '';

  if (!String(number).trim()) {
    issues.push({ row: line, code: 'MISSING_NUMBER', message: `Linha ${line}: número ausente.` });
  }
  if (!String(context).trim()) {
    issues.push({ row: line, code: 'MISSING_CONTEXT', message: `Linha ${line}: contexto ausente.` });
  }

  const numberValidation = validateNumber(number);
  if (!numberValidation.ok) issues.push({ row: line, ...numberValidation });

  if (issues.length) {
    return {
      row: {
        row: line,
        status: ROW_STATUS.INVALID,
        number: String(number).trim(),
        normalizedNumber: numberValidation.ok ? numberValidation.normalized : null,
        contact: String(contact).trim() || undefined,
        context: String(context),
        issues,
      },
      issues,
    };
  }

  return {
    row: {
      row: line,
      status: ROW_STATUS.VALID,
      number: String(number).trim(),
      normalizedNumber: numberValidation.normalized,
      contact: String(contact).trim() || undefined,
      context: String(context),
      issues: [],
    },
    issues: [],
  };
}

/** @param {Array<{row: number, status: string, normalizedNumber: string | null, [key: string]: unknown}>} rows */
function deduplicate(rows) {
  const seen = new Set();
  let duplicateCount = 0;
  const updatedRows = rows.map(row => {
    if (row.status !== ROW_STATUS.VALID || !row.normalizedNumber) return row;
    if (seen.has(row.normalizedNumber)) {
      duplicateCount += 1;
      const issue = {
        row: row.row,
        code: 'DUPLICATE_NUMBER',
        message: `Linha ${row.row}: número duplicado após normalização (${row.normalizedNumber}).`,
      };
      return { ...row, status: ROW_STATUS.DUPLICATE, issues: [...row.issues, issue] };
    }
    seen.add(row.normalizedNumber);
    return row;
  });
  return { rows: updatedRows, duplicateCount };
}

/** @param {string} text @param {{sourceName?: string, maxBytes?: number}} [options] */
export function ingestCsvText(text, options = {}) {
  const sourceName = options.sourceName ?? 'upload.csv';
  const raw = String(text ?? '').replace(/^\uFEFF/, '');
  if (!raw.trim()) {
    return {
      status: STATUS.EMPTY,
      sourceName,
      delimiter: null,
      headers: [],
      rows: [],
      issues: [],
      parseErrors: [],
      summary: { total: 0, valid: 0, invalid: 0, duplicate: 0 },
    };
  }

  const delimiter = detectDelimiter(raw);
  const parsed = parseRecords(raw, delimiter);
  if (parsed.errors.length) {
    return {
      status: STATUS.INVALID_CSV,
      sourceName,
      delimiter,
      headers: [],
      rows: [],
      issues: [],
      parseErrors: parsed.errors,
      summary: { total: 0, valid: 0, invalid: 0, duplicate: 0 },
    };
  }

  const headerRecord = parsed.records[0];
  if (!headerRecord) {
    return {
      status: STATUS.EMPTY,
      sourceName,
      delimiter,
      headers: [],
      rows: [],
      issues: [],
      parseErrors: [],
      summary: { total: 0, valid: 0, invalid: 0, duplicate: 0 },
    };
  }

  const headerValidation = validateHeaders(headerRecord.fields);
  if (!headerValidation.ok) {
    return {
      status: STATUS.INVALID_CSV,
      sourceName,
      delimiter,
      headers: headerRecord.fields.map(normalizeHeader),
      rows: [],
      issues: headerValidation.errors.map(error => ({ row: headerRecord.line, ...error })),
      parseErrors: [],
      summary: { total: 0, valid: 0, invalid: 0, duplicate: 0 },
    };
  }

  const headers = headerRecord.fields.map(normalizeHeader);
  const dataRecords = parsed.records.slice(1);
  if (dataRecords.length === 0) {
    return {
      status: STATUS.EMPTY,
      sourceName,
      delimiter,
      headers,
      rows: [],
      issues: [],
      parseErrors: [],
      summary: { total: 0, valid: 0, invalid: 0, duplicate: 0 },
    };
  }

  const validated = dataRecords.map(record => validateRow(record, headers, headerValidation.index));
  const rowsBeforeDedup = validated.map(item => item.row);
  const rowIssues = validated.flatMap(item => item.issues);
  const deduped = deduplicate(rowsBeforeDedup);
  const duplicateIssues = deduped.rows.flatMap(row => row.issues.filter(issue => issue.code === 'DUPLICATE_NUMBER'));
  const allIssues = [...rowIssues, ...duplicateIssues];

  const invalid = deduped.rows.filter(row => row.status === ROW_STATUS.INVALID).length;
  const duplicate = deduped.duplicateCount;
  const valid = deduped.rows.filter(row => row.status === ROW_STATUS.VALID).length;

  return {
    status: STATUS.READY,
    sourceName,
    delimiter,
    headers,
    rows: deduped.rows,
    issues: allIssues,
    parseErrors: [],
    summary: {
      total: dataRecords.length,
      valid,
      invalid,
      duplicate,
    },
  };
}

/** @param {string} filePath @param {{maxBytes?: number, sourceName?: string}} [options] */
export async function ingestCsvFile(filePath, options = {}) {
  const sourceName = options.sourceName ?? String(filePath);
  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch (error) {
    return {
      status: STATUS.FILE_READ_ERROR,
      sourceName,
      delimiter: null,
      headers: [],
      rows: [],
      issues: [{ row: 0, code: 'FILE_READ_ERROR', message: error instanceof Error ? error.message : String(error) }],
      parseErrors: [],
      summary: { total: 0, valid: 0, invalid: 0, duplicate: 0 },
    };
  }

  if (!fileStat.isFile()) {
    return {
      status: STATUS.FILE_READ_ERROR,
      sourceName,
      delimiter: null,
      headers: [],
      rows: [],
      issues: [{ row: 0, code: 'NOT_A_FILE', message: 'A origem informada não é um arquivo regular.' }],
      parseErrors: [],
      summary: { total: 0, valid: 0, invalid: 0, duplicate: 0 },
    };
  }

  if (Number.isFinite(options.maxBytes) && fileStat.size > options.maxBytes) {
    return {
      status: STATUS.FILE_TOO_LARGE,
      sourceName,
      delimiter: null,
      headers: [],
      rows: [],
      issues: [{ row: 0, code: 'FILE_TOO_LARGE', message: `Arquivo excede o limite autorizado de ${options.maxBytes} bytes.` }],
      parseErrors: [],
      summary: { total: 0, valid: 0, invalid: 0, duplicate: 0 },
    };
  }

  try {
    const content = await readFile(filePath, 'utf8');
    return ingestCsvText(content, { sourceName, maxBytes: options.maxBytes });
  } catch (error) {
    return {
      status: STATUS.FILE_READ_ERROR,
      sourceName,
      delimiter: null,
      headers: [],
      rows: [],
      issues: [{ row: 0, code: 'FILE_READ_ERROR', message: error instanceof Error ? error.message : String(error) }],
      parseErrors: [],
      summary: { total: 0, valid: 0, invalid: 0, duplicate: 0 },
    };
  }
}

/** @param {ReturnType<typeof ingestCsvText>} ingestion */
function canonicalPlanInput(ingestion) {
  return JSON.stringify({
    sourceName: ingestion.sourceName,
    delimiter: ingestion.delimiter,
    rows: ingestion.rows.map(row => ({
      row: row.row,
      status: row.status,
      normalizedNumber: row.normalizedNumber,
      contact: row.contact ?? null,
      context: row.context,
    })),
  });
}

/** @param {ReturnType<typeof ingestCsvText>} ingestion */
export function createDispatchPreview(ingestion) {
  if (!ingestion || typeof ingestion !== 'object') throw new Error('Ingestion result is required');
  const fingerprint = createHash('sha256').update(canonicalPlanInput(ingestion), 'utf8').digest('hex');
  const recipients = ingestion.rows
    .filter(row => row.status === ROW_STATUS.VALID)
    .map(row => ({
      row: row.row,
      number: row.number,
      normalizedNumber: row.normalizedNumber,
      contact: row.contact,
      context: row.context,
    }));

  return {
    status: DISPATCH_STATUS.PREVIEW,
    fingerprint,
    sourceName: ingestion.sourceName,
    recipients,
    summary: ingestion.summary,
    issues: ingestion.issues,
    providerStatus: null,
    effectStarted: false,
  };
}

/** @param {ReturnType<typeof createDispatchPreview>} preview @param {string} fingerprint */
export function confirmDispatchPreview(preview, fingerprint) {
  if (!preview || preview.status !== DISPATCH_STATUS.PREVIEW) {
    return { status: DISPATCH_STATUS.BLOCKED, code: 'INVALID_PREVIEW_STATE', reason: 'Preview não está aguardando confirmação humana.' };
  }
  if (preview.effectStarted) {
    return { status: DISPATCH_STATUS.BLOCKED, code: 'EFFECT_ALREADY_STARTED', reason: 'A operação já iniciou efeito externo.' };
  }
  if (preview.recipients.length === 0) {
    return { status: DISPATCH_STATUS.BLOCKED, code: 'NO_VALID_RECIPIENTS', reason: 'Não existem destinatários válidos após validação e deduplicação.' };
  }
  if (fingerprint !== preview.fingerprint) {
    return { status: DISPATCH_STATUS.BLOCKED, code: 'PREVIEW_CHANGED', reason: 'A confirmação não corresponde ao conteúdo visualizado.' };
  }
  return {
    ...preview,
    status: DISPATCH_STATUS.CONFIRMED,
    humanConfirmed: true,
    confirmedFingerprint: fingerprint,
  };
}

/** @param {ReturnType<typeof createDispatchPreview>} preview */
export function dispatchConfirmedPreview(preview) {
  if (!preview || preview.status !== DISPATCH_STATUS.CONFIRMED || preview.humanConfirmed !== true) {
    return {
      status: DISPATCH_STATUS.BLOCKED,
      code: 'HUMAN_CONFIRMATION_REQUIRED',
      reason: 'Nenhum efeito externo pode iniciar sem confirmação humana explícita.',
      providerStatus: null,
      effectStarted: false,
    };
  }

  return {
    status: DISPATCH_STATUS.UNAVAILABLE,
    code: 'BATCH_DISPATCH_UNAVAILABLE',
    reason: 'Não existe contrato de dispatch em lote autorizado neste território; nenhum efeito externo foi iniciado.',
    providerStatus: null,
    effectStarted: false,
    recipients: preview.recipients.length,
  };
}

export { STATUS as INGESTION_STATUS, ROW_STATUS, DISPATCH_STATUS };
