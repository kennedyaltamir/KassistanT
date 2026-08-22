#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";

const targetArg = process.argv[2] ?? ".";
const target = path.resolve(process.cwd(), targetArg);
const config = path.join(target, "tsconfig.json");

const result = spawnSync(
  "npx",
  ["tsc", "--noEmit", "--pretty", "false", "-p", config],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

if (result.error) {
  console.error("typecheck: TypeScript toolchain unavailable; install dependencies first.");
  process.exit(1);
}

process.exit(result.status ?? 1);
