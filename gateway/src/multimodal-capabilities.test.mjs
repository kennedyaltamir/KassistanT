import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeImageBuffer, clearOllamaCapabilityCache, getOllamaModelCapabilities } from './multimodal.mjs';

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  clearOllamaCapabilityCache();
});

test('capability registry reads vision from Ollama /api/show', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://127.0.0.1:11434/api/show');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'gemma3');
    return new Response(JSON.stringify({ capabilities: ['completion', 'vision'] }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const value = await getOllamaModelCapabilities({ model: 'gemma3' });
  assert.equal(value.status, 'MODEL_AVAILABLE');
  assert.equal(value.vision, 'SUPPORTED');
  assert.equal(value.text, 'SUPPORTED');
  assert.equal(value.audio, 'UNSUPPORTED');
});

test('vision processing refuses a model that does not advertise vision', async () => {
  let chatCalled = false;
  globalThis.fetch = async (url) => {
    if (url.endsWith('/api/show')) return new Response(JSON.stringify({ capabilities: ['completion'] }), { status: 200 });
    chatCalled = true;
    return new Response(JSON.stringify({ message: { content: 'should not run' } }), { status: 200 });
  };

  const value = await analyzeImageBuffer(Buffer.from('image'), { model: 'text-only', mimeType: 'image/jpeg' });
  assert.equal(value.status, 'UNAVAILABLE');
  assert.equal(value.errorCode, 'VISION_UNSUPPORTED');
  assert.equal(chatCalled, false);
});

test('vision processing rejects non-image MIME even when model supports vision', async () => {
  globalThis.fetch = async (url) => {
    if (url.endsWith('/api/show')) return new Response(JSON.stringify({ capabilities: ['completion', 'vision'] }), { status: 200 });
    throw new Error('chat must not be called');
  };

  const value = await analyzeImageBuffer(Buffer.from('audio'), { model: 'vision-model', mimeType: 'audio/ogg' });
  assert.equal(value.status, 'FAILED');
  assert.equal(value.errorCode, 'INVALID_MIME');
});

test('structured vision output is parsed and confidence is bounded', async () => {
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/api/show')) return new Response(JSON.stringify({ capabilities: ['completion', 'vision'] }), { status: 200 });
    assert.equal(url, 'http://127.0.0.1:11434/api/chat');
    const body = JSON.parse(options.body);
    assert.equal(body.stream, false);
    assert.equal(body.options.temperature, 0);
    assert.ok(Array.isArray(body.messages[0].images));
    return new Response(JSON.stringify({ message: { content: JSON.stringify({ description: 'Produto visível', detected_text: 'Açaí', possible_products: ['açaí 500ml'], commercial_information: ['preço visível não confirmado'], confidence: 0.87, inferred_fields: ['possible_product'], confirmed_fields: [] }) } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const value = await analyzeImageBuffer(Buffer.from('image'), { model: 'gemma3', mimeType: 'image/jpeg' });
  assert.equal(value.status, 'COMPLETED');
  assert.equal(value.text, 'Produto visível');
  assert.equal(value.confidence, 0.87);
  assert.equal(value.provider, 'ollama');
});
