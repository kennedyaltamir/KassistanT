import assert from 'node:assert/strict';
import test from 'node:test';
import { generateGroqReply } from '../src/llm-groq.mjs';

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('Groq adapter calls the OpenAI-compatible chat completions endpoint', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.authorization, 'Bearer test-key');

    const body = JSON.parse(options.body);
    assert.equal(body.model, 'openai/gpt-oss-20b');
    assert.equal(body.stream, false);
    assert.deepEqual(body.messages, [
      { role: 'system', content: 'Seja objetivo.' },
      { role: 'user', content: 'Oi' },
    ]);

    return new Response(JSON.stringify({
      choices: [{ message: { role: 'assistant', content: 'Olá! Como posso ajudar?' } }],
    }), { status: 200 });
  };

  const reply = await generateGroqReply({
    credential: 'test-key',
    model: 'openai/gpt-oss-20b',
    messages: [
      { role: 'system', content: 'Seja objetivo.' },
      { role: 'user', content: 'Oi' },
    ],
    timeoutMs: 1000,
  });

  assert.equal(reply, 'Olá! Como posso ajudar?');
});

test('Groq adapter reports provider errors without exposing the credential', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: { message: 'invalid api key' },
  }), { status: 401 });

  await assert.rejects(
    () => generateGroqReply({
      credential: 'super-secret-test-key',
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: 'Oi' }],
      timeoutMs: 1000,
    }),
    error => {
      assert.match(error.message, /Groq LLM request failed \(401\): invalid api key/);
      assert.doesNotMatch(error.message, /super-secret-test-key/);
      return true;
    },
  );
});

test('Groq adapter rejects missing credentials before network access', async () => {
  globalThis.fetch = async () => {
    throw new Error('network call must not happen');
  };

  await assert.rejects(
    () => generateGroqReply({
      credential: '',
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: 'Oi' }],
      timeoutMs: 1000,
    }),
    /Groq API key is not configured/,
  );
});
