import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { sendText as defaultSendText } from './whatsapp.mjs';

/** @typedef {'DRAFT'|'CONFIRMED'|'QUEUED'|'PROCESSING'|'COMPLETED'|'PARTIAL_FAILURE'|'FAILED'|'CANCELLED'} BatchState */
/** @typedef {'PENDING'|'PROCESSING'|'SUCCESS'|'RETRY_WAIT'|'FAILED_TERMINAL'|'CANCELLED'} RecipientState */
/** @typedef {'REQUEST_PREPARED'|'REQUEST_ATTEMPTED'|'PROVIDER_OBSERVED'|'UNKNOWN'} EffectPhase */
/** @typedef {{normalizedNumber:string,context:string,contact:string|null}} DispatchRecipientInput */
/** @typedef {{status:'PREVIEW',fingerprint:string,sourceName?:string,recipients:DispatchRecipientInput[]}} DispatchPreview */
/** @typedef {{attempt:number,idempotencyIdentity:string,startedAt:string,phase:EffectPhase,causationId:string,effectStatus:string,requestedAt?:string,completedAt?:string,providerObservation?:{level:'TRANSPORT_OBSERVED',messageId:string|null,deliveryConfirmed:false,readConfirmed:false,cancelRequestedBeforeObservation?:boolean},failure?:{class:'RETRYABLE'|'TERMINAL',message:string},recovery?:'RESTART_INTERRUPTED'|'PROCESSING_TIMEOUT',timeoutAt?:string}} DispatchAttempt */
/** @typedef {{identity:string,context:string,contact:string|null,state:RecipientState,idempotencyIdentity:string,attempts:DispatchAttempt[],nextRetryAt:string|null,lastError?:string|null,recoveryBlocked?:boolean}} DispatchRecipient */
/** @typedef {{batchId:string,state:BatchState,createdAt:string,updatedAt:string,correlationId:string,causationId:string,preview:{fingerprint:string,sourceName:string,recipientCount:number,recipients:DispatchRecipientInput[]},confirmation?:{batchId:string,recipientCount:number,fingerprint:string,timestamp:string,correlationId:string},recipients:Record<string,DispatchRecipient>,cancellationRequested:boolean,cancellationOutcome?:'CANCELLED_AFTER_PARTIAL_EFFECT'|'CANCELLED_WITHOUT_EFFECT',recoveryRequired?:boolean}} DispatchBatch */
/** @typedef {{version:1,batches:Record<string,DispatchBatch>}} DispatchJournal */
/** @typedef {{fingerprint:unknown,recipientCount:unknown,correlationId?:string,confirmedAt?:string}} ConfirmInput */
/** @typedef {ReturnType<typeof setTimeout>|symbol} TimerHandle */
/** @typedef {{sendText?:(to:string,text:string)=>Promise<unknown>,statePath?:string,clock?:()=>number,setTimeoutImpl?:(callback:()=>void,delay:number)=>TimerHandle,clearTimeoutImpl?:(handle:TimerHandle)=>void}} RuntimeOptions */
/** @typedef {{kind:'RETRYABLE'|'TERMINAL',message:string}} FailureClassification */

export const BATCH_STATES = Object.freeze(['DRAFT','CONFIRMED','QUEUED','PROCESSING','COMPLETED','PARTIAL_FAILURE','FAILED','CANCELLED']);
export const RECIPIENT_STATES = Object.freeze(['PENDING','PROCESSING','SUCCESS','RETRY_WAIT','FAILED_TERMINAL','CANCELLED']);
export const EFFECT_PHASES = Object.freeze(['REQUEST_PREPARED','REQUEST_ATTEMPTED','PROVIDER_OBSERVED','UNKNOWN']);
export const MAX_ATTEMPTS = 5;
export const BACKOFF_MS = Object.freeze([30_000, 60_000, 120_000, 240_000]);
export const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000;

/** @returns {string} */
function defaultDataRoot() {
  if (process.env.KASSIST_DB_PATH) return path.dirname(process.env.KASSIST_DB_PATH);
  const base = process.env.APPDATA || process.env.XDG_DATA_HOME || path.join(os.homedir(), '.config');
  return path.join(base, 'KassisT');
}

