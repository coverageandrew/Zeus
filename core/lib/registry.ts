import * as fs from 'fs/promises';
import * as path from 'path';
import type { AgentRegistryEntry, AgentRegistry } from '../types/index.js';

const ZEUS_ROOT = process.cwd();

export async function loadAgentRegistry(): Promise<AgentRegistry> {
  const registryPath = path.join(ZEUS_ROOT, 'agents', 'AGENT_REGISTRY.md');
  const content = await fs.readFile(registryPath, 'utf-8');

  const registry: AgentRegistry = {
    companyLevel: [],
    departments: {},
  };

  // Parse Company Level agents
  const companyMatch = content.match(/### Company Level[\s\S]*?\|([^|]+)\|([^|]+)\|([^|]+)\|/g);
  if (companyMatch) {
    for (const match of companyMatch) {
      const entry = parseRegistryRow(match);
      if (entry && entry.name !== 'Agent') {
        registry.companyLevel.push(entry);
      }
    }
  }

  // Parse department sections
  const departments = ['Architecture', 'Data', 'API', 'UI', 'QA & Security'];
  const deptKeys = ['architecture', 'data', 'api', 'ui', 'qa_security'];

  for (let i = 0; i < departments.length; i++) {
    const deptName = departments[i];
    const deptKey = deptKeys[i];
    const deptRegex = new RegExp(`### ${deptName} Department[\\s\\S]*?(?=### |## |$)`, 'i');
    const deptMatch = content.match(deptRegex);

    if (deptMatch) {
      const deptContent = deptMatch[0];
      const rows = deptContent.match(/\|([^|]+)\|([^|]+)\|([^|]+)\|/g) || [];
      
      const agents: AgentRegistryEntry[] = [];
      let head: AgentRegistryEntry | null = null;

      for (const row of rows) {
        const entry = parseRegistryRow(row);
        if (entry && entry.name !== 'Agent') {
          entry.department = deptKey;
          if (entry.name.includes('Department Head')) {
            head = entry;
          } else {
            agents.push(entry);
          }
        }
      }

      if (head) {
        registry.departments[deptKey] = { head, agents };
      }
    }
  }

  return registry;
}

function parseRegistryRow(row: string): AgentRegistryEntry | null {
  const parts = row.split('|').map(p => p.trim()).filter(p => p);
  if (parts.length < 3) return null;

  const name = parts[0];
  const filePath = parts[1].replace(/`/g, '');
  const status = parts[2] as 'Active' | 'Inactive';

  if (name === 'Agent' || name === '-------') return null;

  return {
    name,
    filePath,
    status,
    skills: [],
  };
}

export async function loadAgentDefinition(agentPath: string): Promise<string> {
  const fullPath = path.join(ZEUS_ROOT, agentPath.replace(/^\//, ''));
  return fs.readFile(fullPath, 'utf-8');
}

export async function loadSkillFile(skillName: string): Promise<string> {
  const skillPath = path.join(ZEUS_ROOT, '.windsurf', skillName, 'SKILL.md');
  try {
    return await fs.readFile(skillPath, 'utf-8');
  } catch {
    console.warn(`Skill file not found: ${skillName}`);
    return '';
  }
}

export async function loadSkillsForAgent(skillNames: string[]): Promise<string[]> {
  const skills: string[] = [];
  for (const skillName of skillNames) {
    const content = await loadSkillFile(skillName);
    if (content) {
      skills.push(content);
    }
  }
  return skills;
}

export async function loadSSoTDocument(docName: string): Promise<string> {
  const docPath = path.join(ZEUS_ROOT, 'company', docName);
  return fs.readFile(docPath, 'utf-8');
}

export async function getAgentSkills(agentName: string): Promise<string[]> {
  const registryPath = path.join(ZEUS_ROOT, 'agents', 'AGENT_REGISTRY.md');
  const content = await fs.readFile(registryPath, 'utf-8');

  // Find the skills matrix section
  const skillsSection = content.match(/## 2\. Skills Matrix[\s\S]*?(?=## 3\.|$)/);
  if (!skillsSection) return [];

  // Find the row for this agent
  const agentRegex = new RegExp(`\\|\\s*${agentName}\\s*\\|([^|]+)\\|`, 'i');
  const match = skillsSection[0].match(agentRegex);

  if (match) {
    const skillsStr = match[1].trim();
    return skillsStr
      .split(',')
      .map(s => s.trim().replace(/`/g, ''))
      .filter(s => s);
  }

  return [];
}

export function getDepartmentForAgent(agentName: string): string | null {
  const deptMap: Record<string, string> = {
    'scaffolder_agent': 'architecture',
    'ci_agent': 'architecture',
    'deploy_agent': 'architecture',
    'schema_agent': 'data',
    'rls_agent': 'data',
    'seed_agent': 'data',
    'endpoint_agent': 'api',
    'integration_agent': 'api',
    'background_jobs_agent': 'api',
    'routes_agent': 'ui',
    'components_agent': 'ui',
    'forms_agent': 'ui',
    'ui_performance_agent': 'ui',
    'test_agent': 'qa_security',
    'security_agent': 'qa_security',
    'regression_agent': 'qa_security',
    'qa_performance_agent': 'qa_security',
  };

  return deptMap[agentName] || null;
}

export function normalizeAgentName(name: string): string {
  // Convert "Scaffolder Agent" to "scaffolder_agent"
  return name.toLowerCase().replace(/\s+/g, '_');
}

export function getAgentFilePath(agentName: string): string {
  const normalized = normalizeAgentName(agentName);
  
  if (normalized === 'company_head') {
    return '/agents/company_head.md';
  }

  const dept = getDepartmentForAgent(normalized);
  if (dept) {
    if (normalized.includes('department_head') || normalized.includes('dept_head')) {
      return `/departments/${dept}/department_head.md`;
    }
    return `/departments/${dept}/agents/${normalized}.md`;
  }

  // Check if it's a department head
  const deptHeadMap: Record<string, string> = {
    'architecture_department_head': '/departments/architecture/department_head.md',
    'data_department_head': '/departments/data/department_head.md',
    'api_department_head': '/departments/api/department_head.md',
    'ui_department_head': '/departments/ui/department_head.md',
    'qa_security_department_head': '/departments/qa_security/department_head.md',
  };

  return deptHeadMap[normalized] || `/agents/${normalized}.md`;
}
