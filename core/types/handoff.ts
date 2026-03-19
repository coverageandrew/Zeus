import type { ProjectConfig } from './project.js';

export interface TaskSpec {
  taskId: string;
  description: string;
  requiredArtifacts: string[];
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
}

export interface HandoffPayload {
  handoffId: string;
  fromAgent: string;
  toAgent: string;
  projectId: string;
  projectConfig: ProjectConfig;
  currentPhase: number;
  taskSpec: TaskSpec;
  successCriteria: string[];
  ssotContext: string[];
  skillContext: string[];
  previousOutput?: string;
  memoryKey: string;
}

export interface HandoffResult {
  handoffId: string;
  agentName: string;
  taskId: string;
  status: 'completed' | 'failed' | 'blocked';
  output: string;
  artifacts: string[];
  blockerReport?: BlockerReport;
  nextTasks?: TaskSpec[];
  timestamp: string;
}

export interface BlockerReport {
  agentName: string;
  taskId: string;
  blockerType: 'missing_skill' | 'ambiguous_instruction' | 'unknown_path' | 'repeated_failure' | 'ssot_change_needed' | 'no_evidence';
  details: string;
  requestedAction: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
