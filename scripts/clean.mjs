#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const target = process.argv[2] ?? ".";
for (const entry of fs.readdirSync(target)) {
  const full = path.join(target, entry);
  if (entry === "node_modules" || entry === ".git") continue;
  if (fs.existsSync(full) && fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, "dist"))) {
    fs.rmSync(path.join(full, "dist"), { recursive: true, force: true });
  }
}
console.log(`clean: ${target}`);
