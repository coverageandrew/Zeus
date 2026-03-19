import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');
const ZEUS_ROOT = path.join(process.cwd(), '..');

// Get LLM config from runtime config file or env vars
async function getLLMConfig(): Promise<{ provider: string; apiKey: string; model: string } | null> {
  // First try runtime config (set from UI Settings)
  try {
    const configPath = path.join(ZEUS_ROOT, 'config', 'llm-config.json');
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content);
    if (config.apiKey) {
      return config;
    }
  } catch {
    // Config file doesn't exist, fall through to env vars
  }
  
  // Fall back to environment variables
  const provider = process.env.LLM_PROVIDER || 'openai';
  let apiKey = '';
  
  switch (provider) {
    case 'anthropic':
      apiKey = process.env.ANTHROPIC_API_KEY || '';
      break;
    case 'google':
      apiKey = process.env.GOOGLE_API_KEY || '';
      break;
    default:
      apiKey = process.env.OPENAI_API_KEY || '';
  }
  
  if (!apiKey) {
    return null;
  }
  
  return {
    provider,
    apiKey,
    model: process.env.LLM_MODEL || 'gpt-4o',
  };
}

// Simple chat completion without SDK dependency
async function callLLM(
  config: { provider: string; apiKey: string; model: string },
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const { provider, apiKey, model } = config;
  
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
    body = {
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    };
  } else if (provider === 'google') {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`;
    headers = { 'Content-Type': 'application/json' };
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
    };
  } else {
    // OpenAI (default)
    endpoint = 'https://api.openai.com/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    body = {
      model: model || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
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
  
  const data = await response.json();
  
  // Extract response based on provider
  if (provider === 'anthropic') {
    return data.content?.[0]?.text || '';
  } else if (provider === 'google') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    return data.choices?.[0]?.message?.content || '';
  }
}

const INTAKE_SYSTEM_PROMPT = `You are the Intake Agent for Zeus, an AI-powered development orchestration framework.

Your job is to gather project requirements from users through conversation.

## Your Process

1. **Listen** - Understand what the user wants to build
2. **Clarify** - Ask questions about:
   - Core features and functionality
   - Technical requirements (database, APIs, integrations)
   - UI preferences (colors, style, component libraries)
   - What is explicitly OUT of scope
3. **Document** - Summarize what you've learned
4. **Confirm** - Show the user the current understanding and ask for feedback
5. **Iterate** - Keep refining until the user is satisfied

## Important Rules

- Ask about SPECIFIC things: features, colors, APIs, dependencies, tech stack
- Do NOT ask generic questions about budget, timeline, or team size
- Be concise but thorough
- After gathering enough info, summarize what you understand

## Response Format

Always respond conversationally. When you have enough information, provide a summary in this format:

**Current Understanding:**
- App Type: [type]
- Core Features: [list]
- Tech Stack: [if discussed]
- UI Style: [if discussed]
- Out of Scope: [if discussed]

Is this accurate? What would you like to add or change?`;

// POST /api/intake - Chat with intake agent
export async function POST(request: NextRequest) {
  try {
    const { projectId, message, history } = await request.json();
    
    if (!projectId || !message) {
      return NextResponse.json({ error: 'projectId and message are required' }, { status: 400 });
    }
    
    const projectDir = path.join(PROJECTS_DIR, projectId);
    
    try {
      await fs.access(projectDir);
    } catch {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Log the conversation
    const intakeLogPath = path.join(projectDir, 'INTAKE_CONVERSATION.md');
    const timestamp = new Date().toISOString();
    const logEntry = `\n## ${timestamp}\n\n**User:** ${message}\n\n`;
    
    try {
      await fs.appendFile(intakeLogPath, logEntry);
    } catch {
      await fs.writeFile(intakeLogPath, `# Intake Conversation Log\n\n---\n${logEntry}`);
    }
    
    // Get LLM config
    const llmConfig = await getLLMConfig();
    
    let response: string;
    let specUpdated = false;
    
    if (!llmConfig) {
      // No API key configured - return helpful message
      response = `⚠️ **No API key configured**

To have a real conversation, please configure your LLM provider:

1. Go to **Settings** (bottom of sidebar)
2. Select your provider (OpenAI, Anthropic, or Google)
3. Enter your API key
4. Click **Save All**

Alternatively, set environment variables:
- \`OPENAI_API_KEY\` for OpenAI
- \`ANTHROPIC_API_KEY\` for Anthropic
- \`GOOGLE_API_KEY\` for Google

Once configured, come back and we can discuss your project!`;
    } else {
      // Build conversation history for LLM
      const messages: Array<{ role: string; content: string }> = [];
      
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({ role: msg.role, content: msg.content });
          }
        }
      }
      
      // Add current message
      messages.push({ role: 'user', content: message });
      
      try {
        response = await callLLM(llmConfig, INTAKE_SYSTEM_PROMPT, messages);
        
        // Check if response contains a summary (indicates spec should be updated)
        if (response.includes('**Current Understanding:**') || response.includes('## Summary')) {
          specUpdated = true;
          
          // Extract and save to PRODUCT_SPEC.md
          const specPath = path.join(projectDir, 'PRODUCT_SPEC.md');
          try {
            let currentSpec = await fs.readFile(specPath, 'utf-8');
            
            // Update the requirements section if it exists
            const summaryMatch = response.match(/\*\*Current Understanding:\*\*([\s\S]*?)(?=\n\n|Is this accurate|$)/);
            if (summaryMatch) {
              const newRequirements = summaryMatch[1].trim();
              
              // Replace placeholder or append
              if (currentSpec.includes('*Requirements will be gathered')) {
                currentSpec = currentSpec.replace(
                  '*Requirements will be gathered during the intake conversation.*',
                  newRequirements
                );
              } else if (currentSpec.includes('## Requirements')) {
                currentSpec = currentSpec.replace(
                  /## Requirements\n\n[\s\S]*?(?=\n##|$)/,
                  `## Requirements\n\n${newRequirements}\n\n`
                );
              }
              
              await fs.writeFile(specPath, currentSpec);
            }
          } catch {
            // Spec file doesn't exist or couldn't be updated
          }
        }
      } catch (error) {
        console.error('LLM call failed:', error);
        response = `I encountered an error connecting to the LLM provider. Please check your API key in Settings.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
    
    // Log assistant response
    await fs.appendFile(intakeLogPath, `**Assistant:** ${response}\n\n---\n`);
    
    // Read current spec
    let specPreview = null;
    try {
      specPreview = await fs.readFile(path.join(projectDir, 'PRODUCT_SPEC.md'), 'utf-8');
    } catch {
      // Spec doesn't exist yet
    }
    
    return NextResponse.json({
      response,
      specUpdated,
      specPreview,
      timestamp,
    });
  } catch (error) {
    console.error('Error in intake chat:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
