import { Agent } from '@openai/agents';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import { tool } from '@openai/agents';

const ZEUS_ROOT = process.cwd();

/**
 * Load instructions from the company_head.md file
 */
async function loadCompanyHeadInstructions(): Promise<string> {
  const filePath = path.join(ZEUS_ROOT, 'agents', 'company_head.md');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return 'You are the Company Head agent responsible for orchestrating project development.';
  }
}

/**
 * Load SSoT documents for context
 */
async function loadSSoTContext(): Promise<string> {
  const ssotDocs = ['SSOT_CONSTITUTION.md', 'PHASE_PLAN.md', 'QUALITY_GATES.md'];
  const contents: string[] = [];

  for (const doc of ssotDocs) {
    const filePath = path.join(ZEUS_ROOT, 'company', doc);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      contents.push(`## ${doc}\n\n${content}`);
    } catch {
      // Skip missing files
    }
  }

  return contents.join('\n\n---\n\n');
}

/**
 * Department task assignment schema
 */
export const DepartmentTaskSchema = z.object({
  department: z.string().describe('Department name (architecture, data, api, ui, qa_security)'),
  order: z.number().describe('Execution order (1-5)'),
  tasks: z.array(z.object({
    taskId: z.string().describe('Unique task ID in format TASK-DEPT-YYYYMMDD-###'),
    description: z.string().describe('Detailed task description'),
    successCriteria: z.array(z.string()).describe('List of success criteria'),
    requiredArtifacts: z.array(z.string()).describe('List of required output artifacts'),
    dependencies: z.array(z.string()).describe('List of task IDs this depends on'),
  })),
});

export const PhaseBreakdownSchema = z.object({
  phase: z.number().describe('Current phase number (0-6)'),
  departmentTasks: z.array(DepartmentTaskSchema).describe('Tasks assigned to each department'),
});

export type PhaseBreakdown = z.infer<typeof PhaseBreakdownSchema>;
export type DepartmentTask = z.infer<typeof DepartmentTaskSchema>;

/**
 * Create the Company Head agent
 */
export async function createCompanyHeadAgent(
  deptHeadTools: Array<ReturnType<typeof tool>> = []
): Promise<Agent> {
  const instructions = await loadCompanyHeadInstructions();
  const ssotContext = await loadSSoTContext();

  const fullInstructions = `${instructions}

---

## SSoT Context (Source of Truth Documents)

${ssotContext}

---

## Output Format

When breaking down a phase into department tasks, you MUST output valid JSON in the following format:

\`\`\`json
{
  "phase": <number>,
  "departmentTasks": [
    {
      "department": "<department_name>",
      "order": <execution_order>,
      "tasks": [
        {
          "taskId": "TASK-<DEPT>-<YYYYMMDD>-<###>",
          "description": "<detailed_description>",
          "successCriteria": ["<criterion_1>", "<criterion_2>"],
          "requiredArtifacts": ["<artifact_1>", "<artifact_2>"],
          "dependencies": ["<task_id_1>"]
        }
      ]
    }
  ]
}
\`\`\`

Departments must be assigned in dependency order:
1. architecture (scaffolding, project setup)
2. data (database schema, migrations)
3. api (API routes, server logic)
4. ui (frontend components, pages)
5. qa_security (testing, security hardening)
`;

  return new Agent({
    name: 'CompanyHead',
    instructions: fullInstructions,
    model: process.env.OPENAI_MODEL_COMPANY_HEAD || 'gpt-4o',
    tools: [...deptHeadTools],
  });
}
