/** @typedef {{ provider: string, label: string, credentialKeys: readonly string[], availability: 'AVAILABLE' | 'UNAVAILABLE', validation: { capability: 'SUPPORTED' | 'UNAVAILABLE', method: string | null, endpoint: string | null } }} ProviderDefinition */

/** @type {ProviderDefinition[]} */
const PROVIDER_DEFINITIONS = [
  {
    provider: 'nvidia',
    label: 'NVIDIA',
    credentialKeys: ['NVIDIA_API_KEY'],
    availability: 'UNAVAILABLE',
    validation: { capability: 'UNAVAILABLE', method: null, endpoint: null },
  },
  {
    provider: 'groq',
    label: 'Groq',
    credentialKeys: ['GROQ_API_KEY'],
    availability: 'AVAILABLE',
    validation: { capability: 'SUPPORTED', method: 'GET', endpoint: 'https://api.groq.com/openai/v1/models' },
  },
  {
    provider: 'mistral',
    label: 'Mistral',
    credentialKeys: ['MISTRAL_API_KEY'],
    availability: 'AVAILABLE',
    validation: { capability: 'SUPPORTED', method: 'GET', endpoint: 'https://api.mistral.ai/v1/models' },
  },
  {
    provider: 'cohere',
    label: 'Cohere',
    credentialKeys: ['COHERE_API_KEY'],
    availability: 'AVAILABLE',
    validation: { capability: 'SUPPORTED', method: 'POST', endpoint: 'https://api.cohere.com/v1/check-api-key' },
  },
  {
    provider: 'cerebras',
    label: 'Cerebras',
    credentialKeys: ['CEREBRAS_API_KEY'],
    availability: 'UNAVAILABLE',
    validation: { capability: 'UNAVAILABLE', method: null, endpoint: null },
  },
  {
    provider: 'huggingface',
    label: 'Hugging Face',
    credentialKeys: ['HUGGINGFACE_API_KEY'],
    availability: 'AVAILABLE',
    validation: { capability: 'SUPPORTED', method: 'GET', endpoint: 'https://huggingface.co/api/whoami-v2' },
  },
  {
    provider: 'penrouter',
    label: 'PenRouter',
    credentialKeys: ['PENROUTER_API_KEY'],
    availability: 'UNAVAILABLE',
    validation: { capability: 'UNAVAILABLE', method: null, endpoint: null },
  },
  {
    provider: 'modelscope',
    label: 'ModelScope',
    credentialKeys: ['MODELSCOPE_API_KEY'],
    availability: 'UNAVAILABLE',
    validation: { capability: 'UNAVAILABLE', method: null, endpoint: null },
  },
  {
    provider: 'cloudflare',
    label: 'Cloudflare',
    credentialKeys: ['CLOUDFLARE_API_KEY', 'CLOUDFLARE_ACCOUNT_ID'],
    availability: 'UNAVAILABLE',
    validation: { capability: 'UNAVAILABLE', method: null, endpoint: null },
  },
  {
    provider: 'github',
    label: 'GitHub',
    credentialKeys: ['GITHUB_TOKEN'],
    availability: 'AVAILABLE',
    validation: { capability: 'SUPPORTED', method: 'GET', endpoint: 'https://api.github.com/user' },
  },
  {
    provider: 'sambanova',
    label: 'SambaNova',
    credentialKeys: ['SAMBANOVA_API_KEY'],
    availability: 'UNAVAILABLE',
    validation: { capability: 'UNAVAILABLE', method: null, endpoint: null },
  },
];

/** @type {Map<string, string>} */
const CREDENTIAL_TO_PROVIDER = new Map();
for (const provider of PROVIDER_DEFINITIONS) {
  for (const key of provider.credentialKeys) CREDENTIAL_TO_PROVIDER.set(key, provider.provider);
}

export const PROVIDER_REGISTRY = Object.freeze(PROVIDER_DEFINITIONS.map(item => Object.freeze({
  ...item,
  credentialKeys: Object.freeze([...item.credentialKeys]),
  validation: Object.freeze({ ...item.validation }),
})));

/** @param {string} provider @returns {ProviderDefinition | null} */
export function getProviderDefinition(provider) {
  return PROVIDER_REGISTRY.find(item => item.provider === provider) ?? null;
}

/** @param {string} key @returns {ProviderDefinition | null} */
export function getProviderForCredential(key) {
  const provider = CREDENTIAL_TO_PROVIDER.get(key);
  return provider ? getProviderDefinition(provider) : null;
}

export function getCredentialDefinitions() {
  return PROVIDER_REGISTRY.flatMap(provider => provider.credentialKeys.map(key => ({
    key,
    label: provider.label,
    provider: provider.provider,
    secret: key !== 'CLOUDFLARE_ACCOUNT_ID',
  })));
}
