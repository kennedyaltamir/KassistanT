import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { CommerceService, CommerceValidationError } from "./commerce-service.js";

async function context() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kassist-commerce-"));
  return {
    directory,
    filePath: path.join(directory, "kassist.sqlite"),
    migrationsPath: path.resolve(__dirname, "../database/migrations")
  };
}

function assertCommerceError(error: unknown, code: string) {
  assert.ok(error instanceof CommerceValidationError);
  assert.equal(error.code, code);
}

test("Products are created with integer cents and recovered after reopen", async () => {
  const ctx = await context();
  const options = { ...ctx, storeId: "store-test" };
  const first = new CommerceService(options);
  let created;
  try {
    created = await first.createProduct({ name: "Açaí", price_amount_cents: 1290 });
    assert.equal(created.currency, "BRL");
    assert.equal(created.price_amount_cents, 1290);
    assert.deepEqual(await first.listProducts(), [created]);
  } finally {
    await first.close();
  }

  const second = new CommerceService(options);
  try {
    const recovered = await second.listProducts();
    assert.equal(recovered.length, 1);
    assert.deepEqual(recovered[0], created);
    assert.equal(recovered[0]?.name, "Açaí");
    assert.equal(recovered[0]?.price_amount_cents, 1290);
  } finally {
    await second.close();
    await rm(ctx.directory, { recursive: true, force: true });
  }
});

test("Product and Order boundaries reject invalid business input", async () => {
  const ctx = await context();
  const service = new CommerceService({ ...ctx, storeId: "store-test" });
  try {
    await assert.rejects(() => service.createProduct({ name: "x", price_amount_cents: 100 }), (error) => {
      assertCommerceError(error, "INVALID_PRODUCT_NAME");
      return true;
    });
    await assert.rejects(() => service.createProduct({ name: "Produto", price_amount_cents: 1.5 }), (error) => {
      assertCommerceError(error, "INVALID_PRODUCT_PRICE");
      return true;
    });
    await assert.rejects(() => service.createDraftOrder({ items: [] }), (error) => {
      assertCommerceError(error, "EMPTY_ORDER");
      return true;
    });
    const product = await service.createProduct({ name: "Sorvete", price_amount_cents: 900 });
    await assert.rejects(() => service.createDraftOrder({ items: [{ product_id: product.id, quantity: 0 }] }), (error) => {
      assertCommerceError(error, "INVALID_ORDER_QUANTITY");
      return true;
    });
    await assert.rejects(() => service.createDraftOrder({ items: [{ product_id: "missing", quantity: 1 }] }), (error) => {
      assertCommerceError(error, "PRODUCT_NOT_FOUND");
      return true;
    });
  } finally {
    await service.close();
    await rm(ctx.directory, { recursive: true, force: true });
  }
});

test("Order creation uses canonical product pricing and confirmation is lifecycle-gated", async () => {
  const ctx = await context();
  const service = new CommerceService({ ...ctx, storeId: "store-test" });
  try {
    const product = await service.createProduct({ name: "Milkshake", price_amount_cents: 1500 });
    const draft = await service.createDraftOrder({ items: [{ product_id: product.id, quantity: 2 }] });
    assert.equal(draft.status, "DRAFT");
    assert.equal(draft.total_amount_cents, 3000);
    assert.equal(draft.items[0]?.unit_price_cents, 1500);

    await assert.rejects(
      () => service.confirmOrder({ order_id: draft.id, final_summary: "", confirmed: true }),
      (error) => {
        assertCommerceError(error, "CONFIRMATION_DATA_INVALID");
        return true;
      }
    );

    const confirmed = await service.confirmOrder({
      order_id: draft.id,
      final_summary: "2x Milkshake — R$ 30,00",
      confirmed: true
    });
    assert.equal(confirmed.status, "CONFIRMED");

    await assert.rejects(
      () => service.confirmOrder({
        order_id: draft.id,
        final_summary: "2x Milkshake — R$ 30,00",
        confirmed: true
      }),
      (error) => {
        assertCommerceError(error, "DUPLICATE_CONFIRMATION");
        return true;
      }
    );

    const recovered = await service.listOrders();
    assert.equal(recovered.length, 1);
    assert.equal(recovered[0]?.status, "CONFIRMED");
  } finally {
    await service.close();
    await rm(ctx.directory, { recursive: true, force: true });
  }
});
