const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const { startPersistenceServer } = require("./database/runtime.cjs");

let persistence = null;
let gatewayProcess = null;

async function selectProductImage() {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Imagens", extensions: ["jpg", "jpeg", "png", "webp", "gif"] }]
  });
  if (result.canceled || result.filePaths.length === 0) return { canceled: true };

  const source = result.filePaths[0];
  const extension = path.extname(source).toLowerCase();
  const supported = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
  if (!supported.has(extension)) throw new Error("Unsupported product image format");

  const targetDirectory = path.join(app.getPath("userData"), "products", "images");
  fs.mkdirSync(targetDirectory, { recursive: true });
  const target = path.join(targetDirectory, `${crypto.randomUUID()}${extension}`);
  await fs.promises.copyFile(source, target, fs.constants.COPYFILE_EXCL);
  return { canceled: false, imageReference: target };
}

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 960,
    minHeight: 620,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  window.loadFile(path.join(__dirname, "../src/index.html"));
  window.webContents.on("did-finish-load", () => {
    try {
      const featureUiPath = path.join(__dirname, "../src/assistant-products-ui.js");
      const featureUi = fs.readFileSync(featureUiPath, "utf8");
      void window.webContents.executeJavaScript(featureUi, true);
    } catch (error) {
      console.error(
        "[KassisT Desktop] failed to load feature UI:",
        error instanceof Error ? error.stack ?? error.message : error
      );
    }
  });
}

function startGateway() {
  if (process.env.KASSIST_GATEWAY_AUTOSTART === "false") return;

  const repositoryRoot = path.resolve(__dirname, "../../..");
  const gatewayDirectory = path.join(repositoryRoot, "gateway");
  if (!fs.existsSync(path.join(gatewayDirectory, "package.json"))) {
    console.warn(`[KassisT Desktop] Gateway directory not found: ${gatewayDirectory}`);
    return;
  }

  const isWindows = process.platform === "win32";
  const command = isWindows ? (process.env.ComSpec || "cmd.exe") : "pnpm";
  const args = isWindows ? ["/d", "/s", "/c", "pnpm dev"] : ["dev"];

  gatewayProcess = spawn(command, args, {
    cwd: gatewayDirectory,
    env: {
      ...process.env,
      KASSIST_PERSISTENCE_URL:
        process.env.KASSIST_PERSISTENCE_URL ?? "http://127.0.0.1:3211/internal/v1/whatsapp/message",
      KASSIST_WA_AUTH_DIR:
        process.env.KASSIST_WA_AUTH_DIR ?? path.join(app.getPath("userData"), "whatsapp", "auth")
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: false,
    shell: false
  });

  gatewayProcess.stdout?.on("data", (chunk) => process.stdout.write(`[KassisT Gateway] ${String(chunk)}`));
  gatewayProcess.stderr?.on("data", (chunk) => process.stderr.write(`[KassisT Gateway] ${String(chunk)}`));
  gatewayProcess.on("error", (error) => console.error("[KassisT Desktop] failed to start gateway:", error.message));
  gatewayProcess.on("exit", (code, signal) => {
    if (code !== 0 && signal !== "SIGTERM") console.error(`[KassisT Desktop] gateway exited code=${code} signal=${signal ?? "none"}`);
    gatewayProcess = null;
  });
}

function shutdownRuntime() {
  if (gatewayProcess) {
    gatewayProcess.kill();
    gatewayProcess = null;
  }
  if (persistence) {
    persistence.close();
    persistence = null;
  }
}

app.whenReady().then(() => {
  ipcMain.handle("kassist:select-product-image", selectProductImage);
  try {
    persistence = startPersistenceServer({ migrationsPath: path.resolve(__dirname, "../database/migrations") });
    startGateway();
  } catch (error) {
    console.error(
      "[KassisT Desktop] failed to initialize runtime:",
      error instanceof Error ? error.stack ?? error.message : error
    );
    app.quit();
    return;
  }

  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("before-quit", shutdownRuntime);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});