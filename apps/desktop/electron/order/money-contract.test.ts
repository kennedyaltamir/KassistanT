import assert from "node:assert/strict";
import test from "node:test";
import {
  CURRENCY_BRL,
  addMoney,
  assertMoneyAmount,
  createMoney,
  subtractMoney
} from "../../../../packages/domain/src/index.js";

test("Order Engine reuses the canonical Money representation", () => {
  assert.deepEqual(createMoney(0), { amount_cents: 0, currency: CURRENCY_BRL });
  assert.deepEqual(createMoney(1250), {
    amount_cents: 1250,
    currency: CURRENCY_BRL
  });
  assert.deepEqual(createMoney(-1250), {
    amount_cents: -1250,
    currency: CURRENCY_BRL
  });
});

test("canonical Money addition and subtraction are deterministic", () => {
  const left = createMoney(1250);
  const right = createMoney(350);

  assert.deepEqual(addMoney(left, right), {
    amount_cents: 1600,
    currency: CURRENCY_BRL
  });
  assert.deepEqual(subtractMoney(left, right), {
    amount_cents: 900,
    currency: CURRENCY_BRL
  });
  assert.deepEqual(subtractMoney(right, left), {
    amount_cents: -900,
    currency: CURRENCY_BRL
  });
});

test("canonical Money supports repeated integer-cent arithmetic without floating point", () => {
  let total = createMoney(0);

  for (let index = 0; index < 1_000; index += 1) {
    total = addMoney(total, createMoney(1));
  }

  assert.deepEqual(total, {
    amount_cents: 1_000,
    currency: CURRENCY_BRL
  });
});

test("canonical Money rejects non-safe integer monetary values", () => {
  assert.throws(() => createMoney(12.5), /safe integer/);
  assert.throws(() => createMoney(Number.NaN), /safe integer/);
  assert.throws(() => createMoney(Number.POSITIVE_INFINITY), /safe integer/);
  assert.throws(() => assertMoneyAmount(Number.MAX_SAFE_INTEGER + 1), /safe integer/);
});

test("canonical Money preserves safe integer boundaries", () => {
  const max = createMoney(Number.MAX_SAFE_INTEGER);
  assert.equal(max.amount_cents, Number.MAX_SAFE_INTEGER);

  assert.throws(() => addMoney(max, createMoney(1)), /safe integer/);
  assert.throws(() => subtractMoney(createMoney(-Number.MAX_SAFE_INTEGER), createMoney(1)), /safe integer/);
});

test("canonical Money rejects currency mismatch at arithmetic boundaries", () => {
  const customCurrency = { amount_cents: 100, currency: "USD" as never };

  assert.throws(
    () => addMoney(createMoney(100), customCurrency),
    /currency mismatch/
  );
  assert.throws(
    () => subtractMoney(createMoney(100), customCurrency),
    /currency mismatch/
  );
});
