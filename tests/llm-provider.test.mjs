import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const desktop = path.join(root, "apps", "desktop");
const testFile = path.join(desktop, "electron", "providers", "llm", "llm-provider.test.ts");

function resolvePnpm() {
  if (process.platform !== "win32") {
    return {
      command: "pnpm",
      args: ["exec", "tsx", "--test", testFile],
      cwd: desktop
    };
  }

  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath && /\.(?:cjs|js|mjs)$/i.test(npmExecPath)) {
    return {
      command: process.execPath,
      args: [npmExecPath, "exec", "tsx", "--test", testFile],
      cwd: desktop
    };
  }

  const comspec = process.env.ComSpec || process.env.COMSPEC;
  if (!comspec) {
    throw new Error("Unable to resolve cmd.exe on Windows: ComSpec is unavailable.");
  }

  return {
    command: comspec,
    args: ["/d", "/s", "/c", "pnpm exec tsx --test \"" + testFile + "\""],
    cwd: desktop
  };
}

const resolved = resolvePnpm();
const result = spawnSync(resolved.command, resolved.args, {
  cwd: resolved.cwd,
  stdio: "inherit",
  shell: false
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
