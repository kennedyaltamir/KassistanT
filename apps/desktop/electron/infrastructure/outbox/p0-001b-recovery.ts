import type { OutboundPersistencePort } from "./p0-001b-runtime";

export interface RetryPolicy {
  maxAttempts: number;
}

export interface DeliveryAttempt {
  idempotencyKey: string;
  attempt: number;
}

export class P0_001BRecovery {
  public constructor(
    private readonly persistence: OutboundPersistencePort,
    private readonly policy: RetryPolicy,
  ) {}

  public async recover(attempt: DeliveryAttempt, retryable: boolean) {
    if (!Number.isInteger(attempt.attempt) || attempt.attempt < 1) {
      throw new Error("INVALID_ATTEMPT");
    }

    if (!retryable || attempt.attempt >= this.policy.maxAttempts) {
      await this.persistence.recordFailure(
        attempt.idempotencyKey,
        true,
      );
      return "FAILED_TERMINAL" as const;
    }

    await this.persistence.recordRetry(
      attempt.idempotencyKey,
      attempt.attempt,
    );
    return "RETRY_WAIT" as const;
  }
}
