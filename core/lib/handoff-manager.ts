import * as fs from 'fs/promises';
import * as path from 'path';
import type { HandoffPayload, HandoffResult, ValidationResult, TaskSpec } from '../types/index.js';
import type { ProjectConfig } from '../types/index.js';

const ZEUS_ROOT = process.cwd();

export function createHandoffId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `HO-${timestamp}-${random}`;
}

export function createTaskId(deptCode: string): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const sequence = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `TASK-${deptCode}-${date}-${sequence}`;
}

export function getDeptCode(department: string): string {
  const codes: Record<string, string> = {
    architecture: 'ARCH',
    data: 'DATA',
    api: 'API',
    ui: 'UI',
    qa_security: 'QA',
  };
  return codes[department] || department.toUpperCase().substring(0, 4);
}

export function createHandoffPayload(
  fromAgent: string,
  toAgent: string,
  projectId: string,
  projectConfig: ProjectConfig,
  currentPhase: number,
  taskSpec: TaskSpec,
  ssotContext: string[] = [],
  skillContext: string[] = [],
  previousOutput?: string
): HandoffPayload {
  return {
    handoffId: createHandoffId(),
    fromAgent,
    toAgent,
    projectId,
    projectConfig,
    currentPhase,
    taskSpec,
    successCriteria: taskSpec.requiredArtifacts,
    ssotContext,
    skillContext,
    previousOutput,
    memoryKey: `${projectId}/${toAgent}`,
  };
}

export function validateHandoffResult(result: HandoffResult): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!result.handoffId) {
    errors.push('Missing handoff ID');
  }

  if (!result.agentName) {
    errors.push('Missing agent name');
  }

  if (!result.taskId) {
    errors.push('Missing task ID');
  }

  if (!result.output || result.output.trim().length === 0) {
    errors.push('Empty output');
  }

  if (result.status === 'blocked' && !result.blockerReport) {
    warnings.push('Status is blocked but no blocker report provided');
  }

  if (result.status === 'completed' && result.artifacts.length === 0) {
    warnings.push('Task completed but no artifacts listed');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export async function saveHandoffToFile(
  projectId: string,
  department: string,
  result: HandoffResult
): Promise<string> {
  const handoffDir = path.join(ZEUS_ROOT, 'projects', projectId, 'handoffs', department);
  await fs.mkdir(handoffDir, { recursive: true });

  const filename = `${result.taskId}.md`;
  const filepath = path.join(handoffDir, filename);

  const content = formatHandoffMarkdown(result);
  await fs.writeFile(filepath, content);

  return filepath;
}

export async function saveHandoffToGlobalDir(
  department: string,
  result: HandoffResult
): Promise<string> {
  const handoffDir = path.join(ZEUS_ROOT, 'handoffs', department);
  await fs.mkdir(handoffDir, { recursive: true });

  const filename = `${result.taskId}.md`;
  const filepath = path.join(handoffDir, filename);

  const content = formatHandoffMarkdown(result);
  await fs.writeFile(filepath, content);

  return filepath;
}

function formatHandoffMarkdown(result: HandoffResult): string {
  const lines: string[] = [];

  lines.push(`# Handoff: ${result.taskId}`);
  lines.push('');
  lines.push(`> **Status:** ${result.status.toUpperCase()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 1. Task Identification');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| Task ID | ${result.taskId} |`);
  lines.push(`| Agent | ${result.agentName} |`);
  lines.push(`| Handoff ID | ${result.handoffId} |`);
  lines.push(`| Date Submitted | ${result.timestamp} |`);
  lines.push(`| Status | ${result.status} |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 2. Agent Output');
  lines.push('');
  lines.push(result.output);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 3. Artifacts Created');
  lines.push('');
  if (result.artifacts.length > 0) {
    lines.push('| File | Path |');
    lines.push('|------|------|');
    for (const artifact of result.artifacts) {
      const filename = artifact.split('/').pop() || artifact;
      lines.push(`| ${filename} | \`${artifact}\` |`);
    }
  } else {
    lines.push('No artifacts listed.');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  if (result.blockerReport) {
    lines.push('## 4. Blocker Report');
    lines.push('');
    lines.push(`**Blocker Type:** ${result.blockerReport.blockerType}`);
    lines.push('');
    lines.push('**Details:**');
    lines.push(result.blockerReport.details);
    lines.push('');
    lines.push('**Requested Action:**');
    lines.push(result.blockerReport.requestedAction);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  if (result.nextTasks && result.nextTasks.length > 0) {
    lines.push('## 5. Next Tasks');
    lines.push('');
    for (const task of result.nextTasks) {
      lines.push(`### ${task.taskId}`);
      lines.push('');
      lines.push(`**Description:** ${task.description}`);
      lines.push('');
      lines.push('**Required Artifacts:**');
      for (const artifact of task.requiredArtifacts) {
        lines.push(`- ${artifact}`);
      }
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  lines.push('*Generated by Zeus Orchestrator*');

  return lines.join('\n');
}

export async function logApiCall(
  projectId: string,
  agentName: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
): Promise<void> {
  const logDir = path.join(ZEUS_ROOT, 'projects', projectId, 'logs');
  await fs.mkdir(logDir, { recursive: true });

  const logFile = path.join(logDir, 'api_costs.json');

  let logData: { totalCost: number; calls: Array<Record<string, unknown>> } = {
    totalCost: 0,
    calls: [],
  };

  try {
    const existing = await fs.readFile(logFile, 'utf-8');
    logData = JSON.parse(existing);
  } catch {
    // File doesn't exist yet
  }

  const callLog = {
    timestamp: new Date().toISOString(),
    agent: agentName,
    model,
    inputTokens,
    outputTokens,
    cost,
  };

  logData.calls.push(callLog);
  logData.totalCost += cost;

  await fs.writeFile(logFile, JSON.stringify(logData, null, 2));
}

export async function logAgentAction(
  projectId: string,
  agentName: string,
  action: string,
  details: string,
  result: string
): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toISOString().split('T')[1].substring(0, 5);

  const logDir = path.join(ZEUS_ROOT, 'projects', projectId, 'logs');
  await fs.mkdir(logDir, { recursive: true });

  const logFile = path.join(logDir, `${date}.md`);

  const entry = `
## [${time}] - ${action}

**Agent:** ${agentName}
**Action:** ${action}
**Details:**
${details}
**Result:** ${result}

---
`;

  try {
    await fs.appendFile(logFile, entry);
  } catch {
    await fs.writeFile(logFile, `# Project Log - ${date}\n\n${entry}`);
  }
}
