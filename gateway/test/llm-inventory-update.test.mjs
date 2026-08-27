import test from 'node:test';
import assert from 'node:assert/strict';

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.KASSIST_AI_PERSIST_CONFIG;
});

test('Ollama inventory normalizes real model metadata', async () => {
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';
  globalThis.fetch = async url => {
    assert.equal(url, 'http://127.0.0.1:11434/api/tags');
    return new Response(JSON.stringify({
      models: [{
        name: 'qwen3:8b',
        size: 1234,
        digest: 'sha256:test',
        modified_at: '2026-08-24T00:00:00Z',
        details: { format: 'gguf', family: 'qwen3', parameter_size: '8B', quantization_level: 'Q4_K_M' },
      }],
    }), { status: 200 });
  };

  const { getLocalModelInventory } = await import('../src/llm.mjs?test=inventory');
  const inventory = await getLocalModelInventory();
  assert.equal(inventory.status, 'READY');
  assert.equal(inventory.models[0].name, 'qwen3:8b');
  assert.equal(inventory.models[0].sizeBytes, 1234);
  assert.equal(inventory.models[0].details.quantizationLevel, 'Q4_K_M');
});

test('Ollama inventory reports unavailable deterministically', async () => {
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';
  globalThis.fetch = async () => { throw new Error('network failure'); };

  const { getLocalModelInventory } = await import('../src/llm.mjs?test=inventory-unavailable');
  const inventory = await getLocalModelInventory();
  assert.equal(inventory.status, 'UNAVAILABLE');
  assert.equal(inventory.available, false);
  assert.deepEqual(inventory.models, []);
});

test('single model update performs the real Ollama pull operation', async () => {
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  };

  const { updateLocalModel } = await import('../src/llm.mjs?test=update-single');
  const result = await updateLocalModel('qwen3:8b');
  assert.equal(result.status, 'UPDATED');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'http://127.0.0.1:11434/api/pull');
  assert.deepEqual(JSON.parse(calls[0].options.body), { model: 'qwen3:8b', stream: false });
});

test('bulk model update serializes the batch without false self-concurrency failure', async () => {
  process.env.KASSIST_AI_PERSIST_CONFIG = 'false';
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/api/tags')) {
      return new Response(JSON.stringify({ models: [{ name: 'one' }, { name: 'two' }] }), { status: 200 });
    }
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  };

  const { updateAllLocalModels } = await import('../src/llm.mjs?test=update-all');
  const result = await updateAllLocalModels();
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.updated.map(item => item.model), ['one', 'two']);
  assert.equal(calls.filter(call => call.url.endsWith('/api/pull')).length, 2);
});
