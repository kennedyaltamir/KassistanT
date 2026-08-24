export const ORDER_DOMAIN_ERRORS = {
  INVALID_ORDER_STATE: "INVALID_ORDER_STATE",
  CONFIRMATION_DATA_INVALID: "CONFIRMATION_DATA_INVALID",
  DUPLICATE_CONFIRMATION: "DUPLICATE_CONFIRMATION",
  CONCURRENCY_CONFLICT: "CONCURRENCY_CONFLICT"
} as const;

export type OrderDomainErrorCode =
  (typeof ORDER_DOMAIN_ERRORS)[keyof typeof ORDER_DOMAIN_ERRORS];

export interface OrderDomainError {
  code: OrderDomainErrorCode;
}

export function orderDomainError(code: OrderDomainErrorCode): OrderDomainError {
  return { code };
}
