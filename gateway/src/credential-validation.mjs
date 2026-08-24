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
}

export function classifyHttp(status) {
  if (status === 401 || status === 403) return 'INVALID';
  if (status === 429 || status >= 500) return 'UNAVAILABLE';
  if (status >= 400) return 'ERROR';
  return 'VALID';
}

async function request(provider, credential) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers = {
      accept: 'application/json',
      authorization: `Bearer ${credential}`,
    };
    if (provider.provider === 'github') headers['X-GitHub-Api-Version'] = '2022-11-28';
    const response = await fetch(provider.validation.endpoint, {
      method: provider.validation.method ?? 'GET',
      headers,
      signal: controller.signal,
    });
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

export async function validateCredentialValue(key, credential) {
  const provider = getProviderForCredential(key);
  if (!provider) throw new Error('Unsupported credential');
  if (provider.validation.capability !== 'SUPPORTED') {
    return {
      key,
      provider: provider.provider,
      validationStatus: 'UNAVAILABLE',
      lastValidatedAt: null,
      error: 'Provider validation is unavailable because no canonical validation operation is registered.',
    };
  }
  if (!credential) {
    return {
      key,
      provider: provider.provider,
      validationStatus: 'UNKNOWN',
      lastValidatedAt: null,
      error: null,
    };
  }

  const validationStatus = await request(provider, credential);
  const lastValidatedAt = new Date().toISOString();
  const error = validationStatus === 'VALID'
    ? null
    : validationStatus === 'INVALID'
      ? 'Provider rejected the credential.'
      : validationStatus === 'UNAVAILABLE'
        ? 'Provider validation is currently unavailable.'
        : 'Provider validation failed.';
  return { key, provider: provider.provider, validationStatus, lastValidatedAt, error };
}

export async function validateCredential(key) {
  const result = await validateCredentialValue(key, getCredential(key));
  const state = loadState();
  if (result.validationStatus === 'UNKNOWN' && result.lastValidatedAt === null) {
    delete state[key];
  } else {
    state[key] = {
      validationStatus: result.validationStatus,
      lastValidatedAt: result.lastValidatedAt,
      error: result.error,
    };
  }
  saveState(state);
  console.log(`[KassisT Credential] validation=${result.validationStatus} provider=${result.provider}`);
  return result;
}

export function invalidateCredentialStatus(key) {
  const state = loadState();
  delete state[key];
  saveState(state);
}
