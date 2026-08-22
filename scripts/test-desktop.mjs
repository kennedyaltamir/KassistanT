import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const desktop = path.join(root, "apps", "desktop");
const domain = path.join(root, "packages", "domain");

const jsTests = [];
for (const file of walkFiles(path.join(root, "tests"))) {
  if (file.endsWith(".test.mjs")) jsTests.push(file);
}

const tsTests = [
  path.join(domain, "src", "foundation.test.ts"),
  path.join(desktop, "electron", "database", "database.test.ts")
];

run("node", ["--test", ...jsTests]);
run("pnpm", ["exec", "tsx", "--test", ...tsTests]);

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function walkFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
}
