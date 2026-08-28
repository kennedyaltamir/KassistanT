import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createHttpServer } from "../src/http.mjs";
import { createCampaignDispatchRuntime } from "../src/campaign-dispatch.mjs";

async function withServer(server, fn) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");

  try {
    return await fn(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test("GET /health returns healthy status and correlation id", async () => {
  const server = createHttpServer();

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`, {
      headers: { "x-correlation-id": "test-correlation" }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-correlation-id"), "test-correlation");
    assert.deepEqual(body, {
      status: "ok",
      correlation_id: "test-correlation"
    });
  });
});

test("GET /ready returns 200 when all configured checks pass", async () => {
  const server = createHttpServer({
    readinessChecks: { database: () => true }
  });

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/ready`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ready");
    assert.deepEqual(body.checks, { database: { ok: true } });
    assert.equal(typeof body.correlation_id, "string");
  });
});

test("GET /ready returns 503 when a configured check fails", async () => {
  const server = createHttpServer({
    readinessChecks: { database: () => false }
  });

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/ready`);
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.error.code, "not_ready");
    assert.equal(body.error.retryable, true);
    assert.deepEqual(body.checks, { database: { ok: false } });
  });
});

test("unknown routes preserve the canonical error envelope", async () => {
  const server = createHttpServer();

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/unknown`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error.code, "not_found");
    assert.equal(body.error.retryable, false);
    assert.equal(typeof body.error.correlation_id, "string");
    assert.equal(response.headers.get("x-correlation-id"), body.error.correlation_id);
  });
});

test("createHttpServer and health/ready do not create campaign journal", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kassist-http-campaign-"));
  const statePath = path.join(dir, "campaigns.json");
  const previousPath = process.env.KASSIST_CAMPAIGN_STATE_PATH;
  process.env.KASSIST_CAMPAIGN_STATE_PATH = statePath;

  try {
    const server = createHttpServer();
    assert.equal(await fs.stat(statePath).catch((error) => error.code), "ENOENT");

    await withServer(server, async (baseUrl) => {
      const health = await fetch(`${baseUrl}/health`);
      assert.equal(health.status, 200);
      const ready = await fetch(`${baseUrl}/ready`);
      assert.ok([200, 503].includes(ready.status));
      await new Promise((resolve) => setImmediate(resolve));
    });

    assert.equal(await fs.stat(statePath).catch((error) => error.code), "ENOENT");
  } finally {
    if (previousPath === undefined) delete process.env.KASSIST_CAMPAIGN_STATE_PATH;
    else process.env.KASSIST_CAMPAIGN_STATE_PATH = previousPath;
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("createHttpServer accepts an isolated campaign runtime without startup persistence", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "kassist-http-campaign-injected-"));
  const statePath = path.join(dir, "campaigns.json");
  const batchRoot = path.join(dir, "batches");
  const campaignRuntime = createCampaignDispatchRuntime({ statePath, batchRoot });
  const server = createHttpServer({ campaignRuntime });

  try {
    await campaignRuntime.ready;
    assert.equal(await fs.stat(statePath).catch((error) => error.code), "ENOENT");
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(await fs.stat(statePath).catch((error) => error.code), "ENOENT");
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error && error.code !== "ERR_SERVER_NOT_RUNNING" ? reject(error) : resolve())));
    await fs.rm(dir, { recursive: true, force: true });
  }
});
