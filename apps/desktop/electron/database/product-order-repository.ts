import type { Currency, Money, Order, OrderItem, OrderItemModifier } from "../../../../packages/domain/src/index.js";
import type { SQLiteDatabase } from "./sqlite-database.js";

export interface ProductRecord {
  readonly id: string;
  readonly store_id: string;
  readonly name: string;
  readonly price: Money;
  readonly category_id?: string | null;
  readonly description?: string | null;
  readonly available?: boolean;
}

export interface OrderRepository {
  save(order: Order): void;
  getById(id: string): Promise<Order | null>;
}

export interface ProductRepository {
  create(product: ProductRecord): void;
  getById(id: string): ProductRecord | null;
}

interface ProductRow extends Record<string, unknown> {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_cents: number;
  currency: Currency;
  available: number;
}

interface OrderRow extends Record<string, unknown> {
  id: string;
  store_id: string;
  customer_id: string;
  conversation_id: string;
  lifecycle_state: string;
  total_cents: number;
  currency: Currency;
}

interface OrderItemRow extends Record<string, unknown> {
  id: string;
  order_id: string;
  product_name_snapshot: string;
  quantity: number;
  unit_price_cents_snapshot: number;
}

interface ModifierRow extends Record<string, unknown> {
  id: string;
  order_item_id: string;
  modifier_name_snapshot: string;
  quantity: number;
  unit_price_cents_snapshot: number;
}

export class SQLiteProductRepository implements ProductRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  create(product: ProductRecord): void {
    const now = new Date().toISOString();
    this.database.execute(
      `INSERT INTO product (
         id, store_id, category_id, name, description, price_cents, currency,
         available, tags, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      product.id,
      product.store_id,
      product.category_id ?? null,
      product.name,
      product.description ?? null,
      product.price.amount_cents,
      product.price.currency,
      product.available === false ? 0 : 1,
      now,
      now
    );
  }

  getById(id: string): ProductRecord | null {
    const rows = this.database.query<ProductRow>(
      `SELECT id, store_id, category_id, name, description,
              price_cents, currency, available
       FROM product WHERE id = ?`,
      id
    );
    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      store_id: row.store_id,
      category_id: row.category_id,
      name: row.name,
      description: row.description,
      price: { amount_cents: row.price_cents, currency: row.currency },
      available: row.available === 1
    };
  }
}

export class SQLiteOrderRepository implements OrderRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  save(order: Order): void {
    if (!order.customerId || !order.conversationId) {
      throw new Error("ORDER_CONTEXT_REQUIRED");
    }

    const now = new Date().toISOString();
    const displayNumber = order.id;

    this.database.transaction(() => {
      this.database.execute(
        `INSERT INTO "order" (
           id, store_id, display_number, customer_id, conversation_id,
           lifecycle_state, subtotal_cents, discount_cents, delivery_fee_cents,
           total_cents, currency, delivery_type, address_id, payment_method_id,
           notes, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 'PICKUP', NULL, NULL, NULL, ?, ?)`,
        order.id,
        order.storeId,
        displayNumber,
        order.customerId,
        order.conversationId,
        order.status,
        order.total.amount_cents,
        order.total.amount_cents,
        order.total.currency,
        now,
        now
      );

      for (const item of order.items) {
        const itemSubtotal = item.unit_price.amount_cents * item.quantity +
          item.modifiers.reduce(
            (sum, modifier) => sum + modifier.price.amount_cents * modifier.quantity,
            0
          );

        this.database.execute(
          `INSERT INTO order_item (
             id, order_id, product_id, product_name_snapshot,
             unit_price_cents_snapshot, quantity, subtotal_cents
           ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          item.id,
          order.id,
          item.id,
          item.name,
          item.unit_price.amount_cents,
          item.quantity,
          itemSubtotal
        );

        for (const modifier of item.modifiers) {
          const modifierSubtotal = modifier.price.amount_cents * modifier.quantity;
          this.database.execute(
            `INSERT INTO order_item_modifier (
               id, order_item_id, modifier_name_snapshot,
               unit_price_cents_snapshot, quantity, subtotal_cents
             ) VALUES (?, ?, ?, ?, ?, ?)`,
            modifier.id,
            item.id,
            modifier.name,
            modifier.price.amount_cents,
            modifier.quantity,
            modifierSubtotal
          );
        }
      }
    });
  }

  async getById(id: string): Promise<Order | null> {
    const orderRows = this.database.query<OrderRow>(
      `SELECT id, store_id, customer_id, conversation_id, lifecycle_state,
              total_cents, currency
       FROM "order" WHERE id = ?`,
      id
    );
    const orderRow = orderRows[0];
    if (!orderRow) return null;

    const itemRows = this.database.query<OrderItemRow>(
      `SELECT id, order_id, product_name_snapshot, quantity,
              unit_price_cents_snapshot
       FROM order_item WHERE order_id = ? ORDER BY rowid`,
      id
    );

    const items: OrderItem[] = [];
    for (const itemRow of itemRows) {
      const modifierRows = this.database.query<ModifierRow>(
        `SELECT id, order_item_id, modifier_name_snapshot, quantity,
                unit_price_cents_snapshot
         FROM order_item_modifier WHERE order_item_id = ? ORDER BY rowid`,
        itemRow.id
      );

      const modifiers: OrderItemModifier[] = modifierRows.map((modifierRow) => ({
        id: modifierRow.id,
        name: modifierRow.modifier_name_snapshot,
        quantity: modifierRow.quantity,
        price: {
          amount_cents: modifierRow.unit_price_cents_snapshot,
          currency: orderRow.currency
        }
      }));

      items.push({
        id: itemRow.id,
        name: itemRow.product_name_snapshot,
        quantity: itemRow.quantity,
        unit_price: {
          amount_cents: itemRow.unit_price_cents_snapshot,
          currency: orderRow.currency
        },
        modifiers
      });
    }

    const { Order } = await import("../../../../packages/domain/src/order.js");
    return Order.create({
      id: orderRow.id,
      store_id: orderRow.store_id,
      customer_id: orderRow.customer_id,
      conversation_id: orderRow.conversation_id,
      status: orderRow.lifecycle_state as Order["status"],
      items,
      total: {
        amount_cents: orderRow.total_cents,
        currency: orderRow.currency
      }
    });
  }
}
