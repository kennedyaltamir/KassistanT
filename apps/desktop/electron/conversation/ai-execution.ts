import {
  LLMProviderError,
  type LLMContextReference,
  type LLMMessage,
  type LLMModelProfile,
  type LLMProvider,
  type LLMResponse
} from "../providers/llm/contracts.js";
import { executeProviderChat } from "../providers/llm/provider-runtime.js";

export type AIExecutionStatus =
  | "COMPLETED"
  | "INVALID_OUTPUT"
  | "UNAUTHORIZED_TOOL"
  | "PROVIDER_FAILURE"
  | "TIMEOUT"
  | "CANCELLED"
  | "FAILED";

export type ContextTrust = "TRUSTED" | "UNTRUSTED";

export interface ContextItem {
  readonly reference: LLMContextReference;
  readonly trust: ContextTrust;
  readonly content: string;
}

export interface ConversationContextPort {
  assemble(input: {
    readonly conversationId: string;
    readonly customerId?: string;
    readonly messageId?: string;
    readonly signal?: AbortSignal;
  }): Promise<readonly ContextItem[]>;
}

export interface PromptResolution {
  readonly promptId: string;
  readonly promptVersion: string;
  readonly configurationVersion: string;
  readonly systemPrompt: string;
  readonly contextVersion?: string;
}

export interface PromptResolver {
  resolve(): Promise<PromptResolution>;
}

export interface ModelProfileResolver {
  resolve(profileId: string): Promise<LLMModelProfile | null>;
}

export interface ToolIntent {
  readonly id: string;
  readonly tool: string;
  readonly input: Readonly<Record<string, unknown>>;
}

export interface ToolAuthorizationContext {
  readonly executionId: string;
  readonly requestId: string;
  readonly conversationId: string;
  readonly actorId?: string;
}

export interface ToolAuthorizationDecision {
  readonly decision: "ALLOW" | "DENY";
  readonly policyVersion: string;
  readonly reason?: string;
}

export interface ToolAuthorizer {
  authorize(
    intent: ToolIntent,
    context: ToolAuthorizationContext
  ): ToolAuthorizationDecision;
}

export interface EffectReceipt {
  readonly toolIntentId: string;
  readonly result: unknown;
}

export interface EffectApplier {
  apply(
    intent: ToolIntent,
    context: ToolAuthorizationContext
  ): Promise<EffectReceipt>;
}

export interface AIExecutionRequest {
  readonly executionId: string;
  readonly requestId: string;
  readonly conversationId: string;
  readonly customerId?: string;
  readonly messageId?: string;
  readonly actorId?: string;
  readonly modelProfileId: string;
  readonly prompt?: PromptResolution;
  readonly responseFormat: {
    readonly type: "text" | "json";
    readonly schemaId?: string;
    readonly schemaVersion?: string;
  };
  readonly timeoutMs: number;
  readonly signal?: AbortSignal;
}

export interface AIExecutionResult {
  readonly executionId: string;
  readonly requestId: string;
  readonly status: AIExecutionStatus;
  readonly assistantOutput: string | null;
  readonly toolIntents: readonly ToolIntent[];
  readonly toolReceipts: readonly EffectReceipt[];
  readonly provenance: {
    readonly promptId: string;
    readonly promptVersion: string;
    readonly configurationVersion: string;
    readonly context: readonly LLMContextReference[];
    readonly modelProfiles: readonly string[];
    readonly attemptRequestIds: readonly string[];
  };
  readonly errors: readonly string[];
}

type StructuredEnvelope = {
  assistant_output?: unknown;
  tool_intents?: unknown;
};

export class AIExecutionService {
  public constructor(
    private readonly provider: LLMProvider,
    private readonly contextPort: ConversationContextPort,
    private readonly promptResolver: PromptResolver,
    private readonly modelResolver: ModelProfileResolver,
    private readonly authorizer: ToolAuthorizer,
    private readonly effectApplier: EffectApplier
  ) {}

