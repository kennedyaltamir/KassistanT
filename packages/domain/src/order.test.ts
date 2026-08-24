import assert from "node:assert/strict";
import test from "node:test";
import { confirmOrder, type ConfirmOrderCommand } from "./confirm-order.js";
import { ORDER_DOMAIN_ERRORS } from "./order-errors.js";
import { Order, type OrderItem, type OrderItemModifier } from "./order.js";
import { createMoney } from "./money.js";
import { generateUuidV7 } from "./uuidv7.js";

const actorContext = Object.freeze({ actor_ref: "approved-context" });

function modifier(): OrderItemModifier {
  return {
    id: generateUuidV7(1_759_000_000_100),
    name: "Cheese",
    quantity: 1,
    price: createMoney(250)
  };
}

function item(): OrderItem {
  return {
    id: generateUuidV7(1_759_000_000_200),
    name: "Burger",
    quantity: 2,
    unit_price: createMoney(1500),
    modifiers: [modifier()]
  };
}

function draftOrder() {
  return Order.createDraft("store-1", [item()], createMoney(3250));
}

function command(): ConfirmOrderCommand<typeof actorContext> {
  return {
    confirmation: {
      final_summary: "Burger x2 with Cheese",
      confirmed: true
    },
    actor_context: actorContext
  };
}

test("ConfirmOrder confirms a DRAFT order and emits order.confirmed", () => {
  const result = confirmOrder(draftOrder(), command());

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.order.status, "CONFIRMED");
  assert.equal(result.event.event_type, "order.confirmed");
  assert.equal(result.event.aggregate_id, result.order.id);
  assert.equal(result.event.store_id, result.order.storeId);
  assert.equal(result.event.payload.order_id, result.order.id);
});

test("ConfirmOrder rejects an already confirmed order as duplicate confirmation", () => {
  const order = draftOrder();
  const confirmed = confirmOrder(order, command());

  assert.equal(confirmed.ok, true);
  if (!confirmed.ok) return;

  const duplicate = confirmOrder(confirmed.order, command());

  assert.equal(duplicate.ok, false);
  if (duplicate.ok) return;
  assert.equal(duplicate.error.code, ORDER_DOMAIN_ERRORS.DUPLICATE_CONFIRMATION);
});

test("ConfirmOrder rejects a non-DRAFT order state", () => {
  const order = Object.create(Order.prototype) as Order;
  Object.defineProperties(order, {
    id: { value: generateUuidV7(1_759_000_000_300) },
    storeId: { value: "store-1" },
    status: { value: "CANCELLED" },
    items: { value: [] },
    total: { value: createMoney(0) }
  });

  const result = confirmOrder(order, command());

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.code, ORDER_DOMAIN_ERRORS.INVALID_ORDER_STATE);
});

test("ConfirmOrder rejects invalid confirmation data", () => {
  const result = confirmOrder(draftOrder(), {
    ...command(),
    confirmation: {
      final_summary: "   ",
      confirmed: true
    }
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.code, ORDER_DOMAIN_ERRORS.CONFIRMATION_DATA_INVALID);
});

test("ConfirmOrder exposes concurrency conflict semantics without selecting a mechanism", () => {
  const result = confirmOrder(draftOrder(), {
    ...command(),
    concurrency_conflict: true
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.code, ORDER_DOMAIN_ERRORS.CONCURRENCY_CONFLICT);
});

test("ConfirmOrder preserves the approved actor context boundary without interpreting it", () => {
  const result = confirmOrder(draftOrder(), command());

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.strictEqual(result.actor_context, actorContext);
});

test("Order preserves D2 aggregate ownership and deterministic money representation", () => {
  const order = draftOrder();

  assert.equal(order.status, "DRAFT");
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].modifiers.length, 1);
  assert.deepEqual(order.total, { amount_cents: 3250, currency: "BRL" });
});
