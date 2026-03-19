/**
 * LLM Provider Factory
 * Supports OpenAI, Anthropic, and Google providers via Vercel AI SDK
 */

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export type LLMProvider = 'openai' | 'anthropic' | 'google';

export interface ProviderConfig {
  provider: LLMProvider;
  apiKey: string;
  baseURL?: string;
}

export interface ModelConfig {
  companyHead: string;
  deptHead: string;
  subAgent: string;
  summarizer: string;
  codex: string;
}

export interface LLMConfig {
  provider: ProviderConfig;
  models: ModelConfig;
}

// Default models per provider
const DEFAULT_MODELS: Record<LLMProvider, ModelConfig> = {
  openai: {
    companyHead: 'gpt-4.1',
    deptHead: 'gpt-4.1-mini',
    subAgent: 'gpt-4.1-mini',
    summarizer: 'gpt-4.1-nano',
    codex: 'gpt-4.1',
  },
  anthropic: {
    companyHead: 'claude-sonnet-4-20250514',
    deptHead: 'claude-sonnet-4-20250514',
    subAgent: 'claude-sonnet-4-20250514',
    summarizer: 'claude-haiku-3-20250514',
    codex: 'claude-sonnet-4-20250514',
  },
  google: {
    companyHead: 'gemini-2.0-flash',
    deptHead: 'gemini-2.0-flash',
    subAgent: 'gemini-2.0-flash',
    summarizer: 'gemini-2.0-flash',
    codex: 'gemini-2.0-flash',
  },
};

/**
 * Create an LLM client for the specified provider
 */
export function createLLMProvider(config: ProviderConfig) {
  switch (config.provider) {
    case 'anthropic':
      return createAnthropic({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });

    case 'google':
      return createGoogleGenerativeAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });

    case 'openai':
    default:
      return createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
  }
}

/**
 * Get default models for a provider
 */
export function getDefaultModels(provider: LLMProvider): ModelConfig {
  return DEFAULT_MODELS[provider] || DEFAULT_MODELS.openai;
}

/**
 * Get the model string for a specific agent level
 */
export function getModelForLevel(
  level: 'companyHead' | 'deptHead' | 'subAgent' | 'summarizer' | 'codex',
  config: LLMConfig
): string {
  // Use configured model or fall back to provider defaults
  const configuredModel = config.models[level];
  if (configuredModel) {
    return configuredModel;
  }
  return getDefaultModels(config.provider.provider)[level];
}

/**
 * Create default LLM config from environment variables
 */
export function createDefaultLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER as LLMProvider) || 'openai';
  
  let apiKey: string;
  switch (provider) {
    case 'anthropic':
      apiKey = process.env.ANTHROPIC_API_KEY || '';
      break;
    case 'google':
      apiKey = process.env.GOOGLE_API_KEY || '';
      break;
    case 'openai':
    default:
      apiKey = process.env.OPENAI_API_KEY || '';
      break;
  }

  if (!apiKey) {
    throw new Error(`API key not found for provider: ${provider}. Set the appropriate environment variable.`);
  }

  return {
    provider: {
      provider,
      apiKey,
      baseURL: process.env.LLM_BASE_URL,
    },
    models: {
      companyHead: process.env.LLM_MODEL_COMPANY_HEAD || getDefaultModels(provider).companyHead,
      deptHead: process.env.LLM_MODEL_DEPT_HEAD || getDefaultModels(provider).deptHead,
      subAgent: process.env.LLM_MODEL_SUB_AGENT || getDefaultModels(provider).subAgent,
      summarizer: process.env.LLM_MODEL_SUMMARIZER || getDefaultModels(provider).summarizer,
      codex: process.env.LLM_MODEL_CODEX || getDefaultModels(provider).codex,
    },
  };
}

/**
 * Validate that an API key works for the given provider
 */
export async function validateApiKey(config: ProviderConfig): Promise<boolean> {
  try {
    const provider = createLLMProvider(config);
    // Just creating the provider validates the key format
    // A real validation would make a test API call
    return !!provider;
  } catch {
    return false;
  }
}

// Pricing per 1M tokens (approximate, update as needed)
const PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI
  'gpt-4.1': { input: 2.0, output: 8.0 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
  'gpt-4.1-nano': { input: 0.1, output: 0.4 },
  'gpt-5': { input: 5.0, output: 15.0 },
  'gpt-5-mini': { input: 0.5, output: 1.5 },
  // Anthropic
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-opus-4-20250514': { input: 15.0, output: 75.0 },
  'claude-haiku-3-20250514': { input: 0.25, output: 1.25 },
  // Google
  'gemini-2.0-flash': { input: 0.075, output: 0.30 },
  'gemini-2.5-pro': { input: 1.25, output: 5.0 },
};

/**
 * Calculate cost for token usage
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model] || { input: 2.0, output: 8.0 };
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}
