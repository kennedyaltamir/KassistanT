import { createMoney, type Money } from "./money.js";
import { generateUuidV7, isUuidV7 } from "./uuidv7.js";

export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemModifier {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly price: Money;
}

export interface OrderItem {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly unit_price: Money;
  readonly modifiers: readonly OrderItemModifier[];
}

export interface OrderProps {
  readonly id: string;
  readonly store_id: string;
  readonly status: OrderStatus;
  readonly items: readonly OrderItem[];
  readonly total: Money;
}

export class Order {
  private constructor(private readonly props: OrderProps) {}

  static createDraft(
    storeId: string,
    items: readonly OrderItem[] = [],
    total: Money = createMoney(0)
  ): Order {
    const id = generateUuidV7();
    return Order.create({
      id,
      store_id: storeId,
      status: "DRAFT",
      items,
      total
    });
  }

  static create(props: OrderProps): Order {
    assertOrderProps(props);
    return new Order({
      ...props,
      items: [...props.items],
      total: { ...props.total }
    });
  }

  get id(): string {
    return this.props.id;
  }

  get storeId(): string {
    return this.props.store_id;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get items(): readonly OrderItem[] {
    return this.props.items;
  }

  get total(): Money {
    return { ...this.props.total };
  }

  confirm(): Order {
    if (this.status !== "DRAFT") {
      throw new Error("INVALID_ORDER_STATE");
    }

    validateItems(this.items);
    validateTotal(this.total);

    return new Order({
      ...this.props,
      status: "CONFIRMED",
      items: [...this.props.items],
      total: { ...this.props.total }
    });
  }
}

function assertOrderProps(props: OrderProps): void {
  if (!isUuidV7(props.id)) {
    throw new TypeError("Order id must be a UUIDv7");
  }
  if (props.store_id.trim().length === 0) {
    throw new TypeError("Order store_id is required");
  }
  if (!isOrderStatus(props.status)) {
    throw new TypeError("Unsupported Order status");
  }

  validateItems(props.items);
  validateTotal(props.total);
}

function validateItems(items: readonly OrderItem[]): void {
  for (const item of items) {
    if (!isUuidV7(item.id)) {
      throw new TypeError("OrderItem id must be a UUIDv7");
    }
    if (item.name.trim().length === 0) {
      throw new TypeError("OrderItem name is required");
    }
    assertPositiveInteger(item.quantity, "OrderItem quantity");
    validateTotal(item.unit_price);

    for (const modifier of item.modifiers) {
      if (!isUuidV7(modifier.id)) {
        throw new TypeError("OrderItemModifier id must be a UUIDv7");
      }
      if (modifier.name.trim().length === 0) {
        throw new TypeError("OrderItemModifier name is required");
      }
      assertPositiveInteger(modifier.quantity, "OrderItemModifier quantity");
      validateTotal(modifier.price);
    }
  }
}

function validateTotal(total: Money): void {
  createMoney(total.amount_cents, total.currency);
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive safe integer`);
  }
}

function isOrderStatus(value: string): value is OrderStatus {
  return (
    value === "DRAFT" ||
    value === "CONFIRMED" ||
    value === "IN_PRODUCTION" ||
    value === "READY" ||
    value === "OUT_FOR_DELIVERY" ||
    value === "DELIVERED" ||
    value === "CANCELLED"
  );
}
