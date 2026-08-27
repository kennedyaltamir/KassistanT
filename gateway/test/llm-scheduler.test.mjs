import test from 'node:test';
import assert from 'node:assert/strict';
import { createLlmUpdateScheduler } from '../src/llm-scheduler.mjs';

function createFakeTimers() {
  let nextId = 0;
  const timers = new Map();
  return {
    setTimer(callback, delay) {
      const id = ++nextId;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimer(id) {
      timers.delete(id);
    },
    async run(id) {
      const timer = timers.get(id);
      assert.ok(timer);
      timers.delete(id);
      await timer.callback();
    },
    get ids() {
      return [...timers.keys()];
    },
    get(id) {
      return timers.get(id);
    },
  };
}

test('scheduler disabled means no timer', () => {
  const fake = createFakeTimers();
  const scheduler = createLlmUpdateScheduler({
    getSettings: () => ({ autoUpdateEnabled: false, intervalHours: 24 }),
    updateAllLocalModels: async () => ({ updated: [], failed: [] }),
    setTimer: fake.setTimer,
    clearTimer: fake.clearTimer,
  });
  scheduler.schedule();
  assert.deepEqual(fake.ids, []);
});

test('scheduler reacts to settings and schedules the normalized interval', () => {
  const fake = createFakeTimers();
  const scheduler = createLlmUpdateScheduler({
    getSettings: () => ({ autoUpdateEnabled: true, intervalHours: 2 }),
    updateAllLocalModels: async () => ({ updated: [], failed: [] }),
    setTimer: fake.setTimer,
    clearTimer: fake.clearTimer,
  });
  scheduler.schedule();
  assert.equal(fake.ids.length, 1);
  assert.equal(fake.get(fake.ids[0]).delay, 2 * 60 * 60 * 1000);
});

test('scheduler survives update failure and reschedules', async () => {
  const fake = createFakeTimers();
  const errors = [];
  let calls = 0;
  const scheduler = createLlmUpdateScheduler({
    getSettings: () => ({ autoUpdateEnabled: true, intervalHours: 1 }),
    updateAllLocalModels: async () => {
      calls += 1;
      throw new Error('provider unavailable');
    },
    onError: error => errors.push(error),
    setTimer: fake.setTimer,
    clearTimer: fake.clearTimer,
  });
  scheduler.schedule();
  const first = fake.ids[0];
  await fake.run(first);
  assert.equal(calls, 1);
  assert.deepEqual(errors, ['provider unavailable']);
  assert.equal(fake.ids.length, 1);
  assert.equal(scheduler.isRunning(), false);
});

test('scheduler shutdown cancels future execution', () => {
  const fake = createFakeTimers();
  const scheduler = createLlmUpdateScheduler({
    getSettings: () => ({ autoUpdateEnabled: true, intervalHours: 24 }),
    updateAllLocalModels: async () => ({ updated: [], failed: [] }),
    setTimer: fake.setTimer,
    clearTimer: fake.clearTimer,
  });
  scheduler.schedule();
  scheduler.shutdown();
  assert.deepEqual(fake.ids, []);
});
