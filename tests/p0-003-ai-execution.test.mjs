import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("P0-003 AIExecution TypeScript suite", () => {
  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const result = spawnSync(
    command,
    [
      "--filter",
      "@kassist/desktop",
      "exec",
      "tsx",
      "--test",
      "electron/conversation/ai-execution.test.ts"
    ],
    { cwd: path.join(root, "apps", "desktop"), stdio: "inherit", shell: false }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`P0-003 TypeScript suite failed with status ${result.status ?? "unknown"}`);
  }
});
