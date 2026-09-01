import test from 'node:test';
import assert from 'node:assert/strict';

process.env.KASSIST_AI_PERSIST_CONFIG = 'false';
delete process.env.KASSIST_AI_AUTOREPLY;
delete process.env.KASSIST_LLM_PROVIDER;
delete process.env.KASSIST_LLM_FALLBACKS;
delete process.env.KASSIST_LLM_URL;
delete process.env.KASSIST_LLM_MODEL;
delete process.env.KASSIST_LLM_TIMEOUT_MS;
delete process.env.KASSIST_AI_CONTEXT_MESSAGES;
delete process.env.KASSIST_AI_COOLDOWN_MS;
delete process.env.KASSIST_LLM_SYSTEM_PROMPT;

const { getAiConfig, updateAiConfig } = await import('../src/ai-config.mjs?test=config');

test.after(() => {
  delete process.env.KASSIST_AI_PERSIST_CONFIG;
  delete process.env.KASSIST_AI_AUTOREPLY;
  delete process.env.KASSIST_LLM_PROVIDER;
  delete process.env.KASSIST_LLM_FALLBACKS;
  delete process.env.KASSIST_LLM_URL;
  delete process.env.KASSIST_LLM_MODEL;
  delete process.env.KASSIST_LLM_TIMEOUT_MS;
  delete process.env.KASSIST_AI_CONTEXT_MESSAGES;
  delete process.env.KASSIST_AI_COOLDOWN_MS;
  delete process.env.KASSIST_LLM_SYSTEM_PROMPT;
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
