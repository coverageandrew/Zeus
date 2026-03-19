import { Agent } from '@openai/agents';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  readProductSpecTool,
  writeApiRequirementsTool,
  readApiRequirementsTool,
} from '../tools/intake-tools.js';

const ZEUS_ROOT = process.cwd();

/**
 * Load instructions from the api_analyzer_agent.md file (if exists)
 */
async function loadApiAnalyzerInstructions(): Promise<string> {
  const filePath = path.join(ZEUS_ROOT, 'agents', 'api_analyzer_agent.md');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return getDefaultApiAnalyzerInstructions();
  }
}

/**
 * Default instructions for the API Analyzer Agent
 */
function getDefaultApiAnalyzerInstructions(): string {
  return `# API Analyzer Agent

You are the API Analyzer Agent. Your job is to analyze a project's PRODUCT_SPEC.md and determine ALL external API keys, credentials, and configurations that will be needed for the project to function.

## Your Mission

Read the PRODUCT_SPEC.md and identify every external service, API, or credential the project will need. Create a comprehensive API_REQUIREMENTS.md file that tells the user exactly what they need to configure.

## You Run Automatically

You are triggered automatically when a user confirms they are ready to begin a project. You run in parallel with the Company Head handoff. Your job is purely analytical - read the spec, determine requirements, write the file.
`;
}

/**
 * Create the API Analyzer Agent
 */
export async function createApiAnalyzerAgent(): Promise<Agent> {
  const baseInstructions = await loadApiAnalyzerInstructions();

  const enhancedInstructions = `${baseInstructions}

---

## Tool Usage

1. **read_product_spec** - Read the PRODUCT_SPEC.md to understand what the project needs
2. **write_api_requirements** - Write the API_REQUIREMENTS.md with all identified requirements
3. **read_api_requirements** - Read existing requirements if you need to update them

## Analysis Process

1. Call read_product_spec to get the full project specification
2. Analyze the spec for ANY features that require external services
3. Call write_api_requirements with ALL identified requirements

## What to Look For

Analyze the PRODUCT_SPEC.md and identify requirements based on features:

### Payment & Commerce
- "payments", "checkout", "billing", "subscriptions", "pricing" → **Stripe**
  - STRIPE_SECRET_KEY (api_key, required)
  - STRIPE_PUBLISHABLE_KEY (api_key, required)
  - STRIPE_WEBHOOK_SECRET (webhook, required if using webhooks)

### Email & Notifications
- "email", "notifications", "transactional email", "newsletters" → **SendGrid/Resend**
  - SENDGRID_API_KEY or RESEND_API_KEY (api_key, required)
- "push notifications" → **OneSignal/Firebase**
  - ONESIGNAL_APP_ID, ONESIGNAL_API_KEY

### Communication
- "SMS", "phone verification", "2FA via phone" → **Twilio**
  - TWILIO_ACCOUNT_SID (api_key, required)
  - TWILIO_AUTH_TOKEN (api_key, required)
  - TWILIO_PHONE_NUMBER (other, required)

### Authentication & Users
- "authentication", "login", "signup", "users", "accounts" → **Supabase/Auth0/Clerk**
  - If Supabase: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
  - If Auth0: AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
  - If Clerk: CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
  - If custom: JWT_SECRET, SESSION_SECRET

### Database
- "database", "data storage", "persistence" → **Supabase/PlanetScale/Neon**
  - DATABASE_URL (database_url, required)
  - If Supabase: included with auth keys above

### File Storage
- "file uploads", "images", "documents", "media", "storage" → **Cloudinary/S3/Supabase Storage**
  - If Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  - If S3: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
  - If Supabase: included with Supabase keys

### Maps & Location
- "maps", "location", "addresses", "geocoding", "directions" → **Google Maps/Mapbox**
  - GOOGLE_MAPS_API_KEY or MAPBOX_ACCESS_TOKEN (api_key, required)

### AI & ML
- "AI", "chat", "GPT", "OpenAI", "language model", "embeddings" → **OpenAI**
  - OPENAI_API_KEY (api_key, required)

### Analytics
- "analytics", "tracking", "metrics", "events" → **Mixpanel/PostHog/Amplitude**
  - MIXPANEL_TOKEN or POSTHOG_API_KEY (api_key, optional but recommended)

### Search
- "search", "full-text search", "autocomplete" → **Algolia/Meilisearch**
  - ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_SEARCH_KEY

### Video & Media
- "video", "streaming", "video uploads" → **Mux/Cloudinary**
  - MUX_TOKEN_ID, MUX_TOKEN_SECRET

### Social & OAuth
- "Google login", "GitHub login", "social auth" → OAuth credentials
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

### Deployment & Hosting
- If Vercel mentioned: VERCEL_TOKEN (optional, for CI/CD)
- If using preview URLs: NEXT_PUBLIC_SITE_URL

### Standard Requirements
Always include if applicable:
- NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL (for absolute URLs)
- NODE_ENV (other, usually auto-set)

## Output

After analysis, call write_api_requirements with the complete list. Include:
- service: The service name (e.g., "Stripe")
- type: api_key, oauth, webhook, database_url, or other
- envVariable: The exact env var name (e.g., "STRIPE_SECRET_KEY")
- description: What this is used for in the project
- required: true/false
- docsUrl: Link to the service's API key documentation
- notes: Any special setup instructions

## Important

- Be thorough - missing an API key means the user's app won't work
- Include documentation URLs so users know where to get credentials
- Mark things as required only if the feature won't work without them
- This file will be updated by other agents if they discover additional requirements during development
`;

  return new Agent({
    name: 'ApiAnalyzerAgent',
    instructions: enhancedInstructions,
    model: process.env.OPENAI_MODEL_SUB_AGENT || 'gpt-4o-mini',
    tools: [
      readProductSpecTool,
      writeApiRequirementsTool,
      readApiRequirementsTool,
    ],
  });
}

/**
 * Run the API Analyzer Agent on a project
 * This is called in parallel when user confirms "ready to begin"
 */
export async function analyzeProjectApis(projectId: string): Promise<{
  success: boolean;
  message: string;
  requirementsPath?: string;
}> {
  try {
    const { run } = await import('@openai/agents');
    const agent = await createApiAnalyzerAgent();
    
    const prompt = `Analyze the project "${projectId}" and determine all API requirements.

1. First, call read_product_spec with projectId: "${projectId}"
2. Analyze the spec thoroughly for ALL external services needed
3. Call write_api_requirements with the complete list of requirements

Be thorough - the user needs to know every API key they need to configure.`;

    const result = await run(agent, prompt, { maxTurns: 10 });
    
    return {
      success: true,
      message: 'API requirements analyzed and documented',
      requirementsPath: `projects/${projectId}/API_REQUIREMENTS.md`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to analyze API requirements: ${error}`,
    };
  }
}
