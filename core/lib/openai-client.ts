import OpenAI from 'openai';
import type { AgentLevel } from '../types/index.js';

const DEFAULT_MODELS = {
  companyHead: 'gpt-5.2',
  deptHead: 'gpt-5-mini',
  subAgent: 'gpt-5-mini',
  summarizer: 'gpt-5-nano',
  codex: 'gpt-5.2-codex',
  debug: 'gpt-5.2-pro',
};

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export function getModelForAgent(
  agentLevel: AgentLevel,
  projectModels?: Record<string, string>
): string {
  const envModels = {
    companyHead: process.env.OPENAI_MODEL_COMPANY_HEAD,
    deptHead: process.env.OPENAI_MODEL_DEPT_HEAD,
    subAgent: process.env.OPENAI_MODEL_SUB_AGENT,
  };

  // Priority: project config > env vars > defaults
  if (projectModels) {
    if (agentLevel === 'companyHead' && projectModels.companyHead) {
      return projectModels.companyHead;
    }
    if (agentLevel === 'deptHead' && projectModels.deptHead) {
      return projectModels.deptHead;
    }
    if (agentLevel === 'subAgent' && projectModels.subAgent) {
      return projectModels.subAgent;
    }
  }

  if (envModels[agentLevel]) {
    return envModels[agentLevel]!;
  }

  return DEFAULT_MODELS[agentLevel];
}

export function getSummarizerModel(projectModels?: Record<string, string>): string {
  if (projectModels?.summarizer) {
    return projectModels.summarizer;
  }
  return process.env.OPENAI_MODEL_SUMMARIZER || DEFAULT_MODELS.summarizer;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
}

export async function createChatCompletion(
  options: ChatCompletionOptions
): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: options.model,
    messages: options.messages,
    max_completion_tokens: options.maxTokens ?? 16000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  return content;
}

export interface ApiCallLog {
  timestamp: string;
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Approximate costs per 1M tokens (will need updating as pricing changes)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-5.2': { input: 5.0, output: 15.0 },
    'gpt-5.2-pro': { input: 10.0, output: 30.0 },
    'gpt-5-mini': { input: 0.5, output: 1.5 },
    'gpt-5-nano': { input: 0.1, output: 0.3 },
    'gpt-5.2-codex': { input: 7.5, output: 22.5 },
    'gpt-4.1': { input: 2.0, output: 8.0 },
    'gpt-4.1-mini': { input: 0.3, output: 1.0 },
    'gpt-4.1-nano': { input: 0.1, output: 0.3 },
  };

  const modelPricing = pricing[model] || { input: 2.5, output: 10.0 };
  const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
  const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

  return inputCost + outputCost;
}
