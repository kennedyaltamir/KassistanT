import { createMoney, generateUuidV7, type OrderItem, type OrderStatus } from "../../../packages/domain/src/index.js";
import { confirmOrder } from "../../../packages/domain/src/confirm-order.js";
import { SQLiteDatabase, getDefaultDatabasePath } from "./database/sqlite-database.js";
import { SQLiteOrderRepository, SQLiteProductRepository } from "./database/product-order-repository.js";
import path from "node:path";

export interface CommerceServiceOptions {
  readonly databasePath?: string;
  readonly migrationsPath?: string;
  readonly storeId?: string;
}

export interface ProductView {
  readonly id: string;
  readonly name: string;
  readonly price_amount_cents: number;
  readonly currency: "BRL";
}

export interface OrderItemInput {
  readonly product_id: string;
  readonly quantity: number;
}

export interface OrderView {
  readonly id: string;
  readonly status: OrderStatus;
  readonly total_amount_cents: number;
  readonly currency: "BRL";
  readonly items: readonly {
    readonly id: string;
    readonly name: string;
    readonly quantity: number;
    readonly unit_price_cents: number;
    readonly currency: "BRL";
  }[];
}

export class CommerceValidationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "CommerceValidationError";
  }
}

export class CommerceService {
  private databasePromise: Promise<SQLiteDatabase> | undefined;
  private readonly options: CommerceServiceOptions;
  private readonly storeId: string;

  constructor(options: CommerceServiceOptions = {}) {
    this.options = options;
    this.storeId = options.storeId?.trim() || process.env.KASSIST_STORE_ID?.trim() || "mvp-local-store";
  }

  async listProducts(): Promise<ProductView[]> {
    const repo = new SQLiteProductRepository(await this.database());
    return repo.listByStore(this.storeId).map((product) => ({
      id: product.id,
      name: product.name,
      price_amount_cents: product.price.amount_cents,
      currency: product.price.currency
    }));
  }

  async createProduct(input: { name: string; price_amount_cents: number }): Promise<ProductView> {
    const name = input.name.trim();
    if (name.length < 2 || name.length > 120) {
      throw new CommerceValidationError("INVALID_PRODUCT_NAME", "Nome do produto deve ter entre 2 e 120 caracteres.");
    }
    if (!Number.isSafeInteger(input.price_amount_cents) || input.price_amount_cents < 0) {
      throw new CommerceValidationError("INVALID_PRODUCT_PRICE", "Preço deve ser um inteiro seguro em centavos.");
    }
    const price = createMoney(input.price_amount_cents);
    const product = { id: generateUuidV7(), store_id: this.storeId, name, price };
    new SQLiteProductRepository(await this.database()).create(product);
    return {
      id: product.id,
      name: product.name,
      price_amount_cents: product.price.amount_cents,
      currency: product.price.currency
    };
  }

  async listOrders(): Promise<OrderView[]> {
    const repo = new SQLiteOrderRepository(await this.database());
    const orders = await repo.listByStore(this.storeId);
    return orders.map((order) => this.toView(order));
  }

  async createDraftOrder(input: { items: readonly OrderItemInput[] }): Promise<OrderView> {
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new CommerceValidationError("EMPTY_ORDER", "O pedido precisa ter pelo menos um item.");
    }

    const productRepo = new SQLiteProductRepository(await this.database());
    const orderRepo = new SQLiteOrderRepository(await this.database());
    const items: OrderItem[] = [];
    let totalCents = 0;

    for (const requested of input.items) {
      if (!requested || !Number.isSafeInteger(requested.quantity) || requested.quantity <= 0) {
        throw new CommerceValidationError("INVALID_ORDER_QUANTITY", "Quantidade deve ser um inteiro positivo.");
      }
      const product = productRepo.getById(String(requested.product_id), this.storeId);
      if (!product) {
        throw new CommerceValidationError("PRODUCT_NOT_FOUND", "Produto não encontrado no escopo da loja.");
      }
      const line = product.price.amount_cents * requested.quantity;
      if (!Number.isSafeInteger(line) || !Number.isSafeInteger(totalCents + line)) {
        throw new CommerceValidationError("ORDER_TOTAL_OVERFLOW", "Total do pedido excede o limite monetário suportado.");
      }
      items.push({
        id: generateUuidV7(),
        name: product.name,
        quantity: requested.quantity,
        unit_price: createMoney(product.price.amount_cents),
        modifiers: []
      });
      totalCents += line;
    }

    const { Order } = await import("../../../packages/domain/src/order.js");
    const order = Order.createDraft(this.storeId, items, createMoney(totalCents));
    orderRepo.save(order);
    return this.toView(order);
  }

  async confirmOrder(input: { order_id: string; final_summary: string; confirmed: boolean }): Promise<OrderView> {
    const repo = new SQLiteOrderRepository(await this.database());
    const order = await repo.getById(input.order_id, this.storeId);
    if (!order) throw new CommerceValidationError("ORDER_NOT_FOUND", "Pedido não encontrado.");

    const result = confirmOrder(order, {
      confirmation: {
        final_summary: input.final_summary,
        confirmed: input.confirmed
      },
      actor_context: Object.freeze({ actor_ref: "desktop-user" })
    });
    if (!result.ok) {
      throw new CommerceValidationError(result.error.code, confirmationErrorMessage(result.error.code));
    }

    repo.update(result.order);
    return this.toView(result.order);
  }

  async close(): Promise<void> {
    const promise = this.databasePromise;
    this.databasePromise = undefined;
    if (promise) (await promise).close();
  }

  private async database(): Promise<SQLiteDatabase> {
    if (!this.databasePromise) {
      const filePath = this.options.databasePath ?? getDefaultDatabasePath();
      const migrationsPath = this.options.migrationsPath ?? path.join(__dirname, "..", "database", "migrations");
      this.databasePromise = SQLiteDatabase.open({
        filePath,
        migrationsPath,
        applicationVersion: "0.1.0"
      });
    }
    return this.databasePromise;
  }

  private toView(order: import("../../../packages/domain/src/order.js").Order): OrderView {
    return {
      id: order.id,
      status: order.status,
      total_amount_cents: order.total.amount_cents,
      currency: order.total.currency,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price_cents: item.unit_price.amount_cents,
        currency: item.unit_price.currency
      }))
    };
  }
}

function confirmationErrorMessage(code: string): string {
  switch (code) {
    case "INVALID_ORDER_STATE":
      return "O pedido não está em um estado confirmável.";
    case "CONFIRMATION_DATA_INVALID":
      return "A confirmação exige resumo final e confirmação explícita.";
    case "DUPLICATE_CONFIRMATION":
      return "O pedido já foi confirmado.";
    case "CONCURRENCY_CONFLICT":
      return "O pedido foi alterado por outra operação. Recarregue e tente novamente.";
    default:
      return "Não foi possível confirmar o pedido.";
  }
}