/** @returns {string} */
function defaultStatePath() {
  return process.env.KASSIST_BATCH_STATE_PATH ?? path.join(defaultDataRoot(), 'dispatch', 'batches.json');
}

/** @param {() => number} clock @returns {string} */
function nowIso(clock) {
  return new Date(clock()).toISOString();
}

/** @returns {string} */
function newId() {
  return crypto.randomUUID();
}

/** @param {string} batchId @param {string} recipientIdentity @returns {string} */
function effectIdentity(batchId, recipientIdentity) {
  return crypto.createHash('sha256').update(`${batchId}:${recipientIdentity}`, 'utf8').digest('hex');
}

/** @param {DispatchRecipientInput[]} recipients @returns {DispatchRecipientInput[]} */
function canonicalRecipients(recipients) {
  return recipients.map((recipient) => ({
    normalizedNumber: String(recipient.normalizedNumber ?? '').trim(),
    context: String(recipient.context ?? ''),
    contact: recipient.contact ?? null,
  }));
}

/** @param {unknown} value @param {string} name @returns {string} */
function assertString(value, name) {
  const result = String(value ?? '').trim();
  if (!result) throw new Error(`${name} is required`);
  return result;
}

/** @param {unknown} error @returns {FailureClassification} */
function classifyFailure(error) {
  const message = error instanceof Error ? error.message : String(error);
  let statusCode;
  if (typeof error === 'object' && error !== null && 'output' in error && typeof error.output === 'object' && error.output !== null && 'statusCode' in error.output && typeof error.output.statusCode === 'number') {
    statusCode = error.output.statusCode;
  } else if (typeof error === 'object' && error !== null && 'statusCode' in error && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
  }
  if (statusCode !== undefined && [429, 500, 502, 503, 504].includes(statusCode)) return { kind: 'RETRYABLE', message };
  if (['ECONNRESET', 'ETIMEDOUT', 'ENETUNREACH', 'EAI_AGAIN', 'ECONNREFUSED', 'EPIPE'].some((code) => message.includes(code))) return { kind: 'RETRYABLE', message };
  if (/not connected|connection is closed|temporarily unavailable|timeout/i.test(message)) return { kind: 'RETRYABLE', message };
  return { kind: 'TERMINAL', message };
}

/** @param {number} attemptNumber @returns {number} */
function retryDelay(attemptNumber) {
  const delay = BACKOFF_MS[attemptNumber - 1];
  if (delay === undefined) throw new Error(`No backoff policy for attempt ${attemptNumber}`);
  return delay;
}

/** @returns {DispatchJournal} */
function makeInitialState() {
  return { version: 1, batches: {} };
}

export class BatchDispatchRuntime {
  /** @param {RuntimeOptions} [options] */
  constructor(options = {}) {
    const hasCustomTimer = options.setTimeoutImpl !== undefined;
    this.sendText = options.sendText ?? defaultSendText;
    this.statePath = options.statePath ?? defaultStatePath();
    this.clock = options.clock ?? (() => Date.now());
    this.setTimeoutImpl = options.setTimeoutImpl ?? ((callback, delay) => setTimeout(callback, delay));
    this.clearTimeoutImpl = options.clearTimeoutImpl ?? (hasCustomTimer ? (() => {}) : ((handle) => clearTimeout(/** @type {ReturnType<typeof setTimeout>} */ (handle))));
    /** @type {DispatchJournal} */
    this.state = makeInitialState();
    /** @type {Map<string, TimerHandle>} */
    this.retryTimers = new Map();
    /** @type {Promise<void>} */
    this.saveQueue = Promise.resolve();
    this.ready = this.#load();
  }