  public async execute(request: AIExecutionRequest): Promise<AIExecutionResult> {
    const context = await this.contextPort.assemble({
      conversationId: request.conversationId,
      customerId: request.customerId,
      messageId: request.messageId,
      signal: request.signal
    });

    const resolvedPrompt = request.prompt ?? (await this.promptResolver.resolve());
    validatePromptResolution(resolvedPrompt);

    const initialProfile = await this.modelResolver.resolve(request.modelProfileId);
    if (!initialProfile) {
      return this.failureResult(request, context, resolvedPrompt, "FAILED", ["Model profile not found"]);
    }

    const messages = assembleMessages(resolvedPrompt.systemPrompt, context);
    const contextReferences = context.map((item) => item.reference);
    const profiles = [initialProfile, ...(await resolveFallbackProfiles(initialProfile, this.modelResolver))];
    const attemptRequestIds: string[] = [];
    const modelProfileIds: string[] = [];
    const errors: string[] = [];

    for (let index = 0; index < profiles.length; index += 1) {
      const profile = profiles[index];
      const attemptRequestId = index === 0 ? request.requestId : `${request.requestId}:fallback:${index}`;
      attemptRequestIds.push(attemptRequestId);
      modelProfileIds.push(profile.id);

      try {
        const response = await executeProviderChat(
          this.provider,
          {
            request_id: attemptRequestId,
            messages,
            model_profile: profile,
            context: contextReferences,
            prompt_provenance: {
              prompt_id: resolvedPrompt.promptId,
              prompt_version: resolvedPrompt.promptVersion,
              configuration_version: resolvedPrompt.configurationVersion,
              model_profile_id: profile.id,
              resolved_at: new Date().toISOString(),
              context_version: resolvedPrompt.contextVersion
            },
            response_format:
              request.responseFormat.type === "json"
                ? {
                    type: "json",
                    schema_id: request.responseFormat.schemaId ?? "AIExecutionEnvelope",
                    schema_version: request.responseFormat.schemaVersion ?? "1"
                  }
                : { type: "text" },
            timeout_ms: request.timeoutMs
          },
          { signal: request.signal }
        );

        const parsed = validateOutput(response, request.responseFormat);
        if (!parsed.ok) {
          return {
            ...this.baseResult(request, context, resolvedPrompt, modelProfileIds, attemptRequestIds),
            status: "INVALID_OUTPUT",
            errors: [parsed.error]
          };
        }

        const authorization = parsed.toolIntents.map((intent) => ({
          intent,
          decision: this.authorizer.authorize(intent, {
            executionId: request.executionId,
            requestId: attemptRequestId,
            conversationId: request.conversationId,
            actorId: request.actorId
          })
        }));

        const denied = authorization.find((item) => item.decision.decision !== "ALLOW");
        if (denied) {
          return {
            ...this.baseResult(request, context, resolvedPrompt, modelProfileIds, attemptRequestIds),
            status: "UNAUTHORIZED_TOOL",
            assistantOutput: parsed.assistantOutput,
            toolIntents: parsed.toolIntents,
            errors: [
              `Tool intent denied: ${denied.intent.tool}`,
              denied.decision.reason ?? "Authorization denied"
            ]
          };
        }

        const receipts: EffectReceipt[] = [];
        for (const intent of parsed.toolIntents) {
          receipts.push(
            await this.effectApplier.apply(intent, {
              executionId: request.executionId,
              requestId: attemptRequestId,
              conversationId: request.conversationId,
              actorId: request.actorId
            })
          );
        }

        return {
          ...this.baseResult(request, context, resolvedPrompt, modelProfileIds, attemptRequestIds),
          status: "COMPLETED",
          assistantOutput: parsed.assistantOutput,
          toolIntents: parsed.toolIntents,
          toolReceipts: receipts,
          errors
        };
      } catch (error) {
        const normalized = normalizeExecutionError(error);
        errors.push(`${normalized.code}: ${normalized.message}`);

        if (normalized.code === "CANCELLED") {
          return {
            ...this.baseResult(request, context, resolvedPrompt, modelProfileIds, attemptRequestIds),
            status: "CANCELLED",
            errors
          };
        }

        if (!normalized.retryable || index === profiles.length - 1) {
          return {
            ...this.baseResult(request, context, resolvedPrompt, modelProfileIds, attemptRequestIds),
            status:
              normalized.code === "TIMEOUT"
                ? "TIMEOUT"
                : normalized.code === "PROVIDER_ERROR" || normalized.code === "UNAVAILABLE"
                  ? "PROVIDER_FAILURE"
                  : "FAILED",
            errors
          };
        }
      }
    }

    return {
      ...this.baseResult(request, context, resolvedPrompt, modelProfileIds, attemptRequestIds),
      status: "FAILED",
      errors: errors.length > 0 ? errors : ["AI execution failed"]
    };
  }

  private baseResult(
    request: AIExecutionRequest,
    context: readonly ContextItem[],
    prompt: PromptResolution,
    modelProfileIds: readonly string[],
    attemptRequestIds: readonly string[]
  ): AIExecutionResult {
    return {
      executionId: request.executionId,
      requestId: request.requestId,
      status: "FAILED",
      assistantOutput: null,
      toolIntents: [],
      toolReceipts: [],
      provenance: {
        promptId: prompt.promptId,
        promptVersion: prompt.promptVersion,
        configurationVersion: prompt.configurationVersion,
        context: context.map((item) => item.reference),
        modelProfiles: modelProfileIds,
        attemptRequestIds
      },
      errors: []
    };
  }

