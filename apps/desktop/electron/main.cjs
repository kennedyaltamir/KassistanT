require("tsx/cjs");

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { CommerceService } = require("./commerce-service.ts");

let commerceService;

function registerCommerceIpc() {
  commerceService = new CommerceService();

  ipcMain.handle("commerce.products.list", async () => commerceService.listProducts());
  ipcMain.handle("commerce.products.create", async (_event, input) => commerceService.createProduct(input));
  ipcMain.handle("commerce.orders.list", async () => commerceService.listOrders());
  ipcMain.handle("commerce.orders.createDraft", async (_event, input) => commerceService.createDraftOrder(input));
  ipcMain.handle("commerce.orders.confirm", async (_event, input) => commerceService.confirmOrder(input));
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
}

app.whenReady().then(() => {
  registerCommerceIpc();
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("before-quit", async () => {
  if (commerceService) await commerceService.close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
