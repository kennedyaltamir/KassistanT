import { generateUuidV7 } from "./uuidv7.js";
import { assertUtcTimestamp, utcNow } from "./time.js";
import { Order } from "./order.js";
import {
  ORDER_DOMAIN_ERRORS,
  orderDomainError,
  type OrderDomainError
} from "./order-errors.js";

export interface ConfirmationData {
  readonly final_summary: string;
  readonly confirmed: boolean;
}

export interface ConfirmOrderCommand<TActorContext extends object = object> {
  readonly confirmation: ConfirmationData;
  readonly actor_context: TActorContext;
  readonly concurrency_conflict?: boolean;
}

export interface OrderConfirmedEvent {
  readonly event_id: string;
  readonly event_type: "order.confirmed";
  readonly store_id: string;
  readonly aggregate_id: string;
  readonly occurred_at_utc: string;
  readonly payload: {
    readonly order_id: string;
  };
}

export type ConfirmOrderSuccess<TActorContext extends object> = {
  readonly ok: true;
  readonly order: Order;
  readonly event: OrderConfirmedEvent;
  readonly actor_context: TActorContext;
};

export type ConfirmOrderFailure<TActorContext extends object> = {
  readonly ok: false;
  readonly error: OrderDomainError;
  readonly actor_context: TActorContext;
};

export type ConfirmOrderResult<TActorContext extends object = object> =
  | ConfirmOrderSuccess<TActorContext>
  | ConfirmOrderFailure<TActorContext>;

export function confirmOrder<TActorContext extends object>(
  order: Order,
  command: ConfirmOrderCommand<TActorContext>
): ConfirmOrderResult<TActorContext> {
  if (command.concurrency_conflict === true) {
    return failure(ORDER_DOMAIN_ERRORS.CONCURRENCY_CONFLICT, command.actor_context);
  }

  if (order.status === "CONFIRMED") {
    return failure(ORDER_DOMAIN_ERRORS.DUPLICATE_CONFIRMATION, command.actor_context);
  }

  if (order.status !== "DRAFT") {
    return failure(ORDER_DOMAIN_ERRORS.INVALID_ORDER_STATE, command.actor_context);
  }

  if (!isValidConfirmationData(command.confirmation)) {
    return failure(ORDER_DOMAIN_ERRORS.CONFIRMATION_DATA_INVALID, command.actor_context);
  }

  try {
    const confirmedOrder = order.confirm();
    const occurredAtUtc = utcNow();
    assertUtcTimestamp(occurredAtUtc);

    return {
      ok: true,
      order: confirmedOrder,
      event: {
        event_id: generateUuidV7(),
        event_type: "order.confirmed",
        store_id: confirmedOrder.storeId,
        aggregate_id: confirmedOrder.id,
        occurred_at_utc: occurredAtUtc,
        payload: {
          order_id: confirmedOrder.id
        }
      },
      actor_context: command.actor_context
    };
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ORDER_STATE") {
      return failure(ORDER_DOMAIN_ERRORS.INVALID_ORDER_STATE, command.actor_context);
    }
    throw error;
  }
}

function isValidConfirmationData(data: ConfirmationData): boolean {
  return data.confirmed === true && data.final_summary.trim().length > 0;
}

function failure<TActorContext extends object>(
  code: OrderDomainError["code"],
  actorContext: TActorContext
): ConfirmOrderFailure<TActorContext> {
  return {
    ok: false,
    error: orderDomainError(code),
    actor_context: actorContext
  };
}
