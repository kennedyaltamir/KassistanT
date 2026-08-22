import assert from "node:assert/strict";
import test from "node:test";
import {
  CURRENCY_BRL,
  addMoney,
  assertUtcTimestamp,
  createMoney,
  generateUuidV7,
  isUuidV7,
  utcNow
} from "./index.js";

test("UUIDv7 primitive generates valid version 7 identifiers", () => {
  const value = generateUuidV7(1_759_000_000_000);
  assert.equal(isUuidV7(value), true);
  assert.equal(value[14], "7");
});

test("UTC timestamp primitive emits UTC ISO-8601 timestamps", () => {
  const value = utcNow();
  assert.doesNotThrow(() => assertUtcTimestamp(value));
  assert.equal(value.endsWith("Z"), true);
});

test("money primitive preserves integer cents and BRL", () => {
  const total = addMoney(createMoney(1250), createMoney(350));
  assert.deepEqual(total, { amount_cents: 1600, currency: CURRENCY_BRL });
  assert.throws(() => createMoney(12.5), /safe integer/);
});
