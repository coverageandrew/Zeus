export { createCompanyHeadAgent, PhaseBreakdownSchema, DepartmentTaskSchema } from './company-head.js';
export type { PhaseBreakdown, DepartmentTask } from './company-head.js';

export {
  createArchitectureDeptHead,
  createDataDeptHead,
  createApiDeptHead,
  createUiDeptHead,
  createQaSecurityDeptHead,
  DEPARTMENT_NAMES,
} from './dept-heads/index.js';
export type { DepartmentName } from './dept-heads/index.js';

export {
  createSubAgent,
  getSubAgentNames,
  getSubAgentConfig,
  SUB_AGENT_REGISTRY,
} from './sub-agents/index.js';
export type { SubAgentConfig } from './sub-agents/index.js';

// Intake Agent
export {
  createIntakeAgent,
  isReadyTrigger,
  generateProjectId,
} from './intake-agent.js';

// API Analyzer Agent
export {
  createApiAnalyzerAgent,
  analyzeProjectApis,
} from './api-analyzer-agent.js';
