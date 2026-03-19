import { Agent } from '@openai/agents';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tool } from '@openai/agents';

const ZEUS_ROOT = process.cwd();

/**
 * Load instructions from the ui department_head.md file
 */
async function loadInstructions(): Promise<string> {
  const filePath = path.join(ZEUS_ROOT, 'departments', 'ui', 'department_head.md');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return 'You are the UI Department Head responsible for frontend components, pages, and user experience.';
  }
}

/**
 * Create the UI Department Head agent
 */
export async function createUiDeptHead(
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
      "taskId": "TASK-UI-<YYYYMMDD>-<###>",
      "assignedTo": "<agent_name>",
      "instructions": "<detailed_instructions>",
      "successCriteria": ["<criterion_1>", "<criterion_2>"],
      "skillsRequired": ["<skill_1>", "<skill_2>"]
    }
  ]
}
\`\`\`

Available sub-agents in UI department:
- component_agent: Reusable UI component creation
- page_agent: Page layout and routing
- style_agent: Styling and theming
`;

  return new Agent({
    name: 'UiDeptHead',
    instructions: fullInstructions,
    model: process.env.OPENAI_MODEL_DEPT_HEAD || 'gpt-4o-mini',
    tools: [...subAgentTools],
  });
}
