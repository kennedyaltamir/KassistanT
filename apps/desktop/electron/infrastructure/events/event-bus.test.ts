import assert from "node:assert/strict";
import test from "node:test";

import { EventBus, type EventHandler } from "./event-bus.js";

function createEvent(overrides: Partial<Parameters<EventBus["publish"]>[0]> = {}) {
  return {
    event_id: "event-1",
    event_type: "order.created" as const,
    store_id: "store-1",
    aggregate_id: "order-1",
    occurred_at_utc: "2026-08-24T04:00:00.000Z",
    payload: { amount_cents: 1000 },
    ...overrides
  };
}

test("subscribe and publish route the event to a matching subscriber", async () => {
  const bus = new EventBus();
  let received: unknown;

  bus.subscribe("order.created", (event) => {
    received = event;
  });

  const result = await bus.publish(createEvent());

  assert.equal(result.status, "success");
  assert.equal(result.invokedSubscriptions, 1);
  assert.deepEqual(received, createEvent());
});

test("unsubscribe is idempotent and prevents later delivery", async () => {
  const bus = new EventBus();
  let calls = 0;
  const subscription = bus.subscribe("order.created", () => {
    calls += 1;
  });

  bus.unsubscribe(subscription);
  bus.unsubscribe(subscription);

  const result = await bus.publish(createEvent());

  assert.equal(calls, 0);
  assert.equal(result.status, "success");
  assert.equal(result.invokedSubscriptions, 0);
});

test("duplicate subscriptions are independent registrations", async () => {
  const bus = new EventBus();
  const calls: string[] = [];

  bus.subscribe("order.created", () => {
    calls.push("A");
  });
  bus.subscribe("order.created", () => {
    calls.push("A");
  });

  const result = await bus.publish(createEvent());

  assert.deepEqual(calls, ["A", "A"]);
  assert.equal(result.invokedSubscriptions, 2);
});

test("dispatch uses a snapshot of subscriptions", async () => {
  const bus = new EventBus();
  const calls: string[] = [];
  let added = false;

  bus.subscribe("order.created", () => {
    calls.push("A");
    if (!added) {
      added = true;
      bus.subscribe("order.created", () => {
        calls.push("B");
      });
    }
  });

  await bus.publish(createEvent());
  await bus.publish(createEvent({ event_id: "event-2" }));

  assert.deepEqual(calls, ["A", "A", "B"]);
});

test("a subscriber failure is isolated and aggregated after all handlers settle", async () => {
  const bus = new EventBus();
  const calls: string[] = [];
  const originalConsoleError = console.error;
  const logged: unknown[] = [];
  console.error = (...args: unknown[]) => logged.push(args);

  try {
    const failingHandler: EventHandler = async () => {
      calls.push("A");
      throw new Error("boom");
    };

    bus.subscribe("order.created", failingHandler);
    bus.subscribe("order.created", async () => {
      calls.push("B");
    });

    const result = await bus.publish(createEvent());

    assert.deepEqual(calls, ["A", "B"]);
    assert.equal(result.status, "partial_failure");
    assert.equal(result.invokedSubscriptions, 2);
    assert.equal(result.failures.length, 1);
    assert.equal(result.failures[0]?.subscriptionId, "subscription-1");
    assert.equal(logged.length, 1);
  } finally {
    console.error = originalConsoleError;
  }
});

test("all failures produce complete_failure", async () => {
  const bus = new EventBus();
  const originalConsoleError = console.error;
  console.error = () => undefined;

  try {
    bus.subscribe("order.created", () => {
      throw new Error("first");
    });
    bus.subscribe("order.created", () => {
      throw new Error("second");
    });

    const result = await bus.publish(createEvent());

    assert.equal(result.status, "complete_failure");
    assert.equal(result.failures.length, 2);
  } finally {
    console.error = originalConsoleError;
  }
});

test("publish completes after sequential handlers finish", async () => {
  const bus = new EventBus();
  const calls: string[] = [];

  bus.subscribe("order.created", async () => {
    calls.push("A:start");
    await Promise.resolve();
    calls.push("A:end");
  });
  bus.subscribe("order.created", () => {
    calls.push("B");
  });

  const result = await bus.publish(createEvent());

  assert.equal(result.status, "success");
  assert.deepEqual(calls, ["A:start", "A:end", "B"]);
});

test("non-matching subscribers are not invoked", async () => {
  const bus = new EventBus();
  let called = false;

  bus.subscribe("order.cancelled", () => {
    called = true;
  });

  const result = await bus.publish(createEvent());

  assert.equal(called, false);
  assert.equal(result.invokedSubscriptions, 0);
  assert.equal(result.status, "success");
});

test("event metadata and payload are forwarded unchanged", async () => {
  const bus = new EventBus();
  const correlation = "corr-1";
  const causation = "cause-1";
  const event = createEvent({ payload: { correlation, causation } });
  let received: typeof event | undefined;

  bus.subscribe("order.created", (incoming) => {
    received = incoming as typeof event;
  });

  await bus.publish(event);

  assert.deepEqual(received, event);
});

test("V1 does not define ordering or persistence/retry/timeout behavior", async () => {
  const bus = new EventBus();
  const calls: string[] = [];

  bus.subscribe("order.created", () => {
    calls.push("first");
  });
  bus.subscribe("order.created", () => {
    calls.push("second");
  });

  const result = await bus.publish(createEvent());

  assert.deepEqual(calls, ["first", "second"]);
  assert.equal(result.failures.length, 0);
  assert.equal(result.status, "success");
});
