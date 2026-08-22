#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const target = process.argv[2] ?? ".";
const required = target.includes("desktop")
  ? ["electron/main.cjs", "electron/preload.cjs", "src/index.html"]
  : target.includes("gateway")
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
