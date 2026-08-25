import test from 'node:test';
import assert from 'node:assert/strict';
import { PROVIDER_REGISTRY, getCredentialDefinitions, getProviderDefinition } from '../src/provider-registry.mjs';

test('provider registry contains every required provider plus the real chat runtimes', () => {
  assert.deepEqual(
    PROVIDER_REGISTRY.map(item => item.provider),
    ['ollama_local', 'nvidia', 'groq', 'mistral', 'cohere', 'cerebras', 'huggingface', 'penrouter', 'modelscope', 'cloudflare', 'github', 'sambanova']
  );
});

test('provider credential fields are canonical', () => {
  assert.deepEqual(getCredentialDefinitions().map(item => item.key), [
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
  assert.equal(getProviderDefinition('cloudflare').credentialKeys.length, 2);
  assert.equal(getCredentialDefinitions().find(item => item.key === 'CLOUDFLARE_ACCOUNT_ID').secret, false);
});

test('runtime capability distinguishes chat inference from credential validation', () => {
  assert.equal(getProviderDefinition('ollama_local').runtimeCapability, 'CHAT');
  assert.equal(getProviderDefinition('groq').runtimeCapability, 'CHAT');
  for (const provider of ['mistral', 'cohere', 'huggingface', 'github']) {
    assert.equal(getProviderDefinition(provider).runtimeCapability, 'CREDENTIAL_VALIDATION_ONLY');
  }
});

test('unverified providers remain explicitly unavailable', () => {
  for (const provider of ['nvidia', 'cerebras', 'penrouter', 'modelscope', 'cloudflare', 'sambanova']) {
    const definition = getProviderDefinition(provider);
    assert.equal(definition.availability, 'UNAVAILABLE');
    assert.equal(definition.validation.capability, 'UNAVAILABLE');
    assert.equal(definition.validation.endpoint, null);
  }
});