  /** @returns {Promise<void>} */
  async #load() {
    try {
      const raw = await fs.readFile(this.statePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || typeof parsed.batches !== 'object' || parsed.batches === null) throw new Error('invalid dispatch journal');
      this.state = /** @type {DispatchJournal} */ (parsed);
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') {
        console.error('[KassisT Dispatch] failed to load dispatch journal:', error instanceof Error ? error.message : error);
      }
      this.state = makeInitialState();
    }
    await this.#recoverAfterRestart();
    await this.#save();
  }

  /** @returns {Promise<void>} */
  #save() {
    const write = async () => {
      const directory = path.dirname(this.statePath);
      await fs.mkdir(directory, { recursive: true });
      const tempPath = `${this.statePath}.tmp`;
      await fs.writeFile(tempPath, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8');
      await fs.rename(tempPath, this.statePath);
    };
    const next = this.saveQueue.then(write, write);
    this.saveQueue = next.catch(() => {});
    return next;
  }

  /** @param {string|undefined} batchId @returns {DispatchBatch} */
  #batch(batchId) {
    const id = assertString(batchId, 'batchId');
    const batches = /** @type {Record<string, DispatchBatch>} */ (this.state.batches);
    const batch = batches[id];
    if (!batch) throw new Error(`Batch not found: ${id}`);
    return batch;
  }

  /** @param {DispatchBatch} batch @returns {BatchState} */
  #aggregate(batch) {
    const recipients = Object.values(batch.recipients);
    const hasProcessing = recipients.some((r) => r.state === 'PROCESSING');
    const hasRetryWait = recipients.some((r) => r.state === 'RETRY_WAIT');
    const hasPending = recipients.some((r) => r.state === 'PENDING');
    const hasSuccess = recipients.some((r) => r.state === 'SUCCESS');
    const hasTerminalFailure = recipients.some((r) => r.state === 'FAILED_TERMINAL');
    const hasCancelled = recipients.some((r) => r.state === 'CANCELLED');
    if (hasProcessing) return 'PROCESSING';
    if (hasRetryWait || hasPending) return 'PROCESSING';
    if (hasSuccess && hasTerminalFailure) return 'PARTIAL_FAILURE';
    if (recipients.length > 0 && recipients.every((r) => r.state === 'SUCCESS')) return 'COMPLETED';
    if (!hasSuccess && hasTerminalFailure && !hasCancelled) return 'FAILED';
    if (batch.cancellationRequested && !hasProcessing && !hasRetryWait && !hasPending) return 'CANCELLED';
    if (hasCancelled && !hasSuccess && !hasTerminalFailure) return 'CANCELLED';
    return batch.state;
  }

  /** @param {DispatchPreview} preview @param {{correlationId?:string,batchId?:string,createdAt?:string}} [options] @returns {Promise<DispatchBatch>} */
  async createDraft(preview, { correlationId = newId(), batchId = newId(), createdAt = nowIso(this.clock) } = {}) {
    await this.ready;
    if (!preview || preview.status !== 'PREVIEW') throw new Error('A PREVIEW is required to create a batch');
    if (!preview.fingerprint) throw new Error('Preview fingerprint is required');
    if (!Array.isArray(preview.recipients) || preview.recipients.length === 0) throw new Error('Preview must contain recipients');
    /** @type {Record<string, DispatchRecipient>} */
    const recipients = {};
    for (const item of canonicalRecipients(preview.recipients)) {
      const identity = assertString(item.normalizedNumber, 'recipient identity');
      if (recipients[identity]) throw new Error(`Duplicate recipient identity in confirmed set: ${identity}`);
      recipients[identity] = {
        identity,
        context: item.context,
        contact: item.contact,
        state: 'PENDING',
        idempotencyIdentity: effectIdentity(batchId, identity),
        attempts: [],
        nextRetryAt: null,
      };
    }
    const id = assertString(batchId, 'batchId');
    const batches = /** @type {Record<string, DispatchBatch>} */ (this.state.batches);
    batches[id] = {
      batchId: id,
      state: 'DRAFT',
      createdAt,
      updatedAt: createdAt,
      correlationId: assertString(correlationId, 'correlationId'),
      causationId: newId(),
      preview: {
        fingerprint: String(preview.fingerprint),
        sourceName: preview.sourceName ?? 'upload.csv',
        recipientCount: Object.keys(recipients).length,
        recipients: canonicalRecipients(preview.recipients),
      },
      recipients,
      cancellationRequested: false,
    };
    await this.#save();
    return this.#batch(id);
  }

  /** @param {string|undefined} batchId @param {ConfirmInput} input @returns {Promise<DispatchBatch>} */
  async confirmBatch(batchId, input) {
    await this.ready;
    const id = assertString(batchId, 'batchId');
    const { fingerprint, recipientCount, correlationId, confirmedAt } = input;
    const batch = this.#batch(id);
    if (batch.state !== 'DRAFT') throw new Error(`Batch cannot be confirmed from state ${batch.state}`);
    if (String(fingerprint) !== batch.preview.fingerprint) throw new Error('Preview fingerprint mismatch');
    if (Number(recipientCount) !== batch.preview.recipientCount) throw new Error('Recipient count mismatch');
    batch.state = 'CONFIRMED';
    batch.confirmation = {
      batchId: id,
      recipientCount: batch.preview.recipientCount,
      fingerprint: batch.preview.fingerprint,
      timestamp: confirmedAt ?? nowIso(this.clock),
      correlationId: assertString(correlationId ?? batch.correlationId, 'correlationId'),
    };
    batch.causationId = newId();
    batch.updatedAt = nowIso(this.clock);
    await this.#save();
    return batch;
  }

  /** @param {string|undefined} batchId @param {{causationId?:string}} [options] @returns {Promise<DispatchBatch>} */
  async queueBatch(batchId, { causationId = newId() } = {}) {
    await this.ready;
    const id = assertString(batchId, 'batchId');
    const batch = this.#batch(id);
    if (batch.state !== 'CONFIRMED') throw new Error(`Batch cannot be queued from state ${batch.state}`);
    batch.state = 'QUEUED';
    batch.causationId = causationId;
    batch.updatedAt = nowIso(this.clock);
    await this.#save();
    return await this.processBatch(id);
  }

  /** @param {string|undefined} batchId @returns {Promise<DispatchBatch>} */
  async processBatch(batchId) {
    await this.ready;
    const batch = this.#batch(batchId);
    if (!['QUEUED', 'PROCESSING'].includes(batch.state)) return batch;
    if (batch.state === 'QUEUED') batch.state = 'PROCESSING';
    batch.updatedAt = nowIso(this.clock);
    for (const recipient of Object.values(batch.recipients)) {
      if (batch.cancellationRequested) break;
      if (recipient.state === 'PENDING' && !recipient.recoveryBlocked) await this.#processRecipient(batch, recipient);
    }
    await this.#updateAggregate(batch);
    return batch;
  }

  /** @param {string} key @param {TimerHandle} timer */
  #rememberTimer(key, timer) {
    const existing = this.retryTimers.get(key);
    if (existing !== undefined) this.clearTimeoutImpl(existing);
    this.retryTimers.set(key, timer);
  }

  /** @param {string} key */
  #clearTimer(key) {
    const timer = this.retryTimers.get(key);
    if (timer !== undefined) {
      this.clearTimeoutImpl(timer);
      this.retryTimers.delete(key);
    }
  }

  /** @param {DispatchBatch} batch @param {DispatchRecipient} recipient @returns {Promise<void>} */
  async #processRecipient(batch, recipient) {
    if (recipient.state !== 'PENDING' || recipient.recoveryBlocked) return;
    recipient.state = 'PROCESSING';
    const attemptNumber = recipient.attempts.length + 1;
    const attempt = /** @type {DispatchAttempt} */ ({
      attempt: attemptNumber,
      idempotencyIdentity: recipient.idempotencyIdentity,
      startedAt: nowIso(this.clock),
      phase: 'REQUEST_PREPARED',
      causationId: newId(),
      effectStatus: 'PENDING',
    });
    recipient.attempts.push(attempt);
    batch.updatedAt = nowIso(this.clock);

    const timerKey = `${batch.batchId}:${recipient.identity}:${attemptNumber}`;
    const timeoutPromise = new Promise((_, reject) => {
      const timer = this.setTimeoutImpl(() => reject(Object.assign(new Error('PROCESSING timeout exceeded'), { code: 'PROCESSING_TIMEOUT' })), PROCESSING_TIMEOUT_MS);
      this.#rememberTimer(timerKey, timer);
    });

    await this.#save();
    attempt.phase = 'REQUEST_ATTEMPTED';
    attempt.requestedAt = nowIso(this.clock);
    attempt.effectStatus = 'IN_FLIGHT';
    await this.#save();

    try {
      const message = await Promise.race([this.sendText(recipient.identity, recipient.context), timeoutPromise]);
      this.#clearTimer(timerKey);
      attempt.phase = 'PROVIDER_OBSERVED';
      attempt.completedAt = nowIso(this.clock);
      attempt.effectStatus = 'TRANSPORT_OBSERVED';
      attempt.providerObservation = {
        level: 'TRANSPORT_OBSERVED',
        messageId: typeof message === 'object' && message !== null && 'id' in message && typeof message.id === 'string' ? message.id : null,
        deliveryConfirmed: false,
        readConfirmed: false,
        ...(batch.cancellationRequested ? { cancelRequestedBeforeObservation: true } : {}),
      };
      recipient.state = 'SUCCESS';
      recipient.nextRetryAt = null;
      recipient.lastError = null;
      if (batch.cancellationRequested) batch.cancellationOutcome = 'CANCELLED_AFTER_PARTIAL_EFFECT';
    } catch (error) {
      this.#clearTimer(timerKey);
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'PROCESSING_TIMEOUT') {
        attempt.phase = 'UNKNOWN';
        attempt.completedAt = nowIso(this.clock);
        attempt.effectStatus = 'INDETERMINATE_EFFECT_UNRESOLVED';
        attempt.recovery = 'PROCESSING_TIMEOUT';
        attempt.timeoutAt = nowIso(this.clock);
        recipient.recoveryBlocked = true;
        recipient.lastError = 'Processing exceeded the 5-minute recovery threshold; external effect cannot be reconciled safely.';
        batch.recoveryRequired = true;
      } else {
        const failure = classifyFailure(error);
        attempt.phase = 'UNKNOWN';
        attempt.completedAt = nowIso(this.clock);
        attempt.failure = { class: failure.kind, message: failure.message };
        attempt.effectStatus = 'FAILED_OBSERVED';
        recipient.lastError = failure.message;
        if (failure.kind === 'RETRYABLE' && attemptNumber < MAX_ATTEMPTS && !batch.cancellationRequested) {
          const delay = retryDelay(attemptNumber);
          recipient.state = 'RETRY_WAIT';
          recipient.nextRetryAt = new Date(this.clock() + delay).toISOString();
          this.#scheduleRetry(batch.batchId, recipient.identity, delay);
        } else {
          recipient.state = 'FAILED_TERMINAL';
          recipient.nextRetryAt = null;
        }
      }
    }
    batch.updatedAt = nowIso(this.clock);
    await this.#save();
  }

  /** @param {string} batchId @param {string} recipientIdentity @param {number} delay */
  #scheduleRetry(batchId, recipientIdentity, delay) {
    const key = `retry:${batchId}:${recipientIdentity}`;
    if (this.retryTimers.has(key)) return;
    const timer = this.setTimeoutImpl(() => {
      this.retryTimers.delete(key);
      void this.retryRecipient(batchId, recipientIdentity).catch((error) => console.error('[KassisT Dispatch] retry failed:', error instanceof Error ? error.message : error));
    }, delay);
    this.retryTimers.set(key, timer);
  }

  /** @param {string|undefined} batchId @param {string|undefined} recipientIdentity @returns {Promise<DispatchBatch>} */
  async retryRecipient(batchId, recipientIdentity) {
    await this.ready;
    const id = assertString(batchId, 'batchId');
    const recipientId = assertString(recipientIdentity, 'recipientIdentity');
    const batch = this.#batch(id);
    const recipients = /** @type {Record<string, DispatchRecipient>} */ (batch.recipients);
    const recipient = recipients[recipientId];
    if (!recipient) throw new Error(`Recipient not found: ${recipientId}`);
    if (recipient.recoveryBlocked || batch.cancellationRequested || recipient.state !== 'RETRY_WAIT') return batch;
    if (!recipient.nextRetryAt || new Date(recipient.nextRetryAt).getTime() > this.clock()) return batch;
    if (recipient.attempts.length >= MAX_ATTEMPTS) {
      recipient.state = 'FAILED_TERMINAL';
      recipient.nextRetryAt = null;
      await this.#save();
      return batch;
    }
    recipient.state = 'PENDING';
    recipient.nextRetryAt = null;
    await this.#save();
    await this.#processRecipient(batch, recipient);
    await this.#updateAggregate(batch);
    return batch;
  }

  /** @param {string|undefined} batchId @returns {Promise<DispatchBatch>} */
  async cancelBatch(batchId) {
    await this.ready;
    const batch = this.#batch(batchId);
    if (['COMPLETED', 'PARTIAL_FAILURE', 'FAILED', 'CANCELLED'].includes(batch.state)) return batch;
    batch.cancellationRequested = true;
    for (const recipient of Object.values(batch.recipients)) {
      if (['PENDING', 'RETRY_WAIT'].includes(recipient.state)) recipient.state = 'CANCELLED';
    }
    if (['DRAFT', 'CONFIRMED', 'QUEUED'].includes(batch.state)) {
      batch.state = 'CANCELLED';
      batch.cancellationOutcome = 'CANCELLED_WITHOUT_EFFECT';
    } else {
      batch.state = this.#aggregate(batch);
      if (Object.values(batch.recipients).some((recipient) => recipient.state === 'SUCCESS')) batch.cancellationOutcome = 'CANCELLED_AFTER_PARTIAL_EFFECT';
    }
    batch.causationId = newId();
    batch.updatedAt = nowIso(this.clock);
    await this.#save();
    return batch;
  }

  /** @param {DispatchBatch} batch @returns {Promise<void>} */
  async #updateAggregate(batch) {
    const next = this.#aggregate(batch);
    if (next === 'PROCESSING' && batch.state === 'CONFIRMED') batch.state = 'QUEUED';
    else if (!['CONFIRMED', 'QUEUED', 'DRAFT'].includes(next)) batch.state = next;
    batch.updatedAt = nowIso(this.clock);
    await this.#save();
  }

  /** @returns {Promise<void>} */
  async #recoverAfterRestart() {
    const batches = /** @type {Record<string, DispatchBatch>} */ (this.state.batches);
    for (const batch of Object.values(batches)) {
      if (batch.state === 'PROCESSING') {
        for (const recipient of Object.values(batch.recipients)) {
          const currentAttempt = recipient.attempts[recipient.attempts.length - 1];
          if (recipient.state === 'PROCESSING' && currentAttempt && currentAttempt.phase === 'REQUEST_ATTEMPTED') {
            currentAttempt.phase = 'UNKNOWN';
            currentAttempt.completedAt = nowIso(this.clock);
            currentAttempt.effectStatus = 'INDETERMINATE_EFFECT_UNRESOLVED';
            currentAttempt.recovery = 'RESTART_INTERRUPTED';
            recipient.recoveryBlocked = true;
            recipient.lastError = 'External effect may have crossed the boundary before restart; reconciliation is unavailable.';
            batch.recoveryRequired = true;
          }
        }
      }
      for (const recipient of Object.values(batch.recipients)) {
        if (recipient.state === 'RETRY_WAIT' && recipient.nextRetryAt && !recipient.recoveryBlocked) {
          const delay = Math.max(0, new Date(recipient.nextRetryAt).getTime() - this.clock());
          this.#scheduleRetry(batch.batchId, recipient.identity, delay);
        }
      }
    }
  }

  /** @param {string|undefined} batchId @returns {Promise<DispatchBatch>} */
  async getBatch(batchId) {
    await this.ready;
    return this.#batch(batchId);
  }

  /** @returns {Promise<DispatchBatch[]>} */
  async listBatches() {
    await this.ready;
    return Object.values(this.state.batches);
  }
}

/** @param {RuntimeOptions} [options] @returns {BatchDispatchRuntime} */
export function createBatchDispatchRuntime(options = {}) {
  return new BatchDispatchRuntime(options);
}

/** @param {unknown} value @returns {value is DispatchPreview} */
export function isDispatchPreview(value) {
  if (!value || typeof value !== 'object') return false;
  const candidate = /** @type {{status?:unknown,fingerprint?:unknown,recipients?:unknown}} */ (value);
  return candidate.status === 'PREVIEW' && typeof candidate.fingerprint === 'string' && Array.isArray(candidate.recipients) && candidate.recipients.every((recipient) => {
    if (!recipient || typeof recipient !== 'object') return false;
    const entry = /** @type {{normalizedNumber?:unknown,context?:unknown,contact?:unknown}} */ (recipient);
    return typeof entry.normalizedNumber === 'string' && typeof entry.context === 'string' && (entry.contact === undefined || entry.contact === null || typeof entry.contact === 'string');
  });
}
