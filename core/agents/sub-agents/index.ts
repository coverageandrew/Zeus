import { Agent } from '@openai/agents';
import * as fs from 'fs/promises';
import * as path from 'path';

const ZEUS_ROOT = process.cwd();

/**
 * Sub-agent configuration
 */
export interface SubAgentConfig {
  name: string;
  department: string;
  definitionPath: string;
  skills: string[];
}

/**
 * Load agent definition from markdown file
 */
async function loadAgentDefinition(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Load skill files for an agent
 */
async function loadSkills(skillNames: string[]): Promise<string> {
  const skills: string[] = [];
  
  for (const skillName of skillNames) {
    const skillPath = path.join(ZEUS_ROOT, '.windsurf', 'workflows', `${skillName}.md`);
    try {
      const content = await fs.readFile(skillPath, 'utf-8');
      skills.push(`## Skill: ${skillName}\n\n${content}`);
    } catch {
      // Skill file not found, skip
    }
  }
  
  return skills.join('\n\n---\n\n');
}

/**
 * Create a sub-agent from configuration
 */
export async function createSubAgent(
  config: SubAgentConfig,
  tools: Agent['tools'] = []
): Promise<Agent> {
  const definition = await loadAgentDefinition(config.definitionPath);
  const skillsContext = await loadSkills(config.skills);

  const instructions = `${definition}

${skillsContext ? `---\n\n## Available Skills\n\n${skillsContext}` : ''}

---

## Output Format

When completing a task, provide:
1. A summary of what was done
2. List of artifacts created/modified
3. Any blockers or issues encountered

If you encounter a blocker, output:

\`\`\`
## BLOCKER REPORT
- **Type**: <blocker_type>
- **Details**: <description>
- **Requested Action**: <what_you_need>
\`\`\`
`;

  return new Agent({
    name: config.name,
    instructions,
    model: process.env.OPENAI_MODEL_SUB_AGENT || 'gpt-4o-mini',
    tools,
  });
}

/**
 * Registry of known sub-agents by department
 */
export const SUB_AGENT_REGISTRY: Record<string, SubAgentConfig[]> = {
  architecture: [
    {
      name: 'scaffolder_agent',
      department: 'architecture',
      definitionPath: 'departments/architecture/agents/scaffolder_agent.md',
      skills: ['nextjs-setup', 'typescript-config'],
    },
    {
      name: 'ci_agent',
      department: 'architecture',
      definitionPath: 'departments/architecture/agents/ci_agent.md',
      skills: ['github-actions', 'ci-cd'],
    },
    {
      name: 'deploy_agent',
      department: 'architecture',
      definitionPath: 'departments/architecture/agents/deploy_agent.md',
      skills: ['vercel-deploy', 'netlify-deploy'],
    },
  ],
  data: [
    {
      name: 'schema_agent',
      department: 'data',
      definitionPath: 'departments/data/agents/schema_agent.md',
      skills: ['supabase-schema', 'postgres'],
    },
    {
      name: 'migration_agent',
      department: 'data',
      definitionPath: 'departments/data/agents/migration_agent.md',
      skills: ['supabase-migrations'],
    },
    {
      name: 'seed_agent',
      department: 'data',
      definitionPath: 'departments/data/agents/seed_agent.md',
      skills: ['data-seeding'],
    },
  ],
  api: [
    {
      name: 'route_agent',
      department: 'api',
      definitionPath: 'departments/api/agents/route_agent.md',
      skills: ['nextjs-api-routes', 'rest-api'],
    },
    {
      name: 'action_agent',
      department: 'api',
      definitionPath: 'departments/api/agents/action_agent.md',
      skills: ['server-actions'],
    },
    {
      name: 'integration_agent',
      department: 'api',
      definitionPath: 'departments/api/agents/integration_agent.md',
      skills: ['api-integration'],
    },
  ],
  ui: [
    {
      name: 'component_agent',
      department: 'ui',
      definitionPath: 'departments/ui/agents/component_agent.md',
      skills: ['react-components', 'shadcn-ui'],
    },
    {
      name: 'page_agent',
      department: 'ui',
      definitionPath: 'departments/ui/agents/page_agent.md',
      skills: ['nextjs-pages', 'app-router'],
    },
    {
      name: 'style_agent',
      department: 'ui',
      definitionPath: 'departments/ui/agents/style_agent.md',
      skills: ['tailwindcss', 'css-modules'],
    },
  ],
  qa_security: [
    {
      name: 'test_agent',
      department: 'qa_security',
      definitionPath: 'departments/qa_security/agents/test_agent.md',
      skills: ['vitest', 'playwright'],
    },
    {
      name: 'security_agent',
      department: 'qa_security',
      definitionPath: 'departments/qa_security/agents/security_agent.md',
      skills: ['security-audit', 'rls-policies'],
    },
    {
      name: 'review_agent',
      department: 'qa_security',
      definitionPath: 'departments/qa_security/agents/review_agent.md',
      skills: ['code-review'],
    },
  ],
};

/**
 * Get sub-agent names for a department
 */
export function getSubAgentNames(department: string): string[] {
  const agents = SUB_AGENT_REGISTRY[department] || [];
  return agents.map(a => a.name);
}

/**
 * Get sub-agent config by name
 */
export function getSubAgentConfig(name: string): SubAgentConfig | undefined {
  for (const agents of Object.values(SUB_AGENT_REGISTRY)) {
    const found = agents.find(a => a.name === name);
    if (found) return found;
  }
  return undefined;
}