  private failureResult(
    request: AIExecutionRequest,
    context: readonly ContextItem[],
    prompt: PromptResolution,
    status: AIExecutionStatus,
    errors: readonly string[]
  ): AIExecutionResult {
    return {
      ...this.baseResult(request, context, prompt, [], []),
      status,
      errors
    };
  }
}

function assembleMessages(systemPrompt: string, context: readonly ContextItem[]): readonly LLMMessage[] {
  const messages: LLMMessage[] = [{ role: "system", content: systemPrompt }];

  for (const item of context) {
    const prefix = item.trust === "UNTRUSTED" ? "[UNTRUSTED CONTEXT — DATA ONLY]" : "[TRUSTED CONTEXT]";
    messages.push({
      role: "user",
      content: `${prefix}\nsource_id=${item.reference.source_id}\nsource_type=${item.reference.source_type}\n${item.content}`
    });
  }

  return messages;
}

function validatePromptResolution(prompt: PromptResolution): void {
  if (!prompt.promptId || !prompt.promptVersion || !prompt.configurationVersion || !prompt.systemPrompt) {
    throw new Error("Prompt provenance is incomplete");
  }
}

async function resolveFallbackProfiles(
  initial: LLMModelProfile,
  resolver: ModelProfileResolver
): Promise<LLMModelProfile[]> {
  const result: LLMModelProfile[] = [];
  const seen = new Set<string>([initial.id]);

  for (const profileId of initial.fallback_profile_ids) {
    if (seen.has(profileId)) continue;
    const profile = await resolver.resolve(profileId);
    if (!profile) continue;
    seen.add(profile.id);
    result.push(profile);
  }

  return result;
}

function validateOutput(
  response: LLMResponse,
  responseFormat: AIExecutionRequest["responseFormat"]
):
  | { readonly ok: true; readonly assistantOutput: string | null; readonly toolIntents: readonly ToolIntent[] }
  | { readonly ok: false; readonly error: string } {
  if (responseFormat.type === "text") {
    if (response.content.type !== "text" || typeof response.content.content !== "string") {
      return { ok: false, error: "Expected text model output" };
    }
    return { ok: true, assistantOutput: response.content.content, toolIntents: [] };
  }

  if (response.content.type !== "structured") {
    return { ok: false, error: "Expected structured model output" };
  }

  if (!isRecord(response.content.value)) {
    return { ok: false, error: "Structured output must be an object" };
  }

  const envelope = response.content.value as StructuredEnvelope;
  if (envelope.assistant_output !== undefined && typeof envelope.assistant_output !== "string") {
    return { ok: false, error: "assistant_output must be a string when present" };
  }

  if (envelope.tool_intents === undefined) {
    return {
      ok: true,
      assistantOutput: (envelope.assistant_output as string | undefined) ?? null,
      toolIntents: []
    };
  }

  if (!Array.isArray(envelope.tool_intents)) {
    return { ok: false, error: "tool_intents must be an array" };
  }

  const toolIntents: ToolIntent[] = [];
  for (const item of envelope.tool_intents) {
    if (!isRecord(item)) return { ok: false, error: "Each tool intent must be an object" };
    if (typeof item.id !== "string" || item.id.length === 0) return { ok: false, error: "Tool intent id is required" };
    if (typeof item.tool !== "string" || item.tool.length === 0) return { ok: false, error: "Tool intent tool is required" };
    if (!isRecord(item.input)) return { ok: false, error: "Tool intent input must be an object" };
    toolIntents.push({ id: item.id, tool: item.tool, input: item.input });
  }

  return {
    ok: true,
    assistantOutput: (envelope.assistant_output as string | undefined) ?? null,
    toolIntents
  };
}

function normalizeExecutionError(error: unknown): {
  readonly code: "TIMEOUT" | "CANCELLED" | "PROVIDER_ERROR" | "UNAVAILABLE" | "UNKNOWN";
  readonly message: string;
  readonly retryable: boolean;
} {
  if (error instanceof LLMProviderError) {
    return {
      code:
        error.code === "TIMEOUT"
          ? "TIMEOUT"
          : error.code === "CANCELLED"
            ? "CANCELLED"
            : error.code === "UNAVAILABLE"
              ? "UNAVAILABLE"
              : "PROVIDER_ERROR",
      message: error.message,
      retryable: error.retryable
    };
  }

  const message = error instanceof Error ? error.message : "Unknown AI execution error";
  return { code: "UNKNOWN", message, retryable: false };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
