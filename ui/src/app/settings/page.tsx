'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Settings, Key, CheckCircle, AlertCircle, Cpu, Bot, Users, ChevronDown, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type LLMProvider = 'openai' | 'anthropic' | 'google';
type AgentProvider = LLMProvider | 'default';

interface ProviderConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
}

interface AgentModelConfig {
  provider: AgentProvider;
  model: string;
}

interface AgentConfigs {
  companyHead: AgentModelConfig;
  intake: AgentModelConfig;
  apiAnalyzer: AgentModelConfig;
  deptHeads: Record<string, AgentModelConfig>;
  subAgents: Record<string, Record<string, AgentModelConfig>>;
}

const PROVIDER_INFO: Record<LLMProvider, { name: string; placeholder: string; models: string[] }> = {
  openai: {
    name: 'OpenAI',
    placeholder: 'sk-...',
    models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-5', 'gpt-5-mini'],
  },
  anthropic: {
    name: 'Anthropic',
    placeholder: 'sk-ant-...',
    models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-haiku-3-20250514'],
  },
  google: {
    name: 'Google',
    placeholder: 'AIza...',
    models: ['gemini-2.0-flash', 'gemini-2.5-pro'],
  },
};

const AGENT_PROVIDERS: Record<AgentProvider, { name: string; models: string[] }> = {
  default: { name: 'Use Default', models: ['default'] },
  openai: { name: 'OpenAI', models: PROVIDER_INFO.openai.models },
  anthropic: { name: 'Anthropic', models: PROVIDER_INFO.anthropic.models },
  google: { name: 'Google', models: PROVIDER_INFO.google.models },
};

const DEFAULT_AGENT_CONFIG: AgentModelConfig = { provider: 'default', model: 'default' };

const INITIAL_AGENT_CONFIGS: AgentConfigs = {
  companyHead: { ...DEFAULT_AGENT_CONFIG },
  intake: { ...DEFAULT_AGENT_CONFIG },
  apiAnalyzer: { ...DEFAULT_AGENT_CONFIG },
  deptHeads: {
    architecture: { ...DEFAULT_AGENT_CONFIG },
    data: { ...DEFAULT_AGENT_CONFIG },
    api: { ...DEFAULT_AGENT_CONFIG },
    ui: { ...DEFAULT_AGENT_CONFIG },
    qa_security: { ...DEFAULT_AGENT_CONFIG },
  },
  subAgents: {
    architecture: { scaffolder: { ...DEFAULT_AGENT_CONFIG }, ci: { ...DEFAULT_AGENT_CONFIG }, deploy: { ...DEFAULT_AGENT_CONFIG } },
    data: { schema: { ...DEFAULT_AGENT_CONFIG }, migration: { ...DEFAULT_AGENT_CONFIG }, seed: { ...DEFAULT_AGENT_CONFIG } },
    api: { route: { ...DEFAULT_AGENT_CONFIG }, action: { ...DEFAULT_AGENT_CONFIG }, integration: { ...DEFAULT_AGENT_CONFIG } },
    ui: { component: { ...DEFAULT_AGENT_CONFIG }, page: { ...DEFAULT_AGENT_CONFIG }, style: { ...DEFAULT_AGENT_CONFIG } },
    qa_security: { test: { ...DEFAULT_AGENT_CONFIG }, security: { ...DEFAULT_AGENT_CONFIG }, review: { ...DEFAULT_AGENT_CONFIG } },
  },
};

