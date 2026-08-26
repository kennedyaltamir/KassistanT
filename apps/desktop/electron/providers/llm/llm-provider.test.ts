import { strict as assert } from "node:assert";
import { test } from "node:test";
import { executeProviderChat } from "./provider-runtime.js";
import { LLMProviderError, type LLMProvider, type LLMRequest } from "./contracts.js";

const request: LLMRequest = {
  request_id: "req-001",
  messages: [{ role: "user", content: "oi" }],
  model_profile: {
    id: "profile-default",
    provider: "test-provider",
    model: "external-model-id",
    allowed_use_case: "conversation",
    capabilities: ["TEXT"],
    timeout_ms: 50,
    fallback_profile_ids: []
  },
  context: [
    {
      source_id: "context-1",
      source_type: "USER_CONTENT",
      version: "v1",
      content_hash: "hash-1"
    }
  ],
  prompt_provenance: {
    prompt_id: "prompt.conversation",
    prompt_version: "1.0.0",
    configuration_version: "config-1",
    model_profile_id: "profile-default",
    resolved_at: "2026-08-26T01:00:00.000Z",
    context_version: "context-v1"
  },
  response_format: { type: "text" },
  timeout_ms: 50
};

function mockProvider(overrides: Partial<LLMProvider> = {}): LLMProvider {
  return {
    provider_id: "test-provider",
    async chat(input) {
      return {
        request_id: input.request_id,
        provider: input.model_profile.provider,
        model: input.model_profile.model,
        content: { type: "text", content: "ok" },
        finish_reason: "stop",
        raw_provider_metadata: { provider_observed: true }
      };
    },
    ...overrides
  };
}

test("accepts typed request and preserves request/profile/provenance identity", async () => {
  const provider = mockProvider();
  const response = await executeProviderChat(provider, request);

  assert.equal(response.request_id, request.request_id);
  assert.equal(response.provider, request.model_profile.provider);
  assert.equal(response.model, request.model_profile.model);
  assert.deepEqual(response.content, { type: "text", content: "ok" });
  assert.equal(request.prompt_provenance.prompt_version, "1.0.0");
  assert.equal(request.model_profile.id, "profile-default");
});

test("maps provider failures to a deterministic provider error", async () => {
  const provider = mockProvider({
    async chat() {
      throw new Error("backend unavailable");
    }
  });

  await assert.rejects(
    executeProviderChat(provider, request),
    (error: unknown) => {
      assert.ok(error instanceof LLMProviderError);
      assert.equal(error.code, "PROVIDER_ERROR");
      assert.equal(error.request_id, request.request_id);
      assert.equal(error.retryable, true);
      return true;
    }
  );
});

test("maps timeout deterministically", async () => {
  const provider = mockProvider({
    async chat() {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { request_id: request.request_id, provider: "test-provider", model: "external-model-id", content: { type: "text", content: "late" }, finish_reason: "stop" };
    }
  });

  await assert.rejects(
    executeProviderChat(provider, { ...request, timeout_ms: 10 }),
    (error: unknown) => {
      assert.ok(error instanceof LLMProviderError);
      assert.equal(error.code, "TIMEOUT");
      assert.equal(error.request_id, request.request_id);
      assert.equal(error.retryable, true);
      return true;
    }
  );
});

test("rejects invalid request deterministically", async () => {
  await assert.rejects(
    executeProviderChat(mockProvider(), { ...request, timeout_ms: 0 }),
    (error: unknown) => {
      assert.ok(error instanceof LLMProviderError);
      assert.equal(error.code, "INVALID_REQUEST");
      assert.equal(error.retryable, false);
      return true;
    }
  );
});

test("cancellation is a typed non-retryable failure", async () => {
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    executeProviderChat(mockProvider(), request, { signal: controller.signal }),
    (error: unknown) => {
      assert.ok(error instanceof LLMProviderError);
      assert.equal(error.code, "CANCELLED");
      assert.equal(error.retryable, false);
      return true;
    }
  );
});
