// New unified LLM client (Vercel AI SDK - supports OpenAI, Anthropic, Google)
export {
  chat,
  simpleChat,
  chatWithTools,
  streamChat,
  parseJsonFromOutput,
  type ChatMessage,
  type ChatOptions,
  type ChatResult,
  type ToolDefinition,
  type LLMConfig,
  type LLMProvider,
  type ProviderConfig,
  type ModelConfig,
  createDefaultLLMConfig,
  calculateCost,
  getDefaultModels,
} from './llm-client.js';

// LLM Provider factory
export {
  createLLMProvider,
  getModelForLevel,
  validateApiKey,
} from './llm-provider.js';

// Legacy Agents SDK client - kept for compatibility during migration
export {
  Agent,
  run,
  runAgent,
  runAgentForOutput,
  parseJsonFromOutput as parseJsonFromAgentOutput,
  getModelForLevel as getModelForAgentLevel,
  type AgentLevel,
  type AgentRunResult,
} from './agents-client.js';

// Legacy OpenAI client - kept for compatibility during migration
export {
  getOpenAIClient,
  getModelForAgent,
  getSummarizerModel,
  createChatCompletion,
  calculateCost as calculateOpenAICost,
  type ChatMessage as OpenAIChatMessage,
  type ChatCompletionOptions,
  type ApiCallLog,
} from './openai-client.js';

// Core modules
export * from './registry.js';
export * from './memory-store.js';
export {
  loadAgentInstructions,
  loadSSoTContext,
  loadSkillsContext,
  formatProjectConfig,
  formatMemoryContext,
} from './prompt-builder.js';
export * from './agent-caller.js';
export * from './handoff-manager.js';
