import {
  LLMProviderError,
  type LLMProvider,
  type LLMRequest,
  type LLMResponse
} from "./contracts.js";

function isLLMProviderError(error: unknown): error is LLMProviderError {
  return error instanceof LLMProviderError;
}

function normalizeProviderError(request: LLMRequest, error: unknown): LLMProviderError {
  if (isLLMProviderError(error)) return error;
  const message = error instanceof Error ? error.message : "Unknown provider error";
  return new LLMProviderError("PROVIDER_ERROR", request.request_id, message, true);
}

export async function executeProviderChat(
  provider: LLMProvider,
  request: LLMRequest,
  options: { readonly signal?: AbortSignal } = {}
): Promise<LLMResponse> {
  if (!request.request_id || !request.prompt_provenance.prompt_id || !request.prompt_provenance.prompt_version) {
    throw new LLMProviderError(
      "INVALID_REQUEST",
      request.request_id || "unknown",
      "request_id and prompt provenance identity are required",
      false
    );
  }

  if (!Number.isInteger(request.timeout_ms) || request.timeout_ms <= 0) {
    throw new LLMProviderError(
      "INVALID_REQUEST",
      request.request_id,
      "timeout_ms must be a positive integer",
      false
    );
  }

  if (options.signal?.aborted) {
    throw new LLMProviderError("CANCELLED", request.request_id, "Provider call cancelled", false);
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  let abortHandler: (() => void) | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new LLMProviderError("TIMEOUT", request.request_id, "Provider call timed out", true));
    }, request.timeout_ms);
  });

  const providerPromise = Promise.resolve().then(() => provider.chat(request));
  const cancellationPromise = options.signal
    ? new Promise<never>((_, reject) => {
        abortHandler = () => reject(new LLMProviderError("CANCELLED", request.request_id, "Provider call cancelled", false));
        options.signal?.addEventListener("abort", abortHandler, { once: true });
      })
    : null;

  try {
    const pending = cancellationPromise
      ? Promise.race([providerPromise, timeoutPromise, cancellationPromise])
      : Promise.race([providerPromise, timeoutPromise]);
    return await pending;
  } catch (error) {
    throw normalizeProviderError(request, error);
  } finally {
    if (timeout) clearTimeout(timeout);
    if (abortHandler && options.signal) options.signal.removeEventListener("abort", abortHandler);
  }
}
