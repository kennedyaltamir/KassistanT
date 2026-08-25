import test from 'node:test';
import assert from 'node:assert/strict';

process.env.KASSIST_AI_PERSIST_CONFIG = 'false';

const { getAiConfig, updateAiConfig } = await import('../src/ai-config.mjs?test=config');

test.after(() => {
  delete process.env.KASSIST_AI_PERSIST_CONFIG;
  delete process.env.KASSIST_LLM_PROVIDER;
  delete process.env.KASSIST_LLM_URL;
});

test('local AI configuration uses safe loopback defaults', () => {
  const config = getAiConfig();
  assert.equal(config.provider, 'ollama_local');
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

test('Groq configuration canonicalizes its OpenAI-compatible endpoint', () => {
  const config = updateAiConfig({
    provider: 'groq',
    model: 'openai/gpt-oss-20b',
  });

  assert.equal(config.provider, 'groq');
  assert.equal(config.baseUrl, 'https://api.groq.com/openai/v1');
  assert.equal(config.model, 'openai/gpt-oss-20b');
});

test('AI configuration rejects unknown providers', () => {
  assert.throws(
    () => updateAiConfig({ provider: 'unknown-provider' }),
    /Unsupported LLM provider/
  );
});

test('local AI configuration rejects oversized system prompts', () => {
  assert.throws(
    () => updateAiConfig({ provider: 'ollama_local', systemPrompt: 'x'.repeat(12001) }),
    /12000 characters/
  );
});
