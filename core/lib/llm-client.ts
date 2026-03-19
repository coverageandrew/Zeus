/**
 * Unified LLM Client
 * Provides a consistent interface for chat completions and tool calling
 * across all supported providers (OpenAI, Anthropic, Google)
 * 
 * IMPORTANT: Vercel AI SDK is OPTIONAL. If not installed, falls back to direct API calls.
 */

import { z } from 'zod';
import { createLLMProvider, LLMConfig, getModelForLevel, type ProviderConfig } from './llm-provider.js';
import type { AgentLevel } from '../types/index.js';

// Try to import Vercel AI SDK - it's optional
let generateText: typeof import('ai').generateText | null = null;
try {
  const ai = await import('ai');
  generateText = ai.generateText;
} catch {
  console.warn('[LLM Client] Vercel AI SDK not available, using direct API fallback');
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ToolDefinition {
  description: string;
  parameters: z.ZodObject<any>;
  execute: (args: any) => Promise<any>;
}

export interface ChatOptions {
  config: LLMConfig;
  agentLevel: AgentLevel;
  messages: ChatMessage[];
  tools?: Record<string, ToolDefinition>;
}

export interface ChatResult {
  text: string;
  toolCalls: Array<{
    toolName: string;
    args: Record<string, any>;
    result: any;
  }>;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

/**
 * Direct API fallback when Vercel SDK is not available
 */
async function chatWithDirectAPI(
  providerConfig: ProviderConfig,
  model: string,
  messages: ChatMessage[]
): Promise<ChatResult> {
  const { provider, apiKey } = providerConfig;
  
  let endpoint = '';
  let headers: Record<string, string> = {};
  let body: Record<string, unknown> = {};
  
  if (provider === 'anthropic') {
    endpoint = 'https://api.anthropic.com/v1/messages';
    headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
    const systemMsg = messages.find(m => m.role === 'system');
    const otherMsgs = messages.filter(m => m.role !== 'system');
    body = {
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemMsg?.content || '',
      messages: otherMsgs.map(m => ({ role: m.role, content: m.content })),
    };
  } else if (provider === 'google') {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`;
    headers = { 'Content-Type': 'application/json' };
    const systemMsg = messages.find(m => m.role === 'system');
    const otherMsgs = messages.filter(m => m.role !== 'system');
    body = {
      systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
      contents: otherMsgs.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    };
  } else {
    // OpenAI (default)
    endpoint = providerConfig.baseURL || 'https://api.openai.com/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    body = {
      model: model || 'gpt-4o',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    };
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json() as Record<string, any>;
  
  // Extract response based on provider
  let text = '';
  let usage: { inputTokens: number; outputTokens: number; totalTokens: number } | undefined = undefined;
  
  if (provider === 'anthropic') {
    text = data.content?.[0]?.text || '';
    usage = data.usage ? {
      inputTokens: data.usage.input_tokens || 0,
      outputTokens: data.usage.output_tokens || 0,
      totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
    } : undefined;
  } else if (provider === 'google') {
    text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    text = data.choices?.[0]?.message?.content || '';
    usage = data.usage ? {
      inputTokens: data.usage.prompt_tokens || 0,
      outputTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0,
    } : undefined;
  }
  
  return {
    text,
    toolCalls: [], // Direct API doesn't support tool calls in this simple implementation
    usage,
    finishReason: 'stop',
  };
}

/**
 * Execute a chat completion with optional tool calling
 * Uses Vercel AI SDK if available, falls back to direct API calls
 */
export async function chat(options: ChatOptions): Promise<ChatResult> {
  const { config, agentLevel, messages } = options;
  const model = getModelForLevel(agentLevel, config);

  // If Vercel SDK is available and no tools needed, use it
  if (generateText) {
    try {
      const provider = createLLMProvider(config.provider);
      
      const generateOptions: any = {
        model: provider(model),
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      // Add tools if provided
      if (options.tools) {
        const sdkTools: Record<string, any> = {};
        for (const [name, def] of Object.entries(options.tools)) {
          sdkTools[name] = {
            description: def.description,
            parameters: def.parameters,
            execute: def.execute,
          };
        }
        generateOptions.tools = sdkTools;
      }

      const result = await generateText(generateOptions);

      const toolCallResults: Array<{ toolName: string; args: Record<string, any>; result: any }> = [];
      if ((result as any).toolCalls) {
        for (const tc of (result as any).toolCalls) {
          toolCallResults.push({
            toolName: tc.toolName,
            args: tc.args || {},
            result: tc.result,
          });
        }
      }

      return {
        text: result.text,
        toolCalls: toolCallResults,
        usage: result.usage ? {
          inputTokens: (result.usage as any).inputTokens || (result.usage as any).promptTokens || 0,
          outputTokens: (result.usage as any).outputTokens || (result.usage as any).completionTokens || 0,
          totalTokens: (result.usage as any).totalTokens || 0,
        } : undefined,
        finishReason: result.finishReason,
      };
    } catch (error) {
      console.warn('[LLM Client] Vercel SDK failed, falling back to direct API:', error);
      // Fall through to direct API
    }
  }

  // Fallback to direct API calls
  console.log(`[LLM Client] Using direct API for ${config.provider.provider}/${model}`);
  return chatWithDirectAPI(config.provider, model, messages);
}

/**
 * Simple chat completion without tools
 */
export async function simpleChat(
  config: LLMConfig,
  agentLevel: AgentLevel,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const result = await chat({
    config,
    agentLevel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  return result.text;
}

/**
 * Chat with tool calling - runs until completion or max steps
 */
export async function chatWithTools(
  config: LLMConfig,
  agentLevel: AgentLevel,
  systemPrompt: string,
  userMessage: string,
  tools: Record<string, ToolDefinition>
): Promise<ChatResult> {
  return chat({
    config,
    agentLevel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    tools,
  });
}

/**
 * Stream a chat completion (for real-time UI updates)
 */
export async function* streamChat(options: ChatOptions): AsyncGenerator<string> {
  // Note: For streaming, we'd use streamText from 'ai'
  // For now, we'll yield the full response
  const result = await chat(options);
  yield result.text;
}

/**
 * Parse JSON from LLM output (handles markdown code blocks)
 */
export function parseJsonFromOutput<T>(output: string): T | null {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : output.trim();

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    // Try to find JSON object or array in the output
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    const match = objectMatch || arrayMatch;

    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Re-export types for convenience
export type { LLMConfig, LLMProvider, ProviderConfig, ModelConfig } from './llm-provider.js';
export { createDefaultLLMConfig, calculateCost, getDefaultModels } from './llm-provider.js';
