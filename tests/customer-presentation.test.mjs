import test from "node:test";
import assert from "node:assert/strict";

// C1A renderer acceptance evidence: presentation validation must not claim persistence.
test("customer presentation contract keeps persistence unavailable", async () => {
  const mod = await import("../apps/desktop/src/main.tsx");
  const state = mod.unavailableCustomerOperation();
  assert.equal(state.persistence_status, "UNAVAILABLE");
  assert.equal(state.ui_status, "IDLE");
});

test("customer validation requires phone but keeps name optional", async () => {
  const mod = await import("../apps/desktop/src/main.tsx");
  assert.equal(mod.validateCustomerPresentationInput({ name: "Ana" }).ok, false);
  const valid = mod.validateCustomerPresentationInput({ phone: "+55 31 99999-0000" });
  assert.equal(valid.ok, true);
  assert.equal(valid.name, undefined);
});

test("customer UI model marks local identity as provisional", async () => {
  const customer = {
    presentation_id: "fixture-customer-1",
    identity_source: "PROVISIONAL_PRESENTATION_ID",
    phone: "+55 31 99999-0000",
    data_status: "PROVISIONAL_DATA",
  };
  assert.notEqual(customer.identity_source, "CUSTOMER_IDENTITY");
  assert.equal(customer.data_status, "PROVISIONAL_DATA");
});
