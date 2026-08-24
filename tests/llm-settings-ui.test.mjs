import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = readFileSync(path.join(root, "apps", "desktop", "src", "index.html"), "utf8");
const preload = readFileSync(path.join(root, "apps", "desktop", "electron", "preload.cjs"), "utf8");
const llmSettings = readFileSync(path.join(root, "apps", "desktop", "src", "llm-settings.js"), "utf8");
const credentialSource = readFileSync(path.join(root, "gateway", "src", "credentials.mjs"), "utf8");
const providerRegistry = readFileSync(path.join(root, "gateway", "src", "provider-registry.mjs"), "utf8");

 test("Settings navigation exists in the real desktop page", () => {
  assert.match(indexHtml, /data-page=\"settings\"/);
});

test("preload loads the existing LLM settings renderer module", () => {
  assert.match(preload, /const scripts = \[\"\.\/ai-panel\.js\", \"\.\/llm-settings\.js\"\]/);
  assert.match(preload, /DOMContentLoaded/);
});

test("LLM settings module mounts only on the real Settings page", () => {
  assert.match(llmSettings, /dataset\?\.page === 'settings'/);
  assert.match(llmSettings, /__kassistLlmSettingsStarted/);
});

test("LLM settings module uses the existing Gateway contracts", () => {
  for (const endpoint of [
    "/api/llm/settings",
    "/api/llm/models",
    "/api/llm/models/update",
    "/api/credentials",
    "/api/credentials/validate"
  ]) {
    assert.match(llmSettings, new RegExp(endpoint.replaceAll("/", "\\/")));
  }
});

test("credential UI does not render a stored secret value", () => {
  assert.doesNotMatch(llmSettings, /item\.(secretValue|value)\b/);
  assert.match(llmSettings, /type=\"password\"/);
});

test("credential backend persists ciphertext and exposes only status", () => {
  assert.match(credentialSource, /ProtectedData\]\.Protect/);
  assert.match(credentialSource, /configured: typeof store\[key\] === 'string'/);
  assert.doesNotMatch(credentialSource, /return \{[^}]*value:/s);
});

test("provider registry keeps Cloudflare fields distinct and unsupported providers explicit", () => {
  assert.match(providerRegistry, /CLOUDFLARE_API_KEY/);
  assert.match(providerRegistry, /CLOUDFLARE_ACCOUNT_ID/);
  assert.match(providerRegistry, /provider: 'penrouter',[\s\S]*capability: 'UNAVAILABLE'/);
});
