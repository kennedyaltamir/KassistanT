import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const desktop = path.join(root, "apps", "desktop");
const domain = path.join(root, "packages", "domain");
const desktopTsx = path.join(desktop, "node_modules", "tsx", "dist", "cli.mjs");

const jsTests = [];
for (const file of walkFiles(path.join(root, "tests"))) {
  if (file.endsWith(".test.mjs")) jsTests.push(file);
}
jsTests.push(path.join(desktop, "electron", "database", "runtime.test.cjs"));

const tsTests = [
  path.join(domain, "src", "foundation.test.ts"),
  path.join(domain, "src", "order.test.ts"),
  path.join(desktop, "electron", "database", "database.test.ts"),
  path.join(desktop, "electron", "database", "product-order-persistence.test.ts"),
  path.join(desktop, "electron", "infrastructure", "inbox-outbox", "runtime.test.ts"),
  path.join(desktop, "electron", "infrastructure", "inbox", "p0-001b-runtime.test.ts"),
  path.join(desktop, "electron", "infrastructure", "outbox", "p0-001b-runtime.test.ts"),
  path.join(desktop, "electron", "infrastructure", "outbox", "p0-001b-recovery.test.ts")
];

run("node", ["--test", ...jsTests], root);
runTsTests();

function runTsTests() {
  if (!isFile(desktopTsx)) {
    throw new Error(`Unable to resolve local desktop tsx CLI: ${desktopTsx}`);
  }

  const result = spawnSync(process.execPath, [desktopTsx, "--test", ...tsTests], {
    cwd: desktop,
    stdio: "inherit",
    shell: false
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function isFile(file) {
  try {
    return require("node:fs").statSync(file).isFile();
  } catch {
    return false;
  }
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
