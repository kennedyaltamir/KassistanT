import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCredential } from './credentials.mjs';
import { getProviderForCredential } from './provider-registry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATUS_PATH = path.join(__dirname, '..', 'data', 'credential-validation.json');
const TIMEOUT_MS = 8000;

function loadState() {
  try {
    const value = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function saveState(value) {
  fs.mkdirSync(path.dirname(STATUS_PATH), { recursive: true });
  const tempPath = `${STATUS_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, STATUS_PATH);
}

function classifyHttp(status) {
  if (status === 401 || status === 403) return 'INVALID';
  if (status === 429) return 'UNAVAILABLE';
  if (status >= 500) return 'UNAVAILABLE';
  if (status >= 400) return 'ERROR';
  return 'VALID';
}

async function request(url, credential, provider) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers = {
      accept: 'application/json',
      authorization: `Bearer ${credential}`,
    };
    if (provider.provider === 'github') headers['X-GitHub-Api-Version'] = '2022-11-28';
    const response = await fetch(url, { method: 'GET', headers, signal: controller.signal });
    return classifyHttp(response.status);
  } catch (error) {
    if (error && typeof error === 'object' && error.name === 'AbortError') return 'UNAVAILABLE';
    return 'ERROR';
  } finally {
    clearTimeout(timer);
  }
}

export function getCredentialValidationStatuses() {
  const state = loadState();
  return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, {
    validationStatus: value?.validationStatus ?? 'UNKNOWN',
    lastValidatedAt: typeof value?.lastValidatedAt === 'string' ? value.lastValidatedAt : null,
    error: value?.error ?? null,
  }]));
}

export async function validateCredential(key) {
  const provider = getProviderForCredential(key);
  if (!provider) throw new Error('Unsupported credential');
  if (provider.validation.capability !== 'SUPPORTED') {
    return {
      key,
      provider: provider.provider,
      validationStatus: 'UNAVAILABLE',
      lastValidatedAt: null,
      error: 'Provider validation is not implemented because a canonical validation endpoint is not registered.',
    };
  }

  const credential = getCredential(key);
  if (!credential) {
    return { key, provider: provider.provider, validationStatus: 'NOT_CONFIGURED', lastValidatedAt: null, error: null };
  }

  const validationStatus = await request(provider.validation.endpoint, credential, provider);
  const lastValidatedAt = new Date().toISOString();
  const error = validationStatus === 'VALID' ? null : validationStatus === 'INVALID' ? 'Provider rejected the credential.' : 'Provider validation could not be completed.';
  const state = loadState();
  state[key] = { validationStatus, lastValidatedAt, error };
  saveState(state);
  console.log(`[KassisT Credential] validation=${validationStatus} provider=${provider.provider}`);
  return { key, provider: provider.provider, validationStatus, lastValidatedAt, error };
}

export function invalidateCredentialStatus(key) {
  const state = loadState();
  delete state[key];
  saveState(state);
}
