#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const forbidden = ["AKIA", "BEGIN PRIVATE KEY", "ghp_", "xoxb-", "client_secret"];
const roots = process.argv.slice(2);
const files = roots.length ? roots : ["."];
let violations = [];

function walk(p) {
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(p)) walk(path.join(p, entry));
    return;
  }
  if (p.includes("node_modules") || p.includes(".git")) return;
  const text = fs.readFileSync(p, "utf8");
  for (const marker of forbidden) if (text.includes(marker)) violations.push(`${p}: ${marker}`);
}
for (const root of files) if (fs.existsSync(root)) walk(root);
if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("lint: bootstrap checks passed");
