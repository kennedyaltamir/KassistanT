export type InboundInboxState =
  | "PENDING"
  | "PROCESSING"
  | "RETRY_WAIT"
  | "PROCESSED"
  | "FAILED_TERMINAL";

export type DomainOutboxState =
  | "PENDING"
  | "PROCESSING"
  | "DELIVERED"
  | "RETRY_WAIT"
  | "FAILED_TERMINAL";

export type FailureCode =
  | "INVALID_PAYLOAD"
  | "INVALID_IDENTITY"
  | "PROVIDER_ERROR"
  | "DEPENDENCY_UNAVAILABLE"
  | "PROCESSING_TIMEOUT"
  | "CONTRACT_VIOLATION"
  | "PERSISTENCE_ERROR"
  | "UNKNOWN_ERROR";

export type CorrelationMetadata = {
  correlationId?: string;
  causationId?: string;
};

export type InboxIdentity = {
  provider: string;
  externalEventId: string;
};

export type InboxRecord<TPayload = unknown> = {
  identity: InboxIdentity;
  payload: TPayload;
  state: InboundInboxState;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  failureCode?: FailureCode;
  failureMessage?: string;
  failedAt?: string;
  correlation?: CorrelationMetadata;
};

export type OutboxRecord<TPayload = unknown> = {
  idempotencyKey: string;
  eventId: string;
  eventType: string;
  aggregateId: string;
  payload: TPayload;
  occurredAtUtc: string;
  state: DomainOutboxState;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  failureCode?: FailureCode;
  failureMessage?: string;
  failedAt?: string;
  correlation?: CorrelationMetadata;
};

export type InboundAcceptance<TPayload = unknown> =
  | { accepted: true; duplicate: false; record: InboxRecord<TPayload> }
  | { accepted: false; duplicate: true; record: InboxRecord<TPayload> };

export type RetrySchedule =
  readonly [30_000, 60_000, 120_000, 240_000] &
  { readonly [index: number]: number };

export const INBOX_MAX_ATTEMPTS = 5;
export const OUTBOX_MAX_ATTEMPTS = 5;
export const PROCESSING_ABANDONMENT_MS = 5 * 60_000;
export const RETRY_BACKOFF_MS: RetrySchedule = [30_000, 60_000, 120_000, 240_000];

export interface InboxOutboxPersistence {
  acceptInbound<TPayload>(
    record: Omit<InboxRecord<TPayload>, "state" | "attempts" | "createdAt" | "updatedAt"> & {
      state?: InboundInboxState;
      attempts?: number;
      createdAt?: string;
      updatedAt?: string;
    },
  ): Promise<InboundAcceptance<TPayload>>;
  retrievePendingInbound<TPayload>(): Promise<InboxRecord<TPayload>[]>;
  getInbound(identity: InboxIdentity): Promise<InboxRecord | null>;
  markInboundProcessing(identity: InboxIdentity, updatedAt: string): Promise<InboxRecord>;
  recordInboundRetry(
    identity: InboxIdentity,
    nextAttemptAt: string,
    failureCode: FailureCode,
    failureMessage: string,
    updatedAt: string,
  ): Promise<InboxRecord>;
  recordInboundFailure(
    identity: InboxIdentity,
    failureCode: FailureCode,
    failureMessage: string,
    failedAt: string,
    updatedAt: string,
  ): Promise<InboxRecord>;
  markInboundProcessed(identity: InboxIdentity, processedAt: string, updatedAt: string): Promise<InboxRecord>;
  recoverAbandonedInbound(
    cutoffUpdatedAt: string,
    now: string,
    nextAttemptAt: (attempts: number, now: Date) => string | undefined,
  ): Promise<InboxRecord[]>;

  stageOutbound<TPayload>(
    record: Omit<OutboxRecord<TPayload>, "state" | "attempts" | "createdAt" | "updatedAt"> & {
      state?: DomainOutboxState;
      attempts?: number;
      createdAt?: string;
      updatedAt?: string;
    },
  ): Promise<OutboxRecord<TPayload>>;
  getOutbound(idempotencyKey: string): Promise<OutboxRecord | null>;
  listPendingOutbound(): Promise<OutboxRecord[]>;
  markOutboundProcessing(idempotencyKey: string, updatedAt: string): Promise<OutboxRecord>;
  markOutboundDelivered(idempotencyKey: string, processedAt: string, updatedAt: string): Promise<OutboxRecord>;
  recordOutboundRetry(
    idempotencyKey: string,
    nextAttemptAt: string,
    failureCode: FailureCode,
    failureMessage: string,
    updatedAt: string,
  ): Promise<OutboxRecord>;
  recordOutboundFailure(
    idempotencyKey: string,
    failureCode: FailureCode,
    failureMessage: string,
    failedAt: string,
    updatedAt: string,
  ): Promise<OutboxRecord>;
}

export class InboxOutboxRuntime {
  constructor(private readonly persistence: InboxOutboxPersistence) {}

