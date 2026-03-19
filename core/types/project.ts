/**
 * LLM Provider configuration for multi-provider support
 */
export type LLMProviderType = 'openai' | 'anthropic' | 'google';

export interface LLMProviderConfig {
  provider: LLMProviderType;
  apiKey: string;
  baseURL?: string;
}

export interface LLMModelConfig {
  companyHead?: string;
  deptHead?: string;
  subAgent?: string;
  summarizer?: string;
  codex?: string;
  debug?: string;
}

export interface LLMConfiguration {
  provider: LLMProviderConfig;
  models: LLMModelConfig;
}

export interface ProjectConfig {
  projectId: string;
  projectName: string;
  
  // Path to the actual codebase (relative to project dir, e.g., "./src" or "./app")
  codebasePath?: string;
  
  // New: Multi-provider LLM configuration
  llm?: LLMConfiguration;

  // Legacy: Direct model configuration (deprecated, use llm.models instead)
  models?: LLMModelConfig;

  commands: {
    lint: string;
    typecheck: string;
    test: string;
    build: string;
    dev: string;
    [key: string]: string;
  };

  paths: {
    src: string;
    types: string;
    migrations: string;
    components: string;
    [key: string]: string;
  };

  database?: {
    provider: 'supabase' | 'postgres' | 'mysql' | 'sqlite';
    projectId?: string;
    connectionString?: string;
  };

  deployment?: {
    provider: 'vercel' | 'netlify' | 'railway' | 'fly';
    projectId?: string;
  };
}

export interface ProjectStatus {
  status: 'CREATED' | 'ACTIVE' | 'BLOCKED' | 'PAUSED' | 'COMPLETE';
  currentPhase: number;
  phaseName: string;
  blockingIssues: string[];
  nextAction: string;
}

export interface Project {
  config: ProjectConfig;
  status: ProjectStatus;
  productSpec: string; // Raw markdown
  phasePlan: string; // Raw markdown
}
