export interface AgentDefinition {
  name: string;
  level: 0 | 1 | 2; // 0 = Company Head, 1 = Dept Head, 2 = Sub-Agent
  department?: string;
  filePath: string;
  skills: string[];
  mission: string;
  allowedActions: string[];
  stopConditions: string[];
}

export interface AgentRegistryEntry {
  name: string;
  filePath: string;
  status: 'Active' | 'Inactive';
  department?: string;
  skills: string[];
}

export interface AgentRegistry {
  companyLevel: AgentRegistryEntry[];
  departments: {
    [deptName: string]: {
      head: AgentRegistryEntry;
      agents: AgentRegistryEntry[];
    };
  };
}

export type AgentLevel = 'companyHead' | 'deptHead' | 'subAgent';

export interface AgentContext {
  definition: string; // Raw markdown content
  skills: string[]; // Raw skill file contents
  ssotExcerpts: string[]; // Relevant SSoT sections
}
