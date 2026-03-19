import { tool } from '@openai/agents';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const ZEUS_ROOT = process.cwd();

/**
 * Handoff result schema
 */
const HandoffResultSchema = z.object({
  handoffId: z.string(),
  agentName: z.string(),
  taskId: z.string(),
  status: z.enum(['completed', 'blocked', 'failed']),
  output: z.string(),
  artifacts: z.array(z.string()),
  blockerReport: z.object({
    blockerType: z.string(),
    details: z.string(),
    requestedAction: z.string(),
  }).optional(),
  timestamp: z.string(),
});

type HandoffResult = z.infer<typeof HandoffResultSchema>;

/**
 * Get department code from name
 */
function getDeptCode(department: string): string {
  const codes: Record<string, string> = {
    architecture: 'ARCH',
    data: 'DATA',
    api: 'API',
    ui: 'UI',
    qa_security: 'QA',
  };
  return codes[department] || department.toUpperCase().substring(0, 4);
}

/**
 * Tool to create a handoff record
 */
export const createHandoffTool = tool({
  name: 'create_handoff',
  description: 'Create a handoff record when an agent completes or blocks on a task',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    agentName: z.string().describe('Name of the agent creating the handoff'),
    department: z.string().describe('Department name'),
    taskId: z.string().describe('Task identifier'),
    status: z.enum(['completed', 'blocked', 'failed']).describe('Task status'),
    output: z.string().describe('Task output/result'),
    artifacts: z.array(z.string()).optional().describe('List of artifact paths created'),
    blockerType: z.string().optional().describe('Type of blocker if blocked'),
    blockerDetails: z.string().optional().describe('Details of the blocker'),
    requestedAction: z.string().optional().describe('Action requested to resolve blocker'),
  }),
  async execute({ 
    projectId, 
    agentName, 
    department, 
    taskId, 
    status, 
    output, 
    artifacts = [],
    blockerType,
    blockerDetails,
    requestedAction,
  }) {
    const handoffId = `HO-${getDeptCode(department)}-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const handoff: HandoffResult = {
      handoffId,
      agentName,
      taskId,
      status,
      output,
      artifacts,
      timestamp,
    };

    if (status === 'blocked' && blockerType) {
      handoff.blockerReport = {
        blockerType,
        details: blockerDetails || 'No details provided',
        requestedAction: requestedAction || 'Review and resolve',
      };
    }

    // Save handoff to file
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const handoffDir = path.join(ZEUS_ROOT, 'handoffs', department);
    const handoffPath = path.join(handoffDir, `${handoffId}-${dateStr}.md`);

    const markdown = `# Handoff: ${handoffId}

| Field | Value |
|-------|-------|
| Agent | ${agentName} |
| Task ID | ${taskId} |
| Status | ${status} |
| Timestamp | ${timestamp} |

## Output

${output}

## Artifacts

${artifacts.length > 0 ? artifacts.map(a => `- \`${a}\``).join('\n') : 'No artifacts created.'}

${handoff.blockerReport ? `
## Blocker Report

- **Type**: ${handoff.blockerReport.blockerType}
- **Details**: ${handoff.blockerReport.details}
- **Requested Action**: ${handoff.blockerReport.requestedAction}
` : ''}
`;

    try {
      await fs.mkdir(handoffDir, { recursive: true });
      await fs.writeFile(handoffPath, markdown);

      return {
        success: true,
        handoff,
        filePath: handoffPath,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save handoff: ${error}`,
        handoff,
      };
    }
  },
});

/**
 * Tool to load recent handoffs for a department
 */
export const loadHandoffsTool = tool({
  name: 'load_handoffs',
  description: 'Load recent handoffs for a department',
  parameters: z.object({
    department: z.string().describe('Department name'),
    limit: z.number().optional().describe('Maximum number of handoffs to return (default: 10)'),
  }),
  async execute({ department, limit = 10 }) {
    const handoffDir = path.join(ZEUS_ROOT, 'handoffs', department);
    
    try {
      const files = await fs.readdir(handoffDir);
      const handoffFiles = files
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse()
        .slice(0, limit);

      const handoffs: Array<{ file: string; content: string }> = [];
      
      for (const file of handoffFiles) {
        const content = await fs.readFile(path.join(handoffDir, file), 'utf-8');
        handoffs.push({ file, content });
      }

      return {
        success: true,
        handoffs,
      };
    } catch {
      return {
        success: true,
        handoffs: [],
        message: 'No handoffs found for this department',
      };
    }
  },
});

/**
 * Tool to log agent action
 */
export const logAgentActionTool = tool({
  name: 'log_agent_action',
  description: 'Log an agent action for audit trail',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    agentName: z.string().describe('Name of the agent'),
    actionType: z.string().describe('Type of action (e.g., TASK_EXECUTION, PHASE_BREAKDOWN)'),
    description: z.string().describe('Description of the action'),
    result: z.string().describe('Result of the action'),
  }),
  async execute({ projectId, agentName, actionType, description, result }) {
    const timestamp = new Date().toISOString();
    const logDir = path.join(ZEUS_ROOT, 'logs', 'agents');
    const logFile = path.join(logDir, `${projectId}.log`);

    const logEntry = `[${timestamp}] [${agentName}] [${actionType}] ${description} -> ${result}\n`;

    try {
      await fs.mkdir(logDir, { recursive: true });
      await fs.appendFile(logFile, logEntry);

      return {
        success: true,
        message: 'Action logged',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to log action: ${error}`,
      };
    }
  },
});
