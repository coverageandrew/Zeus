export interface Decision {
  timestamp: string;
  description: string;
  rationale: string;
}

export interface Artifact {
  path: string;
  type: string;
  createdAt: string;
  description: string;
}

export interface Issue {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blockedBy?: string;
}

export interface Interaction {
  timestamp: string;
  taskId: string;
  input: string;
  output: string;
  outcome: 'success' | 'failure' | 'partial';
}

export interface AgentMemory {
  agentName: string;
  projectId: string;
  lastUpdated: string;
  summary: string;
  decisions: Decision[];
  artifacts: Artifact[];
  openIssues: Issue[];
  recentInteractions: Interaction[];
}

export interface MemoryContext {
  summary: string;
  decisions: Decision[];
  openIssues: Issue[];
  recentInteractions: Interaction[];
}
