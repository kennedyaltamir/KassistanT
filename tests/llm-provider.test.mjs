import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const testFile = path.join(root, "apps", "desktop", "electron", "providers", "llm", "llm-provider.test.ts");

const resolved = process.platform === "win32" && process.env.npm_execpath
  ? { command: process.execPath, args: [process.env.npm_execpath, "exec", "tsx", "--test", testFile] }
  : { command: "pnpm", args: ["exec", "tsx", "--test", testFile] };

const result = spawnSync(resolved.command, resolved.args, {
  cwd: root,
  stdio: "inherit",
  shell: false
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
