export type InboxIdentity = {
  provider: string;
  externalEventId: string;
};

export type CorrelationMetadata = {
  correlationId?: string;
  causationId?: string;
};

export type InboxEvent<TPayload = unknown> = {
  identity: InboxIdentity;
  payload: TPayload;
  correlation?: CorrelationMetadata;
};

export type OutboxState =
  | "PENDING"
  | "PROCESSING"
  | "DELIVERED"
  | "RETRY_WAIT"
  | "FAILED_TERMINAL";

export type OutboxRecord<TPayload = unknown> = {
  idempotencyKey: string;
  payload: TPayload;
  state: OutboxState;
  attemptCount: number;
  nextAttemptAt?: string;
  lastFailure?: string;
  correlation?: CorrelationMetadata;
};

export type InboundAcceptance<TPayload = unknown> =
  | { accepted: true; duplicate: false; event: InboxEvent<TPayload> }
  | { accepted: false; duplicate: true; event: InboxEvent<TPayload> };

export type RetryDecision = {
  retry: boolean;
  nextAttemptAt?: string;
  failureReason?: string;
};

export interface InboxOutboxPersistence {
  acceptInbound<TPayload>(event: InboxEvent<TPayload>): Promise<InboundAcceptance<TPayload>>;
  retrievePendingInbound<TPayload>(): Promise<InboxEvent<TPayload>[]>;
  stageOutbound<TPayload>(record: OutboxRecord<TPayload>): Promise<OutboxRecord<TPayload>>;
  getOutbound(idempotencyKey: string): Promise<OutboxRecord | null>;
  listPendingOutbound(): Promise<OutboxRecord[]>;
  markOutboundProcessing(idempotencyKey: string): Promise<OutboxRecord>;
  markOutboundDelivered(idempotencyKey: string): Promise<OutboxRecord>;
  recordOutboundRetry(idempotencyKey: string, decision: RetryDecision): Promise<OutboxRecord>;
  recordOutboundFailure(idempotencyKey: string, reason: string): Promise<OutboxRecord>;
}

export type RetryPolicy = {
  maxAttempts: number;
  nextAttemptAt: (attemptCount: number, now: Date) => string;
};

export class InboxOutboxRuntime {
  constructor(
    private readonly persistence: InboxOutboxPersistence,
    private readonly retryPolicy: RetryPolicy,
  ) {
    if (!Number.isInteger(retryPolicy.maxAttempts) || retryPolicy.maxAttempts < 1) {
      throw new Error("maxAttempts must be a positive integer");
    }
  }

  async acceptInbound<TPayload>(event: InboxEvent<TPayload>): Promise<InboundAcceptance<TPayload>> {
    return this.persistence.acceptInbound(event);
  }

  async recoverPendingInbound<TPayload>(): Promise<InboxEvent<TPayload>[]> {
    return this.persistence.retrievePendingInbound<TPayload>();
  }

  async stageOutbound<TPayload>(record: Omit<OutboxRecord<TPayload>, "state" | "attemptCount">): Promise<OutboxRecord<TPayload>> {
    return this.persistence.stageOutbound({
      ...record,
      state: "PENDING",
      attemptCount: 0,
    });
  }

  async markProcessing(idempotencyKey: string): Promise<OutboxRecord> {
    return this.persistence.markOutboundProcessing(idempotencyKey);
  }

  async markDelivered(idempotencyKey: string): Promise<OutboxRecord> {
    return this.persistence.markOutboundDelivered(idempotencyKey);
  }

  async recordRetry(idempotencyKey: string, reason: string, now = new Date()): Promise<OutboxRecord> {
    const current = await this.requireOutbound(idempotencyKey);
    const nextAttemptCount = current.attemptCount + 1;

    if (nextAttemptCount >= this.retryPolicy.maxAttempts) {
      return this.persistence.recordOutboundFailure(idempotencyKey, reason);
    }

    return this.persistence.recordOutboundRetry(idempotencyKey, {
      retry: true,
      nextAttemptAt: this.retryPolicy.nextAttemptAt(nextAttemptCount, now),
      failureReason: reason,
    });
  }

  async recordTerminalFailure(idempotencyKey: string, reason: string): Promise<OutboxRecord> {
    return this.persistence.recordOutboundFailure(idempotencyKey, reason);
  }

  async recoverPendingOutbound(): Promise<OutboxRecord[]> {
    return this.persistence.listPendingOutbound();
  }

  private async requireOutbound(idempotencyKey: string): Promise<OutboxRecord> {
    const record = await this.persistence.getOutbound(idempotencyKey);
    if (!record) {
      throw new Error(`Unknown outbound idempotency key: ${idempotencyKey}`);
    }
    return record;
  }
}
