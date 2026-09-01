import assert from "node:assert/strict";
import test from "node:test";
import { createHttpServer } from "../src/http.mjs";

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
      ok: true,
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
