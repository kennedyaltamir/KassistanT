import test from 'node:test';
import assert from 'node:assert/strict';

const { CREDENTIAL_DEFINITIONS, listCredentialStatus } = await import('../src/credentials.mjs?test=definitions');

test('credential registry contains every requested provider field', () => {
  const keys = CREDENTIAL_DEFINITIONS.map(item => item.key);
  assert.deepEqual(keys, [
    'NVIDIA_API_KEY',
    'GROQ_API_KEY',
    'MISTRAL_API_KEY',
    'COHERE_API_KEY',
    'CEREBRAS_API_KEY',
    'HUGGINGFACE_API_KEY',
    'PENROUTER_API_KEY',
    'MODELSCOPE_API_KEY',
    'CLOUDFLARE_API_KEY',
    'CLOUDFLARE_ACCOUNT_ID',
    'GITHUB_TOKEN',
    'SAMBANOVA_API_KEY',
  ]);
});

test('credential status never exposes secret values', () => {
  const status = listCredentialStatus();
  for (const item of status) {
    assert.equal(typeof item.key, 'string');
    assert.equal(typeof item.configured, 'boolean');
    assert.equal('value' in item, false);
    assert.equal('secretValue' in item, false);
  }
});
