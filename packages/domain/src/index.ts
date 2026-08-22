export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";
export type ConversationLifecycle = "OPEN" | "CLOSED";
export type ConversationOwnership = "AI" | "HUMAN";
export type AIState = "ACTIVE" | "PAUSED" | "UNAVAILABLE";
export type MessageLifecycle =
  | "RECEIVED"
  | "QUEUED"
  | "PROCESSING"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "REJECTED";

export { addMoney, assertMoneyAmount, createMoney, CURRENCY_BRL, subtractMoney } from "./money.js";
export type { Currency, Money } from "./money.js";
export type { TransactionBoundary } from "./persistence.js";
export { assertUtcTimestamp, utcNow } from "./time.js";
export { generateUuidV7, isUuidV7 } from "./uuidv7.js";
