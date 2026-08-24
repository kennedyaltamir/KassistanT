import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyHttp, validateCredentialValue } from '../src/credential-validation.mjs';

const originalFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = originalFetch; });

test('credential validation classifies authentication responses deterministically', () => {
  assert.equal(classifyHttp(200), 'VALID');
  assert.equal(classifyHttp(401), 'INVALID');
  assert.equal(classifyHttp(403), 'INVALID');
  assert.equal(classifyHttp(429), 'UNAVAILABLE');
  assert.equal(classifyHttp(503), 'UNAVAILABLE');
  assert.equal(classifyHttp(422), 'ERROR');
});

test('credential validation returns sanitized metadata without the credential', async () => {
  const secret = 'test-secret-value';
  let observedAuthorization = null;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.groq.com/openai/v1/models');
    observedAuthorization = options.headers.authorization;
    return new Response(JSON.stringify({ data: [] }), { status: 200 });
  };

  const result = await validateCredentialValue('GROQ_API_KEY', secret);
  assert.equal(observedAuthorization, `Bearer ${secret}`);
  assert.equal(result.validationStatus, 'VALID');
  assert.equal('secret' in result, false);
  assert.equal('token' in result, false);
  assert.equal('apiKey' in result, false);
  assert.equal('secretValue' in result, false);
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test('credential validation exposes unsupported providers as unavailable', async () => {
  const result = await validateCredentialValue('PENROUTER_API_KEY', 'unused-secret');
  assert.equal(result.validationStatus, 'UNAVAILABLE');
  assert.equal(JSON.stringify(result).includes('unused-secret'), false);
});

test('Cohere uses its documented POST validation operation', async () => {
  let request = null;
  globalThis.fetch = async (url, options) => {
    request = { url, method: options.method, authorization: options.headers.authorization };
    return new Response(JSON.stringify({ valid: true }), { status: 200 });
  };

  const result = await validateCredentialValue('COHERE_API_KEY', 'cohere-secret');
  assert.equal(result.validationStatus, 'VALID');
  assert.deepEqual(request, {
    url: 'https://api.cohere.com/v1/check-api-key',
    method: 'POST',
    authorization: 'Bearer cohere-secret',
  });
});
