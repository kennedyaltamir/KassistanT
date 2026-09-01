import test from 'node:test';
import assert from 'node:assert/strict';

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.KASSIST_AI_AUTOREPLY;
  delete process.env.KASSIST_AI_PERSIST_CONFIG;
  delete process.env.KASSIST_LLM_URL;
  delete process.env.KASSIST_LLM_MODEL;
  delete process.env.KASSIST_LLM_TIMEOUT_MS;
  delete process.env.KASSIST_LLM_SYSTEM_PROMPT;
  delete process.env.KASSIST_LLM_PROVIDER;
  delete process.env.KASSIST_LLM_FALLBACKS;
});

test('local LLM status is disabled by default', async () => {
  process.env.KASSIST_AI_AUTOREPLY = 'false';
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';
  delete process.env.KASSIST_LLM_URL;
  delete process.env.KASSIST_LLM_MODEL;
  delete process.env.KASSIST_LLM_TIMEOUT_MS;
  delete process.env.KASSIST_LLM_SYSTEM_PROMPT;

  const { getLlmStatus } = await import('../src/llm.mjs?test=default-disabled');
  const status = getLlmStatus();
  assert.equal(status.enabled, false);
  assert.equal(status.baseUrl, 'http://127.0.0.1:11434');
  assert.equal(typeof status.systemPrompt, 'string');
});

test('generateReply calls Ollama chat API and returns assistant content', async () => {
  process.env.KASSIST_AI_AUTOREPLY = 'true';
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';
  process.env.KASSIST_LLM_PROVIDER = 'ollama';
  process.env.KASSIST_LLM_FALLBACKS = '';
  process.env.KASSIST_LLM_MODEL = 'test-model';

  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://127.0.0.1:11434/api/chat');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'test-model');
    assert.equal(body.stream, false);
    assert.equal(body.think, false);
    assert.equal(body.messages[0].role, 'system');
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

test('generateReply applies a per-conversation system prompt override', async () => {
  process.env.KASSIST_AI_AUTOREPLY = 'true';
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';
  process.env.KASSIST_LLM_PROVIDER = 'ollama';
  process.env.KASSIST_LLM_FALLBACKS = '';
  process.env.KASSIST_LLM_MODEL = 'test-model';

  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.messages[0].role, 'system');
    assert.equal(body.messages[0].content, 'Use linguagem comercial e objetiva.');
    assert.equal(body.messages.filter(message => message.role === 'system').length, 1);
    return new Response(JSON.stringify({ message: { role: 'assistant', content: 'Resposta controlada' } }), { status: 200 });
  };

  const { generateReply } = await import('../src/llm.mjs?test=override');
  const reply = await generateReply([{ role: 'user', content: 'Oi' }], {
    systemPrompt: 'Use linguagem comercial e objetiva.',
  });
  assert.equal(reply, 'Resposta controlada');
});

test('generateReply surfaces Ollama HTTP errors without invoking fallback providers', async () => {
  process.env.KASSIST_AI_AUTOREPLY = 'true';
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';
  process.env.KASSIST_LLM_PROVIDER = 'ollama';
  process.env.KASSIST_LLM_FALLBACKS = '';
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ error: 'model not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  };

  const { generateReply } = await import('../src/llm.mjs?test=error');
  await assert.rejects(
    () => generateReply([{ role: 'user', content: 'Oi' }]),
    /All configured LLM providers failed: ollama: HTTP 404: model not found/
  );
  assert.equal(calls, 1);
});
