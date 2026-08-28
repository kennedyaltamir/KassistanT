import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { BatchDispatchRuntime } from './batch-dispatch.mjs';
import { sendImage as defaultSendImage, sendText as defaultSendText } from './whatsapp.mjs';

export const CAMPAIGN_VERSION = 1;
export const CAPTION_POLICIES = Object.freeze([
  'NO_IMAGE',
  'IMAGE_WITHOUT_CAPTION',
  'IMAGE_WITH_MESSAGE_CAPTION',
]);

const SAVE_QUEUES = new Map();

function defaultDataRoot() {
  if (process.env.KASSIST_DB_PATH) return path.dirname(process.env.KASSIST_DB_PATH);
  const base = process.env.APPDATA || process.env.XDG_DATA_HOME || path.join(os.homedir(), '.config');
  return path.join(base, 'KassisT');
}
function nowIso(clock) { return new Date(clock()).toISOString(); }
function newId() { return crypto.randomUUID(); }
function assertString(value, name) { const result = String(value ?? '').trim(); if (!result) throw new Error(`${name} is required`); return result; }

function canonicalRecipients(recipients) {
  if (!Array.isArray(recipients) || recipients.length === 0) throw new Error('At least one recipient is required');
  const seen = new Set();
  return recipients.map((entry, index) => {
    if (!entry || typeof entry !== 'object') throw new Error(`Recipient ${index + 1} is invalid`);
    const normalizedNumber = assertString(entry.normalizedNumber ?? entry.phone ?? entry.number, `recipient ${index + 1}`);
    if (seen.has(normalizedNumber)) throw new Error(`Duplicate recipient: ${normalizedNumber}`);
    seen.add(normalizedNumber);
    return { normalizedNumber, contact: entry.contact == null ? null : String(entry.contact).trim() || null, context: String(entry.context ?? '').trim() };
  });
}

function canonicalMessages(values) {
  if (values == null) return [];
  if (!Array.isArray(values)) throw new Error('message_variants must be an array');
  return values.map((entry, index) => {
    if (!entry || typeof entry !== 'object') throw new Error(`message_variants[${index}] is invalid`);
    const text = String(entry.text ?? '').trim();
    if (!text) throw new Error(`message_variants[${index}] must contain non-empty text`);
    return { id: assertString(entry.id ?? `message-${index + 1}`, `message_variants[${index}].id`), text, order: Number.isInteger(entry.order) ? entry.order : index, active: entry.active !== false };
  }).filter((entry) => entry.active);
}

function canonicalImages(values) {
  if (values == null) return [];
  if (!Array.isArray(values)) throw new Error('image_variants must be an array');
  return values.map((entry, index) => {
    if (!entry || typeof entry !== 'object') throw new Error(`image_variants[${index}] is invalid`);
    const reference = assertString(entry.reference, `image_variants[${index}].reference`);
    const filename = String(entry.filename ?? path.basename(reference)).trim();
    const mimeType = String(entry.mimeType ?? '').trim().toLowerCase();
    if (mimeType && !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) throw new Error(`Unsupported image MIME type: ${mimeType}`);
    return { id: assertString(entry.id ?? `image-${index + 1}`, `image_variants[${index}].id`), reference, filename, mimeType, size: Number.isFinite(Number(entry.size)) ? Number(entry.size) : null, metadata: entry.metadata && typeof entry.metadata === 'object' ? structuredClone(entry.metadata) : {} };
  });
}

