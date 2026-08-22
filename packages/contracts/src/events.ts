export const DOMAIN_EVENTS = [
  "order.created",
  "order.confirmed",
  "order.status_changed",
  "order.cancelled"
] as const;

export type DomainEventType = typeof DOMAIN_EVENTS[number];

export interface DomainEvent<TPayload = unknown> {
  event_id: string;
  event_type: DomainEventType;
  store_id: string;
  aggregate_id: string;
  occurred_at_utc: string;
  payload: TPayload;
}
