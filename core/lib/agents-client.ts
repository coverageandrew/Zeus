import { Agent, run } from '@openai/agents';
import type { LLMModelConfig } from '../types/project.js';

/**
 * Model configuration for different agent levels
 */
const DEFAULT_MODELS: Record<AgentLevel, string> = {
  companyHead: 'gpt-4o',
  deptHead: 'gpt-4o-mini',
  subAgent: 'gpt-4o-mini',
  summarizer: 'gpt-4o-mini',
};

export type AgentLevel = 'companyHead' | 'deptHead' | 'subAgent' | 'summarizer';

/**
 * Get the model for a given agent level
 */
export function getModelForLevel(
  level: AgentLevel,
  projectModels?: LLMModelConfig
): string {
  const envModels: Record<AgentLevel, string | undefined> = {
    companyHead: process.env.OPENAI_MODEL_COMPANY_HEAD,
    deptHead: process.env.OPENAI_MODEL_DEPT_HEAD,
    subAgent: process.env.OPENAI_MODEL_SUB_AGENT,
    summarizer: process.env.OPENAI_MODEL_SUMMARIZER,
  };

  // Priority: project config > env vars > defaults
  if (projectModels?.[level]) {
    return projectModels[level]!;
  }

  if (envModels[level]) {
    return envModels[level]!;
  }

  return DEFAULT_MODELS[level];
}

/**
 * Result from running an agent
 */
export interface AgentRunResult {
  finalOutput: string;
  success: boolean;
}

/**
 * Run an agent with input and return the result
 */
export async function runAgent(
  agent: Agent,
  input: string,
  options?: {
    maxTurns?: number;
  }
): Promise<AgentRunResult> {
  try {
    const result = await run(agent, input, {
      maxTurns: options?.maxTurns ?? 30,
    });
    return {
      finalOutput: result.finalOutput ?? '',
      success: true,
    };
  } catch (error) {
    return {
      finalOutput: `Error: ${error}`,
      success: false,
    };
  }
}

/**
 * Run an agent and extract the final output as a string
 */
export async function runAgentForOutput(
  agent: Agent,
  input: string,
  options?: {
    maxTurns?: number;
  }
): Promise<string> {
  const result = await runAgent(agent, input, options);
  return result.finalOutput;
}

/**
 * Parse JSON from agent output (handles markdown code blocks)
 */
export function parseJsonFromOutput<T>(output: string): T | null {
  // Try to extract JSON from markdown code block
  const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : output;

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

/**
 * Cost calculation (kept for logging/budgeting)
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 2.5, output: 10.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4-turbo': { input: 10.0, output: 30.0 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    'o1': { input: 15.0, output: 60.0 },
    'o1-mini': { input: 3.0, output: 12.0 },
    'o3-mini': { input: 1.1, output: 4.4 },
  };

  const modelPricing = pricing[model] || { input: 2.5, output: 10.0 };
  const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
  const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

  return inputCost + outputCost;
}

export { Agent, run };
