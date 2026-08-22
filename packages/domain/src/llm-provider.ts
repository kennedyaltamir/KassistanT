export interface LLMProvider {
  chat(input: unknown): Promise<unknown>;
  healthCheck(): Promise<{ available: boolean }>;
  discoverModels(): Promise<readonly string[]>;
  selectModel(model: string): Promise<void>;
}
