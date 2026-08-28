import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const testFile = path.join(root, "apps", "desktop", "electron", "providers", "llm", "llm-provider.test.ts");

function resolvePnpm() {
  if (process.platform !== "win32") {
    return { command: "pnpm", args: ["exec", "tsx", "--test", testFile] };
  }

  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath && /\.(?:cjs|js|mjs)$/i.test(npmExecPath)) {
    return {
      command: process.execPath,
      args: [npmExecPath, "exec", "tsx", "--test", testFile]
    };
  }

  return {
    command: "pnpm.cmd",
    args: ["exec", "tsx", "--test", testFile]
  };
}

const resolved = resolvePnpm();
const result = spawnSync(resolved.command, resolved.args, {
  cwd: root,
  stdio: "inherit",
  shell: false
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
