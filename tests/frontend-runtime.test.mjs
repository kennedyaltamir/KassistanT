import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const main = readFileSync(path.join(root, "apps/desktop/electron/main.cjs"), "utf8");
const preload = readFileSync(path.join(root, "apps/desktop/electron/preload.cjs"), "utf8");
const renderer = readFileSync(path.join(root, "apps/desktop/src/frontend-runtime.js"), "utf8");

test("desktop window keeps Electron isolation enabled", () => {
  assert.match(main, /contextIsolation:\s*true/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /sandbox:\s*true/);
});

test("preload exposes only explicit runtime capability", () => {
  assert.match(preload, /contextBridge\.exposeInMainWorld\("kassist"/);
  assert.match(preload, /runtime:\s*\{/);
  assert.match(preload, /ipcRenderer\.invoke\("kassist:runtime-info"\)/);
  assert.doesNotMatch(preload, /require\(["']node:fs["']\)/);
  assert.doesNotMatch(preload, /require\(["']node:child_process["']\)/);
});

test("renderer runtime diagnostic consumes IPC and does not invent business state", () => {
  assert.match(renderer, /window\.kassist\?\.runtime/);
  assert.match(renderer, /getInfo\(\)/);
  assert.match(renderer, /data-source.*electron-ipc/);
  assert.doesNotMatch(renderer, /price|total|discount|stock/i);
});