function canonicalPacing(value) {
  const input = value && typeof value === 'object' ? value : {};
  const minimumMs = Number.isFinite(Number(input.minimumMs)) ? Math.trunc(Number(input.minimumMs)) : Number.isFinite(Number(input.minimum)) ? Math.trunc(Number(input.minimum) * 1000) : 0;
  const maximumMs = Number.isFinite(Number(input.maximumMs)) ? Math.trunc(Number(input.maximumMs)) : Number.isFinite(Number(input.maximum)) ? Math.trunc(Number(input.maximum) * 1000) : minimumMs;
  if (minimumMs < 0) throw new Error('pacing minimum must be >= 0ms');
  if (maximumMs < minimumMs) throw new Error('pacing maximum must be >= minimum');
  return Object.freeze({ minimumMs, maximumMs });
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

export function fingerprintCampaign(snapshot) {
  const canonical = { version: snapshot.version, source: snapshot.source, recipients: snapshot.recipients, objective: snapshot.objective, messageVariants: snapshot.messageVariants, imageVariants: snapshot.imageVariants, captionPolicy: snapshot.captionPolicy, pacingPolicy: snapshot.pacingPolicy, businessContextReferences: snapshot.businessContextReferences };
  return crypto.createHash('sha256').update(stableJson(canonical), 'utf8').digest('hex');
}

function selectVariantIndex(recipientIndex, length) {
  if (length <= 1) return 0;
  return recipientIndex % length;
}
function selectDelay(seed, minimumMs, maximumMs) {
  if (maximumMs <= minimumMs) return minimumMs;
  const digest = crypto.createHash('sha256').update(seed, 'utf8').digest();
  const span = maximumMs - minimumMs + 1;
  return minimumMs + (digest.readUInt32BE(0) % span);
}

function normalizeCampaignInput(input = {}) {
  const recipients = canonicalRecipients(input.recipients);
  const objective = assertString(input.objective, 'campaign objective');
  const messageVariants = canonicalMessages(input.message_variants ?? input.messageVariants);
  const imageVariants = canonicalImages(input.image_variants ?? input.imageVariants);
  const captionPolicy = String(input.caption_policy ?? input.captionPolicy ?? 'NO_IMAGE').trim().toUpperCase();
  if (!CAPTION_POLICIES.includes(captionPolicy)) throw new Error(`Unsupported caption policy: ${captionPolicy}`);
  const pacingPolicy = canonicalPacing(input.pacing_policy ?? input.pacingPolicy);
  if (captionPolicy === 'NO_IMAGE' && messageVariants.length === 0) throw new Error('At least one valid message variant is required when no image is used');
  if (captionPolicy !== 'NO_IMAGE' && imageVariants.length === 0) throw new Error('At least one image variant is required when image dispatch is enabled');
  if (captionPolicy === 'IMAGE_WITH_MESSAGE_CAPTION' && messageVariants.length === 0) throw new Error('A message variant is required for image captions');
  return { version: CAMPAIGN_VERSION, source: input.source && typeof input.source === 'object' ? structuredClone(input.source) : { type: 'manual' }, recipients, objective, messageVariants, imageVariants, captionPolicy, pacingPolicy, businessContextReferences: Array.isArray(input.business_context_references) ? input.business_context_references.map((value) => String(value)) : Array.isArray(input.businessContextReferences) ? input.businessContextReferences.map((value) => String(value)) : [] };
}
export function validateCampaign(input) { const snapshot = normalizeCampaignInput(input); return Object.freeze({ snapshot, fingerprint: fingerprintCampaign(snapshot) }); }
function defaultJournalPath() { return process.env.KASSIST_CAMPAIGN_STATE_PATH ?? path.join(defaultDataRoot(), 'dispatch', 'campaigns.json'); }
function defaultBatchRoot() { return process.env.KASSIST_CAMPAIGN_BATCH_ROOT ?? path.join(defaultDataRoot(), 'dispatch', 'campaign-batches'); }

export class CampaignDispatchRuntime {
  constructor(options = {}) {
    this.statePath = options.statePath ?? defaultJournalPath();
    this.batchRoot = options.batchRoot ?? defaultBatchRoot();
    this.clock = options.clock ?? (() => Date.now());
    this.sleepImpl = options.sleepImpl ?? ((delay) => new Promise((resolve) => setTimeout(resolve, delay)));
    this.sendText = options.sendText ?? defaultSendText;
    this.sendImage = options.sendImage ?? defaultSendImage;
    this.setTimeoutImpl = options.setTimeoutImpl;
    this.clearTimeoutImpl = options.clearTimeoutImpl;
    this.state = { version: 1, campaigns: {} };
    this.runtimes = new Map();
    this.ready = this.#load();
  }
  async #load() { try { const raw = await fs.readFile(this.statePath, 'utf8'); const parsed = JSON.parse(raw); if (!parsed || parsed.version !== 1 || !parsed.campaigns || typeof parsed.campaigns !== 'object') throw new Error('invalid campaign journal'); this.state = parsed; } catch (error) { if (!(error instanceof Error) || error.code !== 'ENOENT') console.error('[KassisT Campaign Dispatch] failed to load campaign journal:', error instanceof Error ? error.message : error); this.state = { version: 1, campaigns: {} }; } }
  #save() { const write = async () => { await fs.mkdir(path.dirname(this.statePath), { recursive: true }); await fs.mkdir(this.batchRoot, { recursive: true }); const tempPath = `${this.statePath}.tmp`; await fs.writeFile(tempPath, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8'); await fs.rename(tempPath, this.statePath); }; const previous = SAVE_QUEUES.get(this.statePath) ?? Promise.resolve(); const next = previous.then(write, write); SAVE_QUEUES.set(this.statePath, next.catch(() => {})); return next; }
  #record(batchId) { const record = this.state.campaigns[batchId]; if (!record) throw new Error(`Campaign not found: ${batchId}`); return record; }
  #runtime(record) { const existing = this.runtimes.get(record.batchId); if (existing) return existing; const runtime = new BatchDispatchRuntime({ statePath: path.join(this.batchRoot, `${record.batchId}.json`), clock: this.clock, ...(this.setTimeoutImpl ? { setTimeoutImpl: this.setTimeoutImpl } : {}), ...(this.clearTimeoutImpl ? { clearTimeoutImpl: this.clearTimeoutImpl } : {}), sendText: (to) => this.#executeEffect(record, to) }); this.runtimes.set(record.batchId, runtime); return runtime; }
  #previousEffectStart(record, recipientIdentity) { const recipients = record.snapshot.recipients; const index = recipients.findIndex((recipient) => recipient.normalizedNumber === recipientIdentity); for (let current = index - 1; current >= 0; current -= 1) { const previous = record.selections[recipients[current].normalizedNumber]; const executedAt = previous?.effectAttempts?.[0]?.executedAt; if (executedAt) return new Date(executedAt).getTime(); } return null; }
  async #waitForSchedule(selection) { const scheduledAt = new Date(selection.scheduledAt).getTime(); let remaining = scheduledAt - this.clock(); while (remaining > 0) { await this.sleepImpl(remaining); remaining = scheduledAt - this.clock(); } }
  async #executeEffect(record, to) { const selection = record.selections[to]; if (!selection) throw new Error(`No persisted effect selection for recipient ${to}`); if (selection.effectAttempts.length === 0) { const previousStartedAt = this.#previousEffectStart(record, to); const scheduledAtMs = previousStartedAt == null ? this.clock() : Math.max(this.clock(), previousStartedAt + selection.scheduledDelayMs); selection.scheduledAt = new Date(scheduledAtMs).toISOString(); await this.#waitForSchedule(selection); selection.effectAttempts.push({ attempt: 1, executedAt: nowIso(this.clock) }); await this.#save(); } if (selection.effect.type === 'TEXT') return await this.sendText(to, selection.effect.text); return await this.sendImage(to, selection.effect.imageReference, selection.effect.caption ?? null); }
  #selectForRecipient(batchId, recipient, snapshot, previousScheduledAt, recipientIndex) { const messagePool = snapshot.messageVariants; const messageVariant = messagePool.length ? messagePool[selectVariantIndex(recipientIndex, messagePool.length)] : null; const imageVariant = snapshot.imageVariants.length ? snapshot.imageVariants[selectVariantIndex(recipientIndex, snapshot.imageVariants.length)] : null; let effect; if (snapshot.captionPolicy === 'NO_IMAGE') effect = { type: 'TEXT', messageVariantId: messageVariant.id, text: messageVariant.text }; else if (snapshot.captionPolicy === 'IMAGE_WITHOUT_CAPTION') effect = { type: 'IMAGE', imageVariantId: imageVariant.id, imageReference: imageVariant.reference, caption: null }; else effect = { type: 'IMAGE', imageVariantId: imageVariant.id, imageReference: imageVariant.reference, caption: messageVariant.text, messageVariantId: messageVariant.id }; const scheduledDelayMs = previousScheduledAt == null ? 0 : selectDelay(`${batchId}:${recipient.normalizedNumber}:pacing`, snapshot.pacingPolicy.minimumMs, snapshot.pacingPolicy.maximumMs); const scheduledAtMs = (previousScheduledAt == null ? this.clock() : previousScheduledAt) + scheduledDelayMs; return { messageVariantId: messageVariant?.id ?? null, imageVariantId: imageVariant?.id ?? null, policy: snapshot.captionPolicy, effect, scheduledDelayMs, scheduledAt: new Date(scheduledAtMs).toISOString(), effectAttempts: [] }; }
  async preview(input) { await this.ready; const { snapshot, fingerprint } = validateCampaign(input); return { status: 'PREVIEW', fingerprint, sourceName: snapshot.source?.name ?? snapshot.source?.type ?? 'campaign', recipients: snapshot.recipients, recipientCount: snapshot.recipients.length, campaign: snapshot, campaignVersion: CAMPAIGN_VERSION }; }
  async createDraft(preview, options = {}) {
    await this.ready;
    if (!preview || preview.status !== 'PREVIEW') throw new Error('A campaign PREVIEW is required');
    const fingerprint = assertString(preview.fingerprint, 'fingerprint');
    const previewCampaign = preview.campaign;
    if (!previewCampaign || typeof previewCampaign !== 'object') throw new Error('PREVIEW campaign snapshot is required');
    const snapshot = structuredClone(previewCampaign);
    if (fingerprintCampaign(snapshot) !== fingerprint) throw new Error('Campaign fingerprint mismatch');
    const batchId = assertString(options.batchId ?? newId(), 'batchId');
    const correlationId = assertString(options.correlationId ?? newId(), 'correlationId');
    const createdAt = options.createdAt ?? nowIso(this.clock);
    const runtimePath = path.join(this.batchRoot, `${batchId}.json`);
    const record = { campaignId: batchId, batchId, version: CAMPAIGN_VERSION, lifecycle: 'CREATING', createdAt, updatedAt: createdAt, fingerprint, snapshot, selections: {}, batchStatePath: runtimePath };
    this.state.campaigns[batchId] = record;
    await this.#save();
    let scheduledAt = null;
    for (const [recipientIndex, recipient] of snapshot.recipients.entries()) { const selection = this.#selectForRecipient(batchId, recipient, snapshot, scheduledAt == null ? null : new Date(scheduledAt).getTime(), recipientIndex); record.selections[recipient.normalizedNumber] = selection; scheduledAt = selection.scheduledAt; }
    record.lifecycle = 'DRAFT'; record.updatedAt = nowIso(this.clock); await this.#save();
    const runtime = this.#runtime(record); await runtime.ready;
    const batch = await runtime.createDraft({ status: 'PREVIEW', fingerprint, sourceName: snapshot.source?.name ?? snapshot.source?.type ?? 'campaign', recipients: snapshot.recipients }, { batchId, correlationId, createdAt });
    record.lifecycle = batch.state; record.updatedAt = nowIso(this.clock); await this.#save();
    return this.#compose(record, batch);
  }
  async #compose(record, batch) { return { campaign: structuredClone(record.snapshot), campaignId: record.campaignId, batch, fingerprint: record.fingerprint, selections: structuredClone(record.selections) }; }
  async confirmCampaign(batchId, input) { await this.ready; const record = this.#record(assertString(batchId, 'batchId')); const runtime = this.#runtime(record); const batch = await runtime.confirmBatch(record.batchId, input); record.lifecycle = batch.state; record.updatedAt = nowIso(this.clock); await this.#save(); return this.#compose(record, batch); }
  async queueCampaign(batchId, options = {}) { await this.ready; const record = this.#record(assertString(batchId, 'batchId')); if (!['CONFIRMED'].includes(record.lifecycle)) throw new Error(`Campaign cannot be queued from state ${record.lifecycle}`); const runtime = this.#runtime(record); const batch = await runtime.queueBatch(record.batchId, options); record.lifecycle = batch.state; record.updatedAt = nowIso(this.clock); await this.#save(); return this.#compose(record, batch); }
  async cancelCampaign(batchId) { await this.ready; const record = this.#record(assertString(batchId, 'batchId')); const runtime = this.#runtime(record); const batch = await runtime.cancelBatch(record.batchId); record.lifecycle = batch.state; record.updatedAt = nowIso(this.clock); await this.#save(); return this.#compose(record, batch); }
  async getCampaign(batchId) { await this.ready; const record = this.#record(assertString(batchId, 'batchId')); const runtime = this.#runtime(record); const batch = await runtime.getBatch(record.batchId); record.lifecycle = batch.state; return this.#compose(record, batch); }
  async listCampaigns() { await this.ready; const result = []; for (const record of Object.values(this.state.campaigns)) { const runtime = this.#runtime(record); const batch = await runtime.getBatch(record.batchId); record.lifecycle = batch.state; result.push(await this.#compose(record, batch)); } return result; }
}
export function createCampaignDispatchRuntime(options = {}) { return new CampaignDispatchRuntime(options); }
