import type { Currency, Money, Order, OrderItem, OrderItemModifier } from "../../../../packages/domain/src/index.js";
import type { SQLiteDatabase } from "./sqlite-database.js";

export interface ProductRecord {
  readonly id: string;
  readonly store_id: string;
  readonly name: string;
  readonly price: Money;
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
  name: string;
  price_amount_cents: number;
  price_currency: Currency;
}

interface OrderRow extends Record<string, unknown> {
  id: string;
  store_id: string;
  status: string;
  total_amount_cents: number;
  total_currency: Currency;
}

interface OrderItemRow extends Record<string, unknown> {
  id: string;
  order_id: string;
  name: string;
  quantity: number;
  unit_price_cents: number;
  unit_price_currency: Currency;
}

interface ModifierRow extends Record<string, unknown> {
  id: string;
  order_item_id: string;
  name: string;
  quantity: number;
  price_cents: number;
  price_currency: Currency;
}

export class SQLiteProductRepository implements ProductRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  create(product: ProductRecord): void {
    this.database.execute(
      `INSERT INTO product (id, store_id, name, price_amount_cents, price_currency)
       VALUES (?, ?, ?, ?, ?)`,
      product.id,
      product.store_id,
      product.name,
      product.price.amount_cents,
      product.price.currency
    );
  }

  getById(id: string): ProductRecord | null {
    const rows = this.database.query<ProductRow>(
      `SELECT id, store_id, name, price_amount_cents, price_currency
       FROM product WHERE id = ?`,
      id
    );
    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      store_id: row.store_id,
      name: row.name,
      price: { amount_cents: row.price_amount_cents, currency: row.price_currency }
    };
  }
}

export class SQLiteOrderRepository implements OrderRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  save(order: Order): void {
    this.database.transaction(() => {
      this.database.execute(
        `INSERT INTO "order" (id, store_id, status, total_amount_cents, total_currency)
         VALUES (?, ?, ?, ?, ?)`,
        order.id,
        order.storeId,
        order.status,
        order.total.amount_cents,
        order.total.currency
      );

      for (const item of order.items) {
        this.database.execute(
          `INSERT INTO order_item (
             id, order_id, name, quantity, unit_price_cents, unit_price_currency
           ) VALUES (?, ?, ?, ?, ?, ?)`,
          item.id,
          order.id,
          item.name,
          item.quantity,
          item.unit_price.amount_cents,
          item.unit_price.currency
        );

        for (const modifier of item.modifiers) {
          this.database.execute(
            `INSERT INTO order_item_modifier (
               id, order_item_id, name, quantity, price_cents, price_currency
             ) VALUES (?, ?, ?, ?, ?, ?)`,
            modifier.id,
            item.id,
            modifier.name,
            modifier.quantity,
            modifier.price.amount_cents,
            modifier.price.currency
          );
        }
      }
    });
  }

  async getById(id: string): Promise<Order | null> {
    const orderRows = this.database.query<OrderRow>(
      `SELECT id, store_id, status, total_amount_cents, total_currency
       FROM "order" WHERE id = ?`,
      id
    );
    const orderRow = orderRows[0];
    if (!orderRow) return null;

    const itemRows = this.database.query<OrderItemRow>(
      `SELECT id, order_id, name, quantity, unit_price_cents, unit_price_currency
       FROM order_item WHERE order_id = ? ORDER BY rowid`,
      id
    );

    const items: OrderItem[] = [];
    for (const itemRow of itemRows) {
      const modifierRows = this.database.query<ModifierRow>(
        `SELECT id, order_item_id, name, quantity, price_cents, price_currency
         FROM order_item_modifier WHERE order_item_id = ? ORDER BY rowid`,
        itemRow.id
      );

      const modifiers: OrderItemModifier[] = modifierRows.map((modifierRow) => ({
        id: modifierRow.id,
        name: modifierRow.name,
        quantity: modifierRow.quantity,
        price: {
          amount_cents: modifierRow.price_cents,
          currency: modifierRow.price_currency
        }
      }));

      items.push({
        id: itemRow.id,
        name: itemRow.name,
        quantity: itemRow.quantity,
        unit_price: {
          amount_cents: itemRow.unit_price_cents,
          currency: itemRow.unit_price_currency
        },
        modifiers
      });
    }

    const { Order } = await import("../../../../packages/domain/src/order.js");
    return Order.create({
      id: orderRow.id,
      store_id: orderRow.store_id,
      status: orderRow.status as Order["status"],
      items,
      total: {
        amount_cents: orderRow.total_amount_cents,
        currency: orderRow.total_currency
      }
    });
  }
}
