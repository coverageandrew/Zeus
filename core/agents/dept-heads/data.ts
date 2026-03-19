import { Agent } from '@openai/agents';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tool } from '@openai/agents';

const ZEUS_ROOT = process.cwd();

/**
 * Load instructions from the data department_head.md file
 */
async function loadInstructions(): Promise<string> {
  const filePath = path.join(ZEUS_ROOT, 'departments', 'data', 'department_head.md');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return 'You are the Data Department Head responsible for database schema design, migrations, and data modeling.';
  }
}

/**
 * Create the Data Department Head agent
 */
export async function createDataDeptHead(
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
      "taskId": "TASK-DATA-<YYYYMMDD>-<###>",
      "assignedTo": "<agent_name>",
      "instructions": "<detailed_instructions>",
      "successCriteria": ["<criterion_1>", "<criterion_2>"],
      "skillsRequired": ["<skill_1>", "<skill_2>"]
    }
  ]
}
\`\`\`

Available sub-agents in Data department:
- schema_agent: Database schema design and ERD creation
- migration_agent: Migration file generation and management
- seed_agent: Seed data and fixtures
`;

  return new Agent({
    name: 'DataDeptHead',
    instructions: fullInstructions,
    model: process.env.OPENAI_MODEL_DEPT_HEAD || 'gpt-4o-mini',
    tools: [...subAgentTools],
  });
}
