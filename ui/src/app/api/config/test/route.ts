import { NextRequest, NextResponse } from 'next/server';

// POST /api/config/test - Test LLM connection
export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model } = await request.json();
    
    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 });
    }
    
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
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      };
    } else if (provider === 'google') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`;
      headers = { 'Content-Type': 'application/json' };
      body = {
        contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
        generationConfig: { maxOutputTokens: 10 },
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
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      };
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Invalid API key or configuration';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        // Use default error message
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Connected to ${provider} successfully!` 
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect. Check your API key.' 
    }, { status: 500 });
  }
}
