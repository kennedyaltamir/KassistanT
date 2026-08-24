import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, '..', 'data', 'credentials.json');

export const CREDENTIAL_DEFINITIONS = [
  { key: 'NVIDIA_API_KEY', label: 'NVIDIA', secret: true },
  { key: 'GROQ_API_KEY', label: 'GROQ', secret: true },
  { key: 'MISTRAL_API_KEY', label: 'MISTRAL', secret: true },
  { key: 'COHERE_API_KEY', label: 'COHERE', secret: true },
  { key: 'CEREBRAS_API_KEY', label: 'CEREBRAS', secret: true },
  { key: 'HUGGINGFACE_API_KEY', label: 'Hugging Face', secret: true },
  { key: 'PENROUTER_API_KEY', label: 'PenRouter', secret: true },
  { key: 'MODELSCOPE_API_KEY', label: 'ModelScope', secret: true },
  { key: 'CLOUDFLARE_API_KEY', label: 'Cloudflare API Key', secret: true },
  { key: 'CLOUDFLARE_ACCOUNT_ID', label: 'Cloudflare Account ID', secret: false },
  { key: 'GITHUB_TOKEN', label: 'GitHub Token', secret: true },
  { key: 'SAMBANOVA_API_KEY', label: 'SambaNova', secret: true },
];

const ALLOWED_KEYS = new Set(CREDENTIAL_DEFINITIONS.map(item => item.key));

function assertKey(key) {
  if (!ALLOWED_KEYS.has(key)) throw new Error(`Unsupported credential: ${key}`);
  return key;
}

function readStore() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  const tempPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, STORE_PATH);
}

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
      maxBuffer: 1024 * 1024,
    }).trim();
  } catch (error) {
    throw new Error(`Windows credential operation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function setCredential(key, value) {
  assertKey(key);
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error('Credential value is required');
  const encrypted = dpapi('protect', Buffer.from(normalized, 'utf8').toString('base64'));
  const store = readStore();
  store[key] = encrypted;
  writeStore(store);
  return { key, configured: true };
}

export function deleteCredential(key) {
  assertKey(key);
  const store = readStore();
  delete store[key];
  writeStore(store);
  return { key, configured: false };
}

export function getCredential(key) {
  assertKey(key);
  const encrypted = readStore()[key];
  if (typeof encrypted !== 'string' || !encrypted) return null;
  const plainBase64 = dpapi('unprotect', encrypted);
  return Buffer.from(plainBase64, 'base64').toString('utf8');
}

export function listCredentialStatus() {
  const store = readStore();
  return CREDENTIAL_DEFINITIONS.map(({ key, label, secret }) => ({
    key,
    label,
    secret,
    configured: typeof store[key] === 'string' && store[key].length > 0,
  }));
}

export function getCredentialStorePath() {
  return STORE_PATH;
}
