import test from 'node:test';
import assert from 'node:assert/strict';

const saved = {
  autoreply: process.env.KASSIST_AI_AUTOREPLY,
  persist: process.env.KASSIST_AI_PERSIST_CONFIG,
};

test.afterEach(() => {
  if (saved.autoreply === undefined) delete process.env.KASSIST_AI_AUTOREPLY;
  else process.env.KASSIST_AI_AUTOREPLY = saved.autoreply;
  if (saved.persist === undefined) delete process.env.KASSIST_AI_PERSIST_CONFIG;
  else process.env.KASSIST_AI_PERSIST_CONFIG = saved.persist;
});

test('global auto-reply disable blocks automatic replies', async () => {
  process.env.KASSIST_AI_AUTOREPLY = 'false';
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';

  const { shouldAutoReply } = await import('../src/auto-reply.mjs?test=global-disabled');
  assert.equal(shouldAutoReply('246973638648023@lid'), false);
});

test('global auto-reply enable allows a conversation without disable override', async () => {
  process.env.KASSIST_AI_AUTOREPLY = 'true';
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';

  const { shouldAutoReply } = await import('../src/auto-reply.mjs?test=global-enabled');
  assert.equal(shouldAutoReply('246973638648023@lid'), true);
});
