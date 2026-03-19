import { Agent } from '@openai/agents';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tool } from '@openai/agents';

const ZEUS_ROOT = process.cwd();

/**
 * Load instructions from the api department_head.md file
 */
async function loadInstructions(): Promise<string> {
  const filePath = path.join(ZEUS_ROOT, 'departments', 'api', 'department_head.md');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return 'You are the API Department Head responsible for API route design, server actions, and backend logic.';
  }
}

/**
 * Create the API Department Head agent
 */
export async function createApiDeptHead(
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
      "taskId": "TASK-API-<YYYYMMDD>-<###>",
      "assignedTo": "<agent_name>",
      "instructions": "<detailed_instructions>",
      "successCriteria": ["<criterion_1>", "<criterion_2>"],
      "skillsRequired": ["<skill_1>", "<skill_2>"]
    }
  ]
}
\`\`\`

Available sub-agents in API department:
- route_agent: API route implementation
- action_agent: Server actions and business logic
- integration_agent: Third-party API integrations
`;

  return new Agent({
    name: 'ApiDeptHead',
    instructions: fullInstructions,
    model: process.env.OPENAI_MODEL_DEPT_HEAD || 'gpt-4o-mini',
    tools: [...subAgentTools],
  });
}
