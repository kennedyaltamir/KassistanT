// P0-001B — outbound runtime boundary.
// Persistence is accessed only through the approved semantic port.

export type OutboxState =
  | "PENDING"
  | "PROCESSING"
  | "DELIVERED"
  | "RETRY_WAIT"
  | "FAILED_TERMINAL";

export interface OutboundEventEnvelope {
  idempotencyKey: string;
  eventType: string;
  payloadRef?: string;
  correlationId?: string;
  causationId?: string;
}

export interface OutboundPersistencePort {
  stageOutbound(event: OutboundEventEnvelope): Promise<{ state: "PENDING" }>;
  markProcessing(idempotencyKey: string): Promise<void>;
  markDelivered(idempotencyKey: string): Promise<void>;
  recordRetry(idempotencyKey: string, attempt: number): Promise<void>;
  recordFailure(idempotencyKey: string, terminal: boolean): Promise<void>;
}

export class P0_001BOutboxRuntime {
  public constructor(private readonly persistence: OutboundPersistencePort) {}

  public async stage(event: OutboundEventEnvelope) {
    if (!event.idempotencyKey || !event.eventType) {
      throw new Error("INVALID_OUTBOUND_IDENTITY");
    }

    return this.persistence.stageOutbound(event);
  }

  public async process(idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new Error("INVALID_OUTBOUND_IDENTITY");
    }

    return this.persistence.markProcessing(idempotencyKey);
  }

  public deliver(idempotencyKey: string) {
    return this.persistence.markDelivered(idempotencyKey);
  }

  public retry(idempotencyKey: string, attempt: number) {
    if (!Number.isInteger(attempt) || attempt < 1) {
      throw new Error("INVALID_ATTEMPT");
    }

    return this.persistence.recordRetry(idempotencyKey, attempt);
  }

  public fail(idempotencyKey: string, terminal: boolean) {
    return this.persistence.recordFailure(idempotencyKey, terminal);
  }
}
