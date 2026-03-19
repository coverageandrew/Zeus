import { Agent } from '@openai/agents';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tool } from '@openai/agents';

const ZEUS_ROOT = process.cwd();

/**
 * Load instructions from the architecture department_head.md file
 */
async function loadInstructions(): Promise<string> {
  const filePath = path.join(ZEUS_ROOT, 'departments', 'architecture', 'department_head.md');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return 'You are the Architecture Department Head responsible for project scaffolding, CI/CD, and deployment infrastructure.';
  }
}

/**
 * Create the Architecture Department Head agent
 */
export async function createArchitectureDeptHead(
  subAgentTools: Array<ReturnType<typeof tool>> = []
): Promise<Agent> {
  const instructions = await loadInstructions();

  const fullInstructions = `${instructions}

---

## Output Format

When assigning tasks to sub-agents, you MUST output valid JSON in the following format:

\`\`\`json
{
  "assignments": [
    {
      "taskId": "TASK-ARCH-<YYYYMMDD>-<###>",
      "assignedTo": "<agent_name>",
      "instructions": "<detailed_instructions>",
      "successCriteria": ["<criterion_1>", "<criterion_2>"],
      "skillsRequired": ["<skill_1>", "<skill_2>"]
    }
  ]
}
\`\`\`

Available sub-agents in Architecture department:
- scaffolder_agent: Project initialization, folder structure, dependency setup
- ci_agent: CI/CD pipeline configuration
- deploy_agent: Deployment configuration and infrastructure
`;

  return new Agent({
    name: 'ArchitectureDeptHead',
    instructions: fullInstructions,
    model: process.env.OPENAI_MODEL_DEPT_HEAD || 'gpt-4o-mini',
    tools: [...subAgentTools],
  });
}
