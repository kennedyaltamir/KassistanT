import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const desktop = path.join(root, "apps", "desktop");
const testFile = path.join(desktop, "electron", "providers", "llm", "llm-provider.test.ts");
const tsxCli = path.join(desktop, "node_modules", "tsx", "dist", "cli.mjs");

const result = spawnSync(process.execPath, [tsxCli, "--test", testFile], {
  cwd: desktop,
  stdio: "inherit",
  shell: false
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