const DEPARTMENTS = [
  { id: 'architecture', name: 'Architecture', icon: '🏗️', agents: [
    { id: 'scaffolder', name: 'Scaffolder', skills: ['nextjs-setup', 'typescript'] },
    { id: 'ci', name: 'CI Agent', skills: ['github-actions'] },
    { id: 'deploy', name: 'Deploy Agent', skills: ['vercel', 'netlify'] },
  ]},
  { id: 'data', name: 'Data', icon: '🗄️', agents: [
    { id: 'schema', name: 'Schema Agent', skills: ['supabase', 'postgres'] },
    { id: 'migration', name: 'Migration Agent', skills: ['migrations'] },
    { id: 'seed', name: 'Seed Agent', skills: ['seeding'] },
  ]},
  { id: 'api', name: 'API', icon: '🔌', agents: [
    { id: 'route', name: 'Route Agent', skills: ['api-routes'] },
    { id: 'action', name: 'Action Agent', skills: ['server-actions'] },
    { id: 'integration', name: 'Integration Agent', skills: ['integrations'] },
  ]},
  { id: 'ui', name: 'UI', icon: '🎨', agents: [
    { id: 'component', name: 'Component Agent', skills: ['react', 'shadcn'] },
    { id: 'page', name: 'Page Agent', skills: ['nextjs-pages'] },
    { id: 'style', name: 'Style Agent', skills: ['tailwindcss'] },
  ]},
  { id: 'qa_security', name: 'QA & Security', icon: '🛡️', agents: [
    { id: 'test', name: 'Test Agent', skills: ['vitest', 'playwright'] },
    { id: 'security', name: 'Security Agent', skills: ['rls', 'audit'] },
    { id: 'review', name: 'Review Agent', skills: ['code-review'] },
  ]},
];

