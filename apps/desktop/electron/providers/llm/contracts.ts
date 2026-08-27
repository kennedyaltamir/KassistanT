export type LLMMessageRole = "system" | "user" | "assistant" | "tool";

export interface LLMMessage {
  readonly role: LLMMessageRole;
  readonly content: string;
}

export type LLMContextSourceType =
  | "CANONICAL_PROJECT_STATE"
  | "OPERATIONAL_CONTEXT"
  | "USER_CONTENT"
  | "RETRIEVED_KNOWLEDGE"
  | "TRANSIENT_TOOL_RESULT";

export interface LLMContextReference {
  readonly source_id: string;
  readonly source_type: LLMContextSourceType;
  readonly version?: string;
  readonly content_hash?: string;
}

export interface LLMPromptProvenance {
  readonly prompt_id: string;
  readonly prompt_version: string;
  readonly configuration_version: string;
  readonly model_profile_id: string;
  readonly resolved_at: string;
  readonly context_version?: string;
}

export interface LLMModelProfile {
  readonly id: string;
  readonly provider: string;
  readonly model: string;
  readonly allowed_use_case: string;
  readonly capabilities: readonly string[];
  readonly timeout_ms: number;
  readonly fallback_profile_ids: readonly string[];
}

export type LLMResponseFormat =
  | { readonly type: "text" }
  | { readonly type: "json"; readonly schema_id: string; readonly schema_version: string };

export interface LLMRequest {
  readonly request_id: string;
  readonly messages: readonly LLMMessage[];
  readonly model_profile: LLMModelProfile;
  readonly context: readonly LLMContextReference[];
  readonly prompt_provenance: LLMPromptProvenance;
  readonly response_format: LLMResponseFormat;
  readonly timeout_ms: number;
}

export type LLMOutput =
  | { readonly type: "text"; readonly content: string }
  | { readonly type: "structured"; readonly value: unknown };

export interface LLMUsage {
  readonly input_tokens?: number;
  readonly output_tokens?: number;
  readonly total_tokens?: number;
}

export type LLMFinishReason = "stop" | "length" | "tool_call" | "error" | "unknown";

export interface LLMResponse {
  readonly request_id: string;
  readonly provider: string;
  readonly model: string;
  readonly content: LLMOutput;
  readonly finish_reason: LLMFinishReason;
  readonly usage?: LLMUsage;
  readonly raw_provider_metadata?: Readonly<Record<string, unknown>>;
}

export interface LLMHealth {
  readonly available: boolean;
  readonly provider: string;
  readonly checked_at: string;
  readonly message?: string;
}

export type LLMProviderErrorCode =
  | "INVALID_REQUEST"
  | "TIMEOUT"
  | "UNAVAILABLE"
  | "PROVIDER_ERROR"
  | "CANCELLED";

export class LLMProviderError extends Error {
  public readonly code: LLMProviderErrorCode;
  public readonly request_id: string;
  public readonly retryable: boolean;

  public constructor(
    code: LLMProviderErrorCode,
    requestId: string,
    message: string,
    retryable: boolean
  ) {
    super(message);
    this.name = "LLMProviderError";
    this.code = code;
    this.request_id = requestId;
    this.retryable = retryable;
  }
}

export interface LLMProvider {
  readonly provider_id: string;
  chat(input: LLMRequest): Promise<LLMResponse>;
  health?(): Promise<LLMHealth>;
}
