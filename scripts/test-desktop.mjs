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

run("node", ["--test", ...jsTests], root);
run("pnpm", ["exec", "tsx", "--test", ...tsTests], desktop);

function run(command, args, cwd) {
  if (process.platform === "win32") {
    const commandLine = [command, ...args].map(toCmdArg).join(" ");
    const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", commandLine], {
      cwd,
      stdio: "inherit"
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
    return;
  }

  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function toCmdArg(value) {
  if (/^[A-Za-z0-9_./:=?-]+$/.test(value)) return value;
  return `"${String(value).replaceAll('"', '\\"')}"`;
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
