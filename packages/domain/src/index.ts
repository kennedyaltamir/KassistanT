export type OrderStatus = "DRAFT" | "CONFIRMED" | "IN_PRODUCTION" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
export type ConversationLifecycle = "OPEN" | "CLOSED";
export type ConversationOwnership = "AI" | "HUMAN";
export type AIState = "ACTIVE" | "PAUSED" | "UNAVAILABLE";
export type MessageLifecycle = "RECEIVED" | "QUEUED" | "PROCESSING" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "REJECTED";

export interface Money {
  amount_cents: number;
  currency: "BRL";
}
