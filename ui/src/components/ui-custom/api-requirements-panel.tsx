import { useState, useEffect } from 'react';
import { Key, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApiKeyCard } from './api-key-card';
import { filesApi } from '@/lib/api';

interface ApiRequirement {
  name: string;
  envVar: string;
  description: string;
  instructions?: string;
  docUrl?: string;
  currentValue?: string;
  isConfigured: boolean;
}

// Known API key documentation URLs with detailed instructions
const API_DOCS: Record<string, { name: string; description: string; instructions: string; docUrl: string }> = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    name: 'Supabase URL',
    description: 'Your Supabase project URL for database and auth',
    instructions: '1. Go to supabase.com and sign in\n2. Select your project (or create one)\n3. Go to Settings → API\n4. Copy the "Project URL" value',
    docUrl: 'https://supabase.com/dashboard/project/_/settings/api',
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    name: 'Supabase Anon Key',
    description: 'Public anonymous key for client-side Supabase access',
    instructions: '1. Go to supabase.com and sign in\n2. Select your project\n3. Go to Settings → API\n4. Copy the "anon public" key under Project API keys',
    docUrl: 'https://supabase.com/dashboard/project/_/settings/api',
  },
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': {
    name: 'Google Maps API Key',
    description: 'For maps, places, and directions functionality',
    instructions: '1. Go to console.cloud.google.com\n2. Create or select a project\n3. Go to APIs & Services → Credentials\n4. Click "Create Credentials" → API Key\n5. Restrict the key to Maps JavaScript API',
    docUrl: 'https://console.cloud.google.com/apis/credentials',
  },
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': {
    name: 'Stripe Publishable Key',
    description: 'Public key for Stripe payment forms',
    instructions: '1. Go to dashboard.stripe.com\n2. Click Developers → API keys\n3. Copy the "Publishable key" (starts with pk_)',
    docUrl: 'https://dashboard.stripe.com/apikeys',
  },
  'STRIPE_SECRET_KEY': {
    name: 'Stripe Secret Key',
    description: 'Server-side key for Stripe API calls (keep secret!)',
    instructions: '1. Go to dashboard.stripe.com\n2. Click Developers → API keys\n3. Click "Reveal" next to Secret key\n4. Copy the key (starts with sk_)',
    docUrl: 'https://dashboard.stripe.com/apikeys',
  },
  'STRIPE_WEBHOOK_SECRET': {
    name: 'Stripe Webhook Secret',
    description: 'For verifying Stripe webhook signatures',
    instructions: '1. Go to dashboard.stripe.com\n2. Click Developers → Webhooks\n3. Add an endpoint for your app\n4. Copy the "Signing secret" (starts with whsec_)',
    docUrl: 'https://dashboard.stripe.com/webhooks',
  },
  'OPENAI_API_KEY': {
    name: 'OpenAI API Key',
    description: 'For AI-powered features and chat',
    instructions: '1. Go to platform.openai.com\n2. Click your profile → API Keys\n3. Click "Create new secret key"\n4. Copy the key (starts with sk-)',
    docUrl: 'https://platform.openai.com/api-keys',
  },
  'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN': {
    name: 'Mapbox Access Token',
    description: 'For Mapbox maps and geocoding',
    instructions: '1. Go to account.mapbox.com\n2. Sign in or create account\n3. Go to Access tokens\n4. Copy your default public token or create a new one',
    docUrl: 'https://account.mapbox.com/access-tokens/',
  },
  'CHECKR_API_KEY': {
    name: 'Checkr API Key',
    description: 'For background check integrations',
    instructions: '1. Go to dashboard.checkr.com\n2. Sign in to your account\n3. Go to Developer → API Keys\n4. Copy your API key',
    docUrl: 'https://dashboard.checkr.com/api-keys',
  },
  'NEXT_PUBLIC_FIREBASE_API_KEY': {
    name: 'Firebase API Key',
    description: 'For Firebase services (auth, push notifications)',
    instructions: '1. Go to console.firebase.google.com\n2. Select your project\n3. Click the gear icon → Project settings\n4. Scroll to "Your apps" and copy the apiKey',
    docUrl: 'https://console.firebase.google.com/project/_/settings/general',
  },
};

interface ApiRequirementsPanelProps {
  projectId: string;
  className?: string;
}

export function ApiRequirementsPanel({ projectId, className }: ApiRequirementsPanelProps) {
  const [requirements, setRequirements] = useState<ApiRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnvFile();
  }, [projectId]);

  const loadEnvFile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { content } = await filesApi.getContent(projectId, '.env');
      const parsed = parseEnvFile(content);
      setRequirements(parsed);
    } catch (err) {
      // .env might not exist yet
      setRequirements([]);
      setError('No .env file found');
    } finally {
      setIsLoading(false);
    }
  };

  const parseEnvFile = (content: string): ApiRequirement[] => {
    const lines = content.split('\n');
    const reqs: ApiRequirement[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const match = trimmed.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        const [, envVar, value] = match;
        const info = API_DOCS[envVar] || {
          name: envVar.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: 'Environment variable',
          instructions: undefined,
          docUrl: undefined,
        };
        
        reqs.push({
          envVar,
          name: info.name,
          description: info.description,
          instructions: info.instructions,
          docUrl: info.docUrl,
          currentValue: value || undefined,
          isConfigured: !!value && value.length > 0,
        });
      }
    }
    
    return reqs;
  };

  const handleSaveKey = async (envVar: string, value: string) => {
    // TODO: Implement actual .env update via API
    // For now, just update local state
    setRequirements(prev => prev.map(req => 
      req.envVar === envVar 
        ? { ...req, currentValue: value, isConfigured: true }
        : req
    ));
    
    // Show confirmation that this needs human approval
    console.log(`[Human Approval Required] Update ${envVar} in .env`);
  };

  const configuredCount = requirements.filter(r => r.isConfigured).length;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 size={20} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-amber-500" />
          <h3 className="font-medium text-white text-sm">API Keys</h3>
        </div>
        <span className="text-xs text-white/50">
          {configuredCount}/{requirements.length}
        </span>
      </div>
      
      {error ? (
        <div className="text-xs text-white/40 italic">{error}</div>
      ) : requirements.length === 0 ? (
        <div className="text-xs text-white/40 italic">No API keys required</div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 pr-2">
            {requirements.map((req) => (
              <ApiKeyCard
                key={req.envVar}
                name={req.name}
                envVar={req.envVar}
                description={req.description}
                instructions={req.instructions}
                docUrl={req.docUrl}
                currentValue={req.currentValue}
                isConfigured={req.isConfigured}
                onSave={(value: string) => handleSaveKey(req.envVar, value)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
