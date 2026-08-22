# Ollama / LLM Contract

Provider boundary: `LLMProvider`; Ollama is the initial local provider direction.
Status: PARTIAL / NOT_IMPLEMENTED.

Capabilities include chat, structured output, optional tool calling, health, model detection and execution limits. LLM output is untrusted; Core validates all business actions. Exact default model is a benchmark/external decision and is not invented here.
