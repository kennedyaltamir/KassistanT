import fs from "node:fs";

const yaml = fs.readFileSync("docs/protocols/openapi.yaml", "utf8");
const requiredPaths = [["GET","/health"],["GET","/ready"],["GET","/webhooks/whatsapp"],["POST","/webhooks/whatsapp"],["POST","/v1/devices/enrollment/start"],["POST","/v1/devices/enrollment/complete"],["POST","/v1/devices/enrollment/cancel"],["POST","/v1/devices/revoke"],["POST","/v1/devices/rotate"],["GET","/v1/devices/{device_id}/status"]];
for (const [method, path] of requiredPaths) {
  const block = yaml.split(`\n  ${path}:`, 2)[1];
  if (!block || !new RegExp(`\\n    ${method.toLowerCase()}:`).test(block)) throw new Error(`Missing operation: ${method} ${path}`);
}
const ids = [...yaml.matchAll(/^      operationId:\s*(\S+)/gm)].map((m) => m[1]);
if (new Set(ids).size !== ids.length) throw new Error("Duplicate operationId");
if (!yaml.includes("openapi: 3.1.0")) throw new Error("Missing OpenAPI version");
console.log(`Documentation checks passed: ${ids.length} operations`);
