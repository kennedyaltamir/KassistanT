#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const targetArg = process.argv[2] ?? ".";
const target = path.resolve(process.cwd(), targetArg);
const workspaceName = path.basename(target);

const required = workspaceName === "desktop"
  ? ["electron/main.cjs", "electron/preload.cjs", "src/index.html"]
  : workspaceName === "gateway"
    ? ["src/main.mjs", "src/http.mjs", "src/wss.mjs", "src/config.mjs"]
    : [];

for (const file of required) {
  const full = path.join(target, file);
  if (!fs.existsSync(full)) {
    console.error(`build: missing required skeleton file: ${full}`);
    process.exit(1);
  }
}

console.log(`build: ${target} skeleton verified`);
