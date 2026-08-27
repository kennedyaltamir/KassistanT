// P0-001B — placeholder controlled implementation boundary
// This file must not touch SQLite or schema internals.

export type InboxProcessingState =
  | "PENDING"
  | "PROCESSING"
  | "DELIVERED"
  | "RETRY_WAIT"
  | "FAILED_TERMINAL";

export interface InboundEventEnvelope {
  provider: string;
  externalEventId: string;
  correlationId?: string;
  causationId?: string;
  payloadRef?: string;
}

export interface InboundPersistencePort {
  acceptInbound(event: InboundEventEnvelope): Promise<
    | { kind: "accepted"; state: "PENDING" }
    | { kind: "duplicate"; state: InboxProcessingState }
  >;
}

export class P0_001BInboxRuntime {
  public constructor(private readonly persistence: InboundPersistencePort) {}

  public async acceptInbound(event: InboundEventEnvelope) {
    if (!event.provider || !event.externalEventId) {
      throw new Error("INVALID_INBOUND_IDENTITY");
    }

    return this.persistence.acceptInbound(event);
  }
}
