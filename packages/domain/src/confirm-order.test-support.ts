import type { OrderDomainError } from "./order-errors.js";
import { orderDomainError, ORDER_DOMAIN_ERRORS } from "./order-errors.js";

export function concurrencyConflictForTest(): OrderDomainError {
  return orderDomainError(ORDER_DOMAIN_ERRORS.CONCURRENCY_CONFLICT);
}
