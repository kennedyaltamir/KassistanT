import fs from "node:fs";

const yaml = fs.readFileSync("docs/protocols/openapi.yaml", "utf8");

const requiredPaths = [
  ["GET", "/health"],
  ["GET", "/ready"],
  ["GET", "/webhooks/whatsapp"],
  ["POST", "/webhooks/whatsapp"],
  ["POST", "/v1/devices/enrollment/start"],
  ["POST", "/v1/devices/enrollment/complete"],
  ["POST", "/v1/devices/enrollment/cancel"],
  ["POST", "/v1/devices/revoke"],
  ["POST", "/v1/devices/rotate"],
  ["GET", "/v1/devices/{device_id}/status"],
];

for (const [method, path] of requiredPaths) {
  const pathBlock = yaml.split(`\n  ${path}:`, 2)[1];
  if (!pathBlock) throw new Error(`Missing OpenAPI path: ${path}`);
  if (!new RegExp(`\\n    ${method.toLowerCase()}:`).test(pathBlock)) {
    throw new Error(`Missing OpenAPI operation: ${method} ${path}`);
  }
}

const operationIds = [...yaml.matchAll(/^      operationId:\s*(\S+)/gm)].map((m) => m[1]);
if (new Set(operationIds).size !== operationIds.length) {
  throw new Error("Duplicate operationId detected");
}

if (!yaml.includes("openapi: 3.1.0")) throw new Error("OpenAPI version marker missing");
if (!yaml.includes("responses:")) throw new Error("OpenAPI responses section missing");

console.log("KassisT documentation route checks passed");
