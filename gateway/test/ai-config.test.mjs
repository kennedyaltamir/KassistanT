import test from 'node:test';
import assert from 'node:assert/strict';

process.env.KASSIST_AI_PERSIST_CONFIG = 'false';

const { getAiConfig, updateAiConfig } = await import('../src/ai-config.mjs?test=config');

test.after(() => {
  delete process.env.KASSIST_AI_PERSIST_CONFIG;
});

test('local AI configuration uses safe loopback defaults', () => {
  const config = getAiConfig();
  assert.equal(config.enabled, false);
  assert.equal(config.baseUrl, 'http://127.0.0.1:11434');
  assert.equal(config.contextMessages, 12);
  assert.equal(config.cooldownMs, 1500);
});

test('local AI configuration rejects remote endpoints', () => {
  assert.throws(
    () => updateAiConfig({ baseUrl: 'https://example.com/ollama' }),
    /localhost:11434/
  );
});

test('local AI configuration rejects oversized system prompts', () => {
  assert.throws(
    () => updateAiConfig({ systemPrompt: 'x'.repeat(12001) }),
    /12000 characters/
  );
});
