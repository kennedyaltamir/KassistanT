import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getCredentialDefinitions } from './provider-registry.mjs';

/** @typedef {{ key: string, label: string, provider: string, secret: boolean }} CredentialDefinition */
/** @typedef {Record<string, string>} CredentialStore */
/** @typedef {{ validationStatus?: string, lastValidatedAt?: string | null, error?: string | null }} ValidationStatusRecord */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, '..', 'data', 'credentials.json');

/** @type {CredentialDefinition[]} */
export const CREDENTIAL_DEFINITIONS = getCredentialDefinitions();
const ALLOWED_KEYS = new Set(CREDENTIAL_DEFINITIONS.map(item => item.key));

/** @param {string} key @returns {string} */
function assertKey(key) {
  if (!ALLOWED_KEYS.has(key)) throw new Error(`Unsupported credential: ${key}`);
  return key;
}

/** @returns {CredentialStore} */
function readStore() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

/** @param {CredentialStore} store */
function writeStore(store) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  const tempPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, STORE_PATH);
}

/** @param {'protect' | 'unprotect'} mode @param {string} base64 @returns {string} */
function dpapi(mode, base64) {
  if (process.platform !== 'win32') {
    throw new Error('Secure credential storage requires Windows DPAPI on this build');
  }

  const script = mode === 'protect'
    ? `$input = [Console]::In.ReadToEnd().Trim(); Add-Type -AssemblyName System.Security; $data = [Convert]::FromBase64String($input); $out = [System.Security.Cryptography.ProtectedData]::Protect($data, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($out))`
    : `$input = [Console]::In.ReadToEnd().Trim(); Add-Type -AssemblyName System.Security; $data = [Convert]::FromBase64String($input); $out = [System.Security.Cryptography.ProtectedData]::Unprotect($data, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($out))`;

  try {
    return execFileSync('powershell.exe', [
      '-NoLogo',
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      script,
    ], {
      input: `${base64}\n`,
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 1024 * 1024,
    }).trim();
  } catch {
    throw new Error('Windows credential operation failed');
  }
}

/** @param {string} key @param {unknown} value */
export function setCredential(key, value) {
  assertKey(key);
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error('Credential value is required');
  const encrypted = dpapi('protect', Buffer.from(normalized, 'utf8').toString('base64'));
  const store = readStore();
  store[key] = encrypted;
  writeStore(store);
  console.log(`[KassisT Credential] configured=${key}`);
  return { key, configured: true };
}

/** @param {string} key */
export function deleteCredential(key) {
  assertKey(key);
  const store = readStore();
  delete store[key];
  writeStore(store);
  console.log(`[KassisT Credential] removed=${key}`);
  return { key, configured: false };
}

/** @param {string} key @returns {string | null} */
export function getCredential(key) {
  assertKey(key);
  const encrypted = readStore()[key];
  if (typeof encrypted !== 'string' || !encrypted) return null;
  try {
    const plainBase64 = dpapi('unprotect', encrypted);
    return Buffer.from(plainBase64, 'base64').toString('utf8');
  } catch (error) {
    console.warn(`[KassisT Credential] invalid stored credential key=${key}; reconfiguration required`);
    return null;
  }
}

/** @param {Record<string, ValidationStatusRecord>} validationStatuses */
export function listCredentialStatus(validationStatuses = {}) {
  const store = readStore();
  return CREDENTIAL_DEFINITIONS.map(({ key, label, provider, secret }) => ({
    key,
    label,
    provider,
    secret,
    configured: typeof store[key] === 'string' && store[key].length > 0,
    ...(validationStatuses[key] ?? {
      validationStatus: 'UNKNOWN',
      lastValidatedAt: null,
      error: null,
    }),
  }));
}

export function getCredentialStorePath() {
  return STORE_PATH;
}
