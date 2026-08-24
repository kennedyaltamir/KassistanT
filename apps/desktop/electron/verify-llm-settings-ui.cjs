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
    await new Promise(resolve => setTimeout(resolve, 1500));
    const text = document.body.innerText;
    const required = [
      'Modelos de Linguagem e Chaves de API',
      'Modelos de Linguagem',
      'Atualização Automática',
      'Chaves de API'
    ];
    return {
      ok: required.every(item => text.includes(item)) && !text.includes('Nenhuma configuração persistente é exposta sem contrato aprovado.'),
      title: document.querySelector('#page-title')?.textContent || null,
      required: required.map(item => [item, text.includes(item)]),
      staticFallbackPresent: text.includes('Nenhuma configuração persistente é exposta sem contrato aprovado.'),
      modelEndpointPresent: document.documentElement.innerHTML.includes('/api/llm/models'),
      credentialEndpointPresent: document.documentElement.innerHTML.includes('/api/credentials'),
    };
  })()`);

  if (!result.ok) throw new Error(`Settings UI verification failed: ${JSON.stringify(result)}`);

  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  const image = await window.webContents.capturePage();
  fs.writeFileSync(screenshotPath, image.toPNG());
  console.log(`Settings UI verification passed: ${JSON.stringify(result)}`);
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
    await verifySettingsPage();
    await cleanup();
    process.exit(0);
  } catch (error) {
    console.error(error);
    await cleanup();
    process.exit(1);
  }
});
