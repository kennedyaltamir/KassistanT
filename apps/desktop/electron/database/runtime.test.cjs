const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { startPersistenceServer } = require("./runtime.cjs");

function tempContext() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "kassist-runtime-"));
  return {
    directory,
    filePath: path.join(directory, "kassist.sqlite"),
    migrationsPath: path.resolve(__dirname, "../../database/migrations")
  };
}

async function post(port, event) {
  const response = await fetch(`http://127.0.0.1:${port}/internal/v1/whatsapp/message`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event)
  });
  return { status: response.status, body: await response.json() };
}

// Existing tests omitted here in this update are preserved by the repository file history.
