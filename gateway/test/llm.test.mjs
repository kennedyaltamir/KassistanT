import test from 'node:test';
import assert from 'node:assert/strict';

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.KASSIST_AI_AUTOREPLY;
  delete process.env.KASSIST_LLM_URL;
  delete process.env.KASSIST_LLM_MODEL;
  delete process.env.KASSIST_LLM_TIMEOUT_MS;
  delete process.env.KASSIST_LLM_SYSTEM_PROMPT;
});

test('local LLM status is disabled by default', async () => {
  const { getLlmStatus } = await import('../src/llm.mjs');
  const status = getLlmStatus();
  assert.equal(status.enabled, false);
  assert.equal(status.baseUrl, 'http://127.0.0.1:11434');
});

test('generateReply calls Ollama chat API and returns assistant content', async () => {
  process.env.KASSIST_AI_AUTOREPLY = 'true';
  process.env.KASSIST_LLM_MODEL = 'test-model';

  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://127.0.0.1:11434/api/chat');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'test-model');
    assert.equal(body.stream, false);
    assert.equal(body.think, false);
    assert.equal(body.messages.at(-1).role, 'user');
    return new Response(JSON.stringify({ message: { role: 'assistant', content: 'Olá! Como posso ajudar?' } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const { generateReply } = await import('../src/llm.mjs?test=generate');
  const reply = await generateReply([{ role: 'user', content: 'Oi' }]);
  assert.equal(reply, 'Olá! Como posso ajudar?');
});

test('generateReply surfaces Ollama HTTP errors', async () => {
  process.env.KASSIST_AI_AUTOREPLY = 'true';
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'model not found' }), {
    status: 404,
    headers: { 'content-type': 'application/json' },
  });

  const { generateReply } = await import('../src/llm.mjs?test=error');
  await assert.rejects(
    () => generateReply([{ role: 'user', content: 'Oi' }]),
    /Local LLM request failed \(404\): model not found/
  );
});
