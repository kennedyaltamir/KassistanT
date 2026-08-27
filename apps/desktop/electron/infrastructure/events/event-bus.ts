import type { DomainEvent, DomainEventType } from "../../../../../packages/contracts/src/events.js";

export type EventHandler = (event: DomainEvent) => void | Promise<void>;

export type Subscription = Readonly<{
  id: string;
  eventType: DomainEventType;
}>;

export type DispatchStatus = "success" | "partial_failure" | "complete_failure";

export type DispatchFailure = Readonly<{
  subscriptionId: string;
  error: unknown;
}>;

export type DispatchResult = Readonly<{
  status: DispatchStatus;
  eventId: string;
  invokedSubscriptions: number;
  failures: readonly DispatchFailure[];
}>;

type Registration = {
  subscription: Subscription;
  handler: EventHandler;
  active: boolean;
};

export class EventBus {
  private readonly registrations = new Map<string, Registration>();
  private nextSubscriptionId = 0;

  subscribe(eventType: DomainEventType, handler: EventHandler): Subscription {
    if (typeof handler !== "function") {
      throw new TypeError("EventBus subscriber handler must be a function");
    }

    const subscription: Subscription = Object.freeze({
      id: `subscription-${++this.nextSubscriptionId}`,
      eventType
    });

    this.registrations.set(subscription.id, {
      subscription,
      handler,
      active: true
    });

    return subscription;
  }

  unsubscribe(subscription: Subscription): void {
    const registration = this.registrations.get(subscription.id);
    if (!registration) return;

    registration.active = false;
    this.registrations.delete(subscription.id);
  }

  async publish(event: DomainEvent): Promise<DispatchResult> {
    const snapshot = [...this.registrations.values()]
      .filter((registration) => registration.active && registration.subscription.eventType === event.event_type)
      .map((registration) => registration);

    const failures: DispatchFailure[] = [];
    let invokedSubscriptions = 0;

    for (const registration of snapshot) {
      invokedSubscriptions += 1;
      try {
        await registration.handler(event);
      } catch (error) {
        failures.push({
          subscriptionId: registration.subscription.id,
          error
        });
      }
    }

    let status: DispatchStatus = "success";
    if (failures.length === snapshot.length && failures.length > 0) {
      status = "complete_failure";
    } else if (failures.length > 0) {
      status = "partial_failure";
    }

    const result: DispatchResult = Object.freeze({
      status,
      eventId: event.event_id,
      invokedSubscriptions,
      failures: Object.freeze(failures)
    });

    if (failures.length > 0) {
      this.reportFailures(event, result);
    }

    return result;
  }

  private reportFailures(event: DomainEvent, result: DispatchResult): void {
    console.error("EventBus subscriber failure", {
      event_id: event.event_id,
      event_type: event.event_type,
      aggregate_id: event.aggregate_id,
      status: result.status,
      failures: result.failures.map((failure) => ({
        subscription_id: failure.subscriptionId,
        error: failure.error
      }))
    });
  }
}
