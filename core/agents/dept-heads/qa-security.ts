import { Agent } from '@openai/agents';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tool } from '@openai/agents';

const ZEUS_ROOT = process.cwd();

/**
 * Load instructions from the qa_security department_head.md file
 */
async function loadInstructions(): Promise<string> {
  const filePath = path.join(ZEUS_ROOT, 'departments', 'qa_security', 'department_head.md');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return 'You are the QA & Security Department Head responsible for testing, security audits, and quality assurance.';
  }
}

/**
 * Create the QA & Security Department Head agent
 */
export async function createQaSecurityDeptHead(
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
      "taskId": "TASK-QA-<YYYYMMDD>-<###>",
      "assignedTo": "<agent_name>",
      "instructions": "<detailed_instructions>",
      "successCriteria": ["<criterion_1>", "<criterion_2>"],
      "skillsRequired": ["<skill_1>", "<skill_2>"]
    }
  ]
}
\`\`\`

Available sub-agents in QA & Security department:
- test_agent: Test writing and execution
- security_agent: Security audits and vulnerability scanning
- review_agent: Code review and quality checks
`;

  return new Agent({
    name: 'QaSecurityDeptHead',
    instructions: fullInstructions,
    model: process.env.OPENAI_MODEL_DEPT_HEAD || 'gpt-4o-mini',
    tools: [...subAgentTools],
  });
}
