import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ZEUS_ROOT = path.join(process.cwd(), '..');
const CONFIG_DIR = path.join(ZEUS_ROOT, 'config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'llm-config.json');

// GET /api/config - Get current LLM config
export async function GET() {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(content);
    // Don't return the full API key for security
    return NextResponse.json({
      ...config,
      apiKey: config.apiKey ? '***configured***' : '',
    });
  } catch {
    // Return defaults if no config exists
    return NextResponse.json({
      provider: process.env.LLM_PROVIDER || 'openai',
      model: process.env.LLM_MODEL || 'gpt-4o',
      apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY ? '***configured***' : '',
    });
  }
}

// POST /api/config - Save LLM config from UI Settings
export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model, agentConfigs } = await request.json();
    
    if (!provider) {
      return NextResponse.json({ error: 'provider is required' }, { status: 400 });
    }
    
    // Ensure config directory exists
    try {
      await fs.mkdir(CONFIG_DIR, { recursive: true });
    } catch {
      // Directory might already exist
    }
    
    // Read existing config to preserve API key if not provided
    let existingConfig: Record<string, unknown> = {};
    try {
      const content = await fs.readFile(CONFIG_FILE, 'utf-8');
      existingConfig = JSON.parse(content);
    } catch {
      // No existing config
    }
    
    // Build new config
    const newConfig = {
      provider,
      model: model || existingConfig.model || 'gpt-4o',
      apiKey: apiKey || existingConfig.apiKey || '',
      agentConfigs: agentConfigs || existingConfig.agentConfigs || null,
      updatedAt: new Date().toISOString(),
    };
    
    // Save config
    await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    
    return NextResponse.json({ 
      success: true,
      message: 'Configuration saved',
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}