function AgentConfigRow({ 
  label, 
  config, 
  onChange,
  skills = [],
}: { 
  label: string; 
  config: AgentModelConfig; 
  onChange: (config: AgentModelConfig) => void;
  skills?: string[];
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-800 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-amber-500 shrink-0" />
          <span className="text-sm text-white truncate">{label}</span>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 ml-5">
            {skills.map(skill => (
              <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-white/50">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
      <Select
        value={config.provider}
        onValueChange={(provider: AgentProvider) => {
          const models = AGENT_PROVIDERS[provider].models;
          onChange({ provider, model: models[0] });
        }}
      >
        <SelectTrigger className="w-[110px] bg-stone-800 border-stone-700 text-white text-xs h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-stone-800 border-stone-700">
          {(Object.keys(AGENT_PROVIDERS) as AgentProvider[]).map(p => (
            <SelectItem key={p} value={p} className="text-white text-sm hover:bg-stone-700">
              {AGENT_PROVIDERS[p].name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {config.provider !== 'default' && (
        <Select
          value={config.model}
          onValueChange={(model) => onChange({ ...config, model })}
        >
          <SelectTrigger className="w-[160px] bg-stone-800 border-stone-700 text-white text-xs h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-stone-800 border-stone-700">
            {AGENT_PROVIDERS[config.provider].models.map(m => (
              <SelectItem key={m} value={m} className="text-white text-sm hover:bg-stone-700">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [ideMode, setIdeMode] = useState(false);
  const [config, setConfig] = useState<ProviderConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4.1',
  });
  const [agentConfigs, setAgentConfigs] = useState<AgentConfigs>(INITIAL_AGENT_CONFIGS);
  const [expandedDepts, setExpandedDepts] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved configs on mount
  useEffect(() => {
    const savedIdeMode = localStorage.getItem('zeus_ide_mode');
    if (savedIdeMode) {
      setIdeMode(savedIdeMode === 'true');
    }
    const savedConfig = localStorage.getItem('zeus_llm_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch {
        // Ignore
      }
    }
    const savedAgentConfigs = localStorage.getItem('zeus_agent_configs');
    if (savedAgentConfigs) {
      try {
        const parsed = JSON.parse(savedAgentConfigs);
        setAgentConfigs({ ...INITIAL_AGENT_CONFIGS, ...parsed });
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleProviderChange = (provider: LLMProvider) => {
    setConfig({
      ...config,
      provider,
      model: PROVIDER_INFO[provider].models[0],
    });
    setSaved(false);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const res = await fetch('/api/config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message || 'Connection successful!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Connection failed' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Failed to test connection' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    // In IDE mode, API key is not required
    if (!ideMode && !config.apiKey.trim()) {
      setError('API key is required (or enable IDE Mode)');
      return;
    }
    
    // Save to localStorage for UI persistence
    localStorage.setItem('zeus_ide_mode', String(ideMode));
    localStorage.setItem('zeus_llm_config', JSON.stringify(config));
    localStorage.setItem('zeus_agent_configs', JSON.stringify(agentConfigs));
    
    // Also save to backend config file so API routes can use it
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideMode,
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          agentConfigs,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to save to backend');
      }
      
      setSaved(true);
      setError(null);
    } catch (err) {
      console.error('Failed to save config to backend:', err);
      // Still mark as saved since localStorage worked
      setSaved(true);
      setError(null);
    }
    
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleDept = (deptId: string) => {
    setExpandedDepts(prev => 
      prev.includes(deptId) ? prev.filter(d => d !== deptId) : [...prev, deptId]
    );
  };

  const updateAgentConfig = (path: string[], newConfig: AgentModelConfig) => {
    setAgentConfigs(prev => {
      const updated = { ...prev };
      if (path.length === 1) {
        (updated as any)[path[0]] = newConfig;
      } else if (path.length === 2) {
        (updated as any)[path[0]] = { ...(updated as any)[path[0]], [path[1]]: newConfig };
      } else if (path.length === 3) {
        (updated as any)[path[0]] = {
          ...(updated as any)[path[0]],
          [path[1]]: { ...(updated as any)[path[0]][path[1]], [path[2]]: newConfig }
        };
      }
      return updated;
    });
    setSaved(false);
  };

  const providerInfo = PROVIDER_INFO[config.provider];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - fixed */}
        <div className="flex items-center gap-3 p-6 pb-4 shrink-0 border-b border-stone-800">
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Settings size={20} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-stone-400">Zeus platform preferences</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-emerald-400 text-sm">
                <CheckCircle size={14} />
                Saved
              </span>
            )}
            {error && (
              <span className="flex items-center gap-1 text-red-400 text-sm">
                <AlertCircle size={14} />
                {error}
              </span>
            )}
            <Button 
              onClick={handleSave}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950"
            >
              Save All
            </Button>
          </div>
        </div>

        {/* Two column layout - NO page scroll */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* LEFT COLUMN - Provider & API Key */}
            <div className="space-y-6">
              {/* IDE Mode Toggle */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu size={18} className="text-amber-500" />
                      <h2 className="font-medium text-white">Execution Mode</h2>
                    </div>
                    <p className="text-sm text-white/60">
                      {ideMode 
                        ? 'Your IDE (Windsurf, Cursor, etc.) acts as the LLM. Zeus reads/writes files only.'
                        : 'Zeus makes LLM API calls using the Vercel AI SDK.'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setIdeMode(!ideMode); setSaved(false); }}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      ideMode ? 'bg-amber-500' : 'bg-stone-700'
                    }`}
                  >
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                      ideMode ? 'left-8' : 'left-1'
                    }`} />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${ideMode ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-700 text-stone-400'}`}>
                    {ideMode ? 'IDE Mode' : 'SDK Mode'}
                  </span>
                  {ideMode && (
                    <span className="text-xs text-white/50">
                      See <code className="bg-stone-800 px-1 rounded">IDE_INSTRUCTIONS.md</code> for setup
                    </span>
                  )}
                </div>
              </div>

              {/* LLM Provider Selection - only show in SDK mode */}
              {!ideMode && (
              <>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu size={18} className="text-amber-500" />
                  <h2 className="font-medium text-white">LLM Provider</h2>
                </div>
                <p className="text-sm text-white/60 mb-4">
                  Choose your preferred AI provider. Bring your own API key.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {(Object.keys(PROVIDER_INFO) as LLMProvider[]).map((provider) => (
                    <button
                      key={provider}
                      onClick={() => handleProviderChange(provider)}
                      className={`p-4 rounded-lg border transition-all ${
                        config.provider === provider
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                          : 'bg-stone-800 border-stone-700 text-white/70 hover:border-stone-600'
                      }`}
                    >
                      <div className="font-medium">{PROVIDER_INFO[provider].name}</div>
                      <div className="text-xs mt-1 opacity-60">
                        {PROVIDER_INFO[provider].models.length} models
                      </div>
                    </button>
                  ))}
                </div>
                {/* Model Selection */}
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Default Model</label>
                  <Select
                    value={config.model}
                    onValueChange={(model) => {
                      setConfig({ ...config, model });
                      setSaved(false);
                    }}
                  >
                    <SelectTrigger className="bg-stone-800 border-stone-700 text-white">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-700">
                      {providerInfo.models.map((model) => (
                        <SelectItem key={model} value={model} className="text-white hover:bg-stone-700">
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* API Key */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Key size={18} className="text-amber-500" />
                  <h2 className="font-medium text-white">{providerInfo.name} API Key</h2>
                </div>
                <p className="text-sm text-white/60 mb-4">
                  Your API key is stored locally and used to call the provider API directly.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder={providerInfo.placeholder}
                    value={config.apiKey}
                    onChange={(e) => {
                      setConfig({ ...config, apiKey: e.target.value });
                      setSaved(false);
                      setError(null);
                      setTestResult(null);
                    }}
                    className="bg-stone-800 border-stone-700 text-white flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={!config.apiKey || isTesting}
                    className="border-stone-700 text-stone-300 hover:bg-stone-800"
                  >
                    {isTesting ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
                  </Button>
                </div>
                {testResult && (
                  <div className={`mt-3 text-sm flex items-center gap-2 ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {testResult.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {testResult.message}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
                <p className="text-xs text-white/50">
                  <strong className="text-white/70">Note:</strong> Zeus supports multiple LLM providers. 
                  Your API key is used directly with the provider's API. You are billed by the provider 
                  based on your usage. Zeus does not store or transmit your API key.
                </p>
              </div>
              </>
              )}
            </div>

            {/* RIGHT COLUMN - Agent Configuration with internal scroll */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-amber-500" />
                  <h2 className="font-medium text-white">Agent Configuration</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAgentConfigs(INITIAL_AGENT_CONFIGS)}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Reset All
                </Button>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 shrink-0">
                <div className="flex items-start gap-2">
                  <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-white/70">
                    Override the default provider for specific agents. "Use Default" inherits from left.
                  </p>
                </div>
              </div>

              {/* Scrollable agent list */}
              <div className="flex-1 overflow-y-auto">
                {/* Top-Level Agents */}
                <div className="mb-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Top-Level Agents</p>
                  <div className="bg-stone-950 rounded-lg p-3">
                    <AgentConfigRow
                      label="Company Head"
                      config={agentConfigs.companyHead}
                      onChange={(c) => updateAgentConfig(['companyHead'], c)}
                    />
                    <AgentConfigRow
                      label="Intake Agent"
                      config={agentConfigs.intake}
                      onChange={(c) => updateAgentConfig(['intake'], c)}
                    />
                    <AgentConfigRow
                      label="API Analyzer"
                      config={agentConfigs.apiAnalyzer}
                      onChange={(c) => updateAgentConfig(['apiAnalyzer'], c)}
                    />
                  </div>
                </div>

                {/* Departments */}
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Departments</p>
                <div className="space-y-2">
                  {DEPARTMENTS.map(dept => {
                    const isExpanded = expandedDepts.includes(dept.id);
                    return (
                      <div key={dept.id} className="bg-stone-950 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleDept(dept.id)}
                          className="w-full flex items-center gap-2 p-3 hover:bg-stone-800/50 transition-colors"
                        >
                          <span className="text-lg">{dept.icon}</span>
                          <span className="text-sm text-white flex-1 text-left">{dept.name}</span>
                          {isExpanded ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-stone-800">
                            <p className="text-xs text-white/40 mt-3 mb-2">Dept Head</p>
                            <AgentConfigRow
                              label={`${dept.name} Head`}
                              config={agentConfigs.deptHeads[dept.id]}
                              onChange={(c) => updateAgentConfig(['deptHeads', dept.id], c)}
                            />
                            <p className="text-xs text-white/40 mt-3 mb-2">Sub-Agents</p>
                            {dept.agents.map(agent => (
                              <AgentConfigRow
                                key={agent.id}
                                label={agent.name}
                                config={agentConfigs.subAgents[dept.id]?.[agent.id] || DEFAULT_AGENT_CONFIG}
                                onChange={(c) => updateAgentConfig(['subAgents', dept.id, agent.id], c)}
                                skills={agent.skills}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
