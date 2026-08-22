export const CURRENCY_BRL = "BRL" as const;
export type Currency = typeof CURRENCY_BRL;

export interface Money {
  amount_cents: number;
  currency: Currency;
}

export function createMoney(amountCents: number, currency: Currency = CURRENCY_BRL): Money {
  assertMoneyAmount(amountCents);
  return { amount_cents: amountCents, currency };
}

export function addMoney(left: Money, right: Money): Money {
  assertSameCurrency(left, right);
  const amount = left.amount_cents + right.amount_cents;
  assertMoneyAmount(amount);
  return createMoney(amount, left.currency);
}

export function subtractMoney(left: Money, right: Money): Money {
  assertSameCurrency(left, right);
  const amount = left.amount_cents - right.amount_cents;
  assertMoneyAmount(amount);
  return createMoney(amount, left.currency);
}

export function assertMoneyAmount(amountCents: number): void {
  if (!Number.isSafeInteger(amountCents)) {
    throw new RangeError("Money must use a safe integer amount in cents");
  }
}

function assertSameCurrency(left: Money, right: Money): void {
  if (left.currency !== right.currency) {
    throw new RangeError("Money currency mismatch");
  }
}