  async acceptInbound<TPayload>(
    input: Omit<InboxRecord<TPayload>, "state" | "attempts" | "createdAt" | "updatedAt">,
    now = new Date(),
  ): Promise<InboundAcceptance<TPayload>> {
    validateInbound(input);
    const timestamp = toUtcIso(now);
    return this.persistence.acceptInbound({
      ...input,
      state: "PENDING",
      attempts: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  retrievePendingInbound<TPayload>(): Promise<InboxRecord<TPayload>[]> {
    return this.persistence.retrievePendingInbound<TPayload>();
  }

  async markInboundProcessing(identity: InboxIdentity, now = new Date()): Promise<InboxRecord> {
    validateIdentity(identity);
    const current = await this.requireInbound(identity);
    if (current.state !== "PENDING" && current.state !== "RETRY_WAIT") {
      throw new Error(`Inbound processing not allowed from ${current.state}`);
    }
    if (current.attempts >= INBOX_MAX_ATTEMPTS) {
      throw new Error("MAX_ATTEMPTS_EXHAUSTED");
    }
    return this.persistence.markInboundProcessing(identity, toUtcIso(now));
  }

  async markInboundProcessed(identity: InboxIdentity, now = new Date()): Promise<InboxRecord> {
    validateIdentity(identity);
    const current = await this.requireInbound(identity);
    assertProcessing(current.state, "Inbound processed requires PROCESSING state");
    const timestamp = toUtcIso(now);
    return this.persistence.markInboundProcessed(identity, timestamp, timestamp);
  }

  async recordInboundRetry(
    identity: InboxIdentity,
    failureCode: FailureCode,
    failureMessage: string,
    now = new Date(),
  ): Promise<InboxRecord> {
    validateIdentity(identity);
    validateFailure(failureCode, failureMessage);
    const current = await this.requireInbound(identity);
    assertProcessing(current.state, "Inbound retry requires PROCESSING state");
    const timestamp = toUtcIso(now);
    const nextAttemptAt = calculateNextAttemptAt(current.attempts, now);
    if (nextAttemptAt === undefined) {
      return this.persistence.recordInboundFailure(identity, failureCode, failureMessage, timestamp, timestamp);
    }
    return this.persistence.recordInboundRetry(identity, nextAttemptAt, failureCode, failureMessage, timestamp);
  }

  async recordInboundFailure(
    identity: InboxIdentity,
    failureCode: FailureCode,
    failureMessage: string,
    now = new Date(),
  ): Promise<InboxRecord> {
    validateIdentity(identity);
    validateFailure(failureCode, failureMessage);
    const current = await this.requireInbound(identity);
    assertProcessing(current.state, "Inbound failure requires PROCESSING state");
    const timestamp = toUtcIso(now);
    return this.persistence.recordInboundFailure(identity, failureCode, failureMessage, timestamp, timestamp);
  }

  recoverAbandonedInbound(now = new Date()): Promise<InboxRecord[]> {
    const nowIso = toUtcIso(now);
    const cutoff = toUtcIso(new Date(now.getTime() - PROCESSING_ABANDONMENT_MS));
    return this.persistence.recoverAbandonedInbound(cutoff, nowIso, (attempts, recoveryNow) =>
      calculateNextAttemptAt(attempts, recoveryNow),
    );
  }

  async stageOutbound<TPayload>(
    input: Omit<OutboxRecord<TPayload>, "state" | "attempts" | "createdAt" | "updatedAt">,
    now = new Date(),
  ): Promise<OutboxRecord<TPayload>> {
    validateOutbound(input);
    const timestamp = toUtcIso(now);
    return this.persistence.stageOutbound({
      ...input,
      state: "PENDING",
      attempts: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  retrievePendingOutbound(): Promise<OutboxRecord[]> {
    return this.persistence.listPendingOutbound();
  }

  async markOutboundProcessing(idempotencyKey: string, now = new Date()): Promise<OutboxRecord> {
    validateIdempotencyKey(idempotencyKey);
    const current = await this.requireOutbound(idempotencyKey);
    if (current.state !== "PENDING" && current.state !== "RETRY_WAIT") {
      throw new Error(`Outbound processing not allowed from ${current.state}`);
    }
    if (current.attempts >= OUTBOX_MAX_ATTEMPTS) {
      throw new Error("MAX_ATTEMPTS_EXHAUSTED");
    }
    return this.persistence.markOutboundProcessing(idempotencyKey, toUtcIso(now));
  }

  async markOutboundDelivered(idempotencyKey: string, now = new Date()): Promise<OutboxRecord> {
    validateIdempotencyKey(idempotencyKey);
    const current = await this.requireOutbound(idempotencyKey);
    if (current.state !== "PROCESSING") {
      throw new Error(`Outbound delivery requires PROCESSING state, got ${current.state}`);
    }
    const timestamp = toUtcIso(now);
    return this.persistence.markOutboundDelivered(idempotencyKey, timestamp, timestamp);
  }

  async recordOutboundRetry(
    idempotencyKey: string,
    failureCode: FailureCode,
    failureMessage: string,
    now = new Date(),
  ): Promise<OutboxRecord> {
    validateIdempotencyKey(idempotencyKey);
    validateFailure(failureCode, failureMessage);
    const current = await this.requireOutbound(idempotencyKey);
    if (current.state !== "PROCESSING") {
      throw new Error(`Outbound retry requires PROCESSING state, got ${current.state}`);
    }
    const timestamp = toUtcIso(now);
    const nextAttemptAt = calculateNextAttemptAt(current.attempts, now);
    if (nextAttemptAt === undefined) {
      return this.persistence.recordOutboundFailure(idempotencyKey, failureCode, failureMessage, timestamp, timestamp);
    }
    return this.persistence.recordOutboundRetry(idempotencyKey, nextAttemptAt, failureCode, failureMessage, timestamp);
  }

  async recordOutboundFailure(
    idempotencyKey: string,
    failureCode: FailureCode,
    failureMessage: string,
    now = new Date(),
  ): Promise<OutboxRecord> {
    validateIdempotencyKey(idempotencyKey);
    validateFailure(failureCode, failureMessage);
    const current = await this.requireOutbound(idempotencyKey);
    if (current.state !== "PROCESSING") {
      throw new Error(`Outbound failure requires PROCESSING state, got ${current.state}`);
    }
    const timestamp = toUtcIso(now);
    return this.persistence.recordOutboundFailure(idempotencyKey, failureCode, failureMessage, timestamp, timestamp);
  }

  private async requireInbound(identity: InboxIdentity): Promise<InboxRecord> {
    const record = await this.persistence.getInbound(identity);
    if (!record) throw new Error(`Unknown inbound identity: ${identity.provider}:${identity.externalEventId}`);
    return record;
  }

  private async requireOutbound(idempotencyKey: string): Promise<OutboxRecord> {
    const record = await this.persistence.getOutbound(idempotencyKey);
    if (!record) throw new Error(`Unknown outbound idempotency key: ${idempotencyKey}`);
    return record;
  }
}

function calculateNextAttemptAt(attempts: number, now: Date): string | undefined {
  if (!Number.isInteger(attempts) || attempts < 1 || attempts >= INBOX_MAX_ATTEMPTS) return undefined;
  return new Date(now.getTime() + RETRY_BACKOFF_MS[attempts - 1]).toISOString();
}

function validateInbound<TPayload>(input: Omit<InboxRecord<TPayload>, "state" | "attempts" | "createdAt" | "updatedAt">): void {
  validateIdentity(input.identity);
  if (input.failureCode !== undefined || input.failureMessage !== undefined || input.failedAt !== undefined) {
    throw new Error("INBOUND_FAILURE_METADATA_REQUIRES_FAILURE_STATE");
  }
}

function validateOutbound<TPayload>(input: Omit<OutboxRecord<TPayload>, "state" | "attempts" | "createdAt" | "updatedAt">): void {
  validateIdempotencyKey(input.idempotencyKey);
  if (input.eventId.trim().length === 0) throw new Error("event id must not be empty");
  if (input.eventType.trim().length === 0) throw new Error("event type must not be empty");
  if (input.aggregateId.trim().length === 0) throw new Error("aggregate id must not be empty");
  const occurredAt = new Date(input.occurredAtUtc);
  if (Number.isNaN(occurredAt.getTime()) || toUtcIso(occurredAt) !== input.occurredAtUtc) {
    throw new Error("occurredAtUtc must be a valid UTC timestamp");
  }
}

function validateIdentity(identity: InboxIdentity): void {
  if (identity.provider.trim().length === 0) throw new Error("provider must not be empty");
  if (identity.externalEventId.trim().length === 0) throw new Error("external event id must not be empty");
}

function validateIdempotencyKey(idempotencyKey: string): void {
  if (idempotencyKey.trim().length === 0) throw new Error("idempotency key must not be empty");
}

function validateFailure(failureCode: FailureCode, failureMessage: string): void {
  if (!FAILURE_CODES.has(failureCode)) throw new Error(`Unknown failure code: ${failureCode}`);
  if (failureMessage.trim().length === 0) throw new Error("failure message must not be empty");
}

function assertProcessing(state: InboundInboxState, message: string): void {
  if (state !== "PROCESSING") throw new Error(message);
}

const FAILURE_CODES: ReadonlySet<FailureCode> = new Set([
  "INVALID_PAYLOAD",
  "INVALID_IDENTITY",
  "PROVIDER_ERROR",
  "DEPENDENCY_UNAVAILABLE",
  "PROCESSING_TIMEOUT",
  "CONTRACT_VIOLATION",
  "PERSISTENCE_ERROR",
  "UNKNOWN_ERROR",
]);

function toUtcIso(value: Date): string {
  if (Number.isNaN(value.getTime())) throw new Error("invalid timestamp");
  return value.toISOString();
}
