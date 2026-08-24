const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..', '..', '..');
const gatewayDir = path.join(root, 'gateway');
const screenshotPath = path.join(root, 'TESTES', 'RESULTADOS', 'llm-settings-ui.png');
const gatewayUrl = 'http://127.0.0.1:3210';

let gateway = null;
let window = null;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function gatewayJson(pathname, options = {}) {
  const response = await fetch(`${gatewayUrl}${pathname}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Gateway ${options.method || 'GET'} ${pathname} failed with HTTP ${response.status}`);
  return body;
}

async function waitForGateway() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${gatewayUrl}/health`);
      if (response.ok) return;
    } catch {}
    await delay(500);
  }
  throw new Error('Gateway did not become healthy within 30 seconds');
}

function startGateway() {
  gateway = spawn(process.execPath, ['src/main.mjs'], {
    cwd: gatewayDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  gateway.stdout.on('data', chunk => process.stdout.write(`[gateway] ${chunk}`));
  gateway.stderr.on('data', chunk => process.stderr.write(`[gateway] ${chunk}`));
  gateway.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) process.stderr.write(`Gateway exited with code ${code} (${signal || 'no-signal'})\n`);
  });
}

async function verifyGatewayContracts() {
  const health = await gatewayJson('/health');
  if (health.status !== 'ok') throw new Error(`Unexpected gateway health: ${JSON.stringify(health)}`);

  const settingsBefore = await gatewayJson('/api/llm/settings');
  const persistedSettings = await gatewayJson('/api/llm/settings', {
    method: 'PUT',
    body: JSON.stringify({ autoUpdateEnabled: false, intervalHours: 2 }),
  });
  if (persistedSettings.autoUpdateEnabled !== false || persistedSettings.intervalHours !== 2) {
    throw new Error(`LLM settings persistence failed: ${JSON.stringify(persistedSettings)}`);
  }

  const settingsAfter = await gatewayJson('/api/llm/settings');
  if (settingsAfter.autoUpdateEnabled !== false || settingsAfter.intervalHours !== 2) {
    throw new Error(`LLM settings reload failed: ${JSON.stringify(settingsAfter)}`);
  }

  const models = await gatewayJson('/api/llm/models');
  if (typeof models.reachable !== 'boolean' || !Array.isArray(models.models)) {
    throw new Error(`Invalid LLM inventory contract: ${JSON.stringify(models)}`);
  }

  const credentials = await gatewayJson('/api/credentials');
  if (!Array.isArray(credentials.credentials)) throw new Error('Credential status contract is invalid');
  if (credentials.credentials.some(item => 'value' in item || 'secretValue' in item || 'plainValue' in item)) {
    throw new Error('Credential response exposed a secret field');
  }

  const unsupportedValidation = await gatewayJson('/api/credentials/validate', {
    method: 'POST',
    body: JSON.stringify({ key: 'PENROUTER_API_KEY' }),
  });
  if (unsupportedValidation.validationStatus !== 'UNAVAILABLE') {
    throw new Error(`Unsupported provider validation was not explicit: ${JSON.stringify(unsupportedValidation)}`);
  }

  await gatewayJson('/api/llm/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsBefore),
  });
}

async function verifySettingsPage() {
  const indexPath = path.join(root, 'apps', 'desktop', 'src', 'index.html');
  window = new BrowserWindow({
    show: false,
    width: 1280,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(root, 'apps', 'desktop', 'electron', 'preload.cjs'),
    },
  });

  await window.loadFile(indexPath);
  await delay(1500);

  const result = await window.webContents.executeJavaScript(`(async () => {
    const button = document.querySelector('[data-page="settings"]');
    if (!button) return { ok: false, reason: 'settings navigation missing' };
    button.click();
    await new Promise(resolve => setTimeout(resolve, 1800));
    const text = document.body.innerText;
    const required = [
      'Modelos de Linguagem e Chaves de API',
      'Modelos de Linguagem',
      'Atualização Automática',
      'Chaves de API'
    ];
    const staticFallbackPresent = text.includes('Nenhuma configuração persistente é exposta sem contrato aprovado.');
    const passwordInputs = document.querySelectorAll('input[type="password"][data-credential-key]').length;
    const refreshButton = Boolean(document.querySelector('#llm-settings-refresh'));
    const autoSaveButton = Boolean(document.querySelector('#llm-auto-save'));
    const modelInventory = Boolean(document.querySelector('section h3'));
    return {
      ok: required.every(item => text.includes(item)) && !staticFallbackPresent && passwordInputs > 0 && refreshButton && autoSaveButton && modelInventory,
      title: document.querySelector('#page-title')?.textContent || null,
      required: required.map(item => [item, text.includes(item)]),
      staticFallbackPresent,
      passwordInputs,
      refreshButton,
      autoSaveButton,
      modelInventory,
    };
  })()`);

  if (!result.ok) throw new Error(`Settings UI verification failed: ${JSON.stringify(result)}`);

  const testKey = 'PENROUTER_API_KEY';
  const testValue = `E2E_TEST_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const credentialResult = await window.webContents.executeJavaScript(`(async () => {
    const input = document.querySelector('[data-credential-key="${testKey}"]');
    const save = document.querySelector('[data-credential-save="${testKey}"]');
    if (!input || !save) return { ok: false, reason: 'credential controls missing' };
    input.value = ${JSON.stringify(testValue)};
    save.click();
    await new Promise(resolve => setTimeout(resolve, 1200));
    const status = await fetch('http://127.0.0.1:3210/api/credentials').then(response => response.json());
    const item = status.credentials.find(value => value.key === '${testKey}');
    return {
      ok: Boolean(item?.configured) && !document.body.innerText.includes(${JSON.stringify(testValue)}),
      configured: Boolean(item?.configured),
      leakedToBody: document.body.innerText.includes(${JSON.stringify(testValue)}),
    };
  })()`);
  if (!credentialResult.ok) throw new Error(`Credential save/isolation verification failed: ${JSON.stringify(credentialResult)}`);

  const removed = await gatewayJson(`/api/credentials?key=${encodeURIComponent(testKey)}`, { method: 'DELETE' });
  if (removed.configured !== false) throw new Error(`Credential cleanup failed: ${JSON.stringify(removed)}`);

  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  const image = await window.webContents.capturePage();
  fs.writeFileSync(screenshotPath, image.toPNG());
  console.log(`Settings UI verification passed: ${JSON.stringify(result)}`);
  console.log(`Credential boundary verification passed: configured=true, secret_exposed=false, removed=true`);
  console.log(`Screenshot: ${screenshotPath}`);
}

async function cleanup() {
  if (window && !window.isDestroyed()) window.destroy();
  if (gateway && !gateway.killed) {
    gateway.kill();
    await delay(500);
  }
  if (app.isReady()) app.quit();
}

process.on('unhandledRejection', error => {
  console.error(error);
  cleanup().finally(() => process.exit(1));
});

app.whenReady().then(async () => {
  try {
    startGateway();
    await waitForGateway();
    await verifyGatewayContracts();
    await verifySettingsPage();
    await cleanup();
    process.exit(0);
  } catch (error) {
    console.error(error);
    await cleanup();
    process.exit(1);
  }
});
