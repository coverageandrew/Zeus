import { Agent } from '@openai/agents';
import type { HandoffPayload, HandoffResult, BlockerReport } from '../types/index.js';
import type { AgentLevel } from '../types/index.js';
import { runAgent, parseJsonFromOutput, getModelForLevel } from './agents-client.js';
import { loadMemory, saveMemory, createEmptyMemory, addInteraction, getMemoryContext } from './memory-store.js';
import { normalizeAgentName } from './registry.js';
import { createSubAgent, getSubAgentConfig } from '../agents/sub-agents/index.js';
import {
  readFileTool,
  writeFileTool,
  listDirectoryTool,
  loadMemoryTool,
  saveMemoryTool,
  createHandoffTool,
  getProjectPathTool,
} from '../tools/index.js';

export interface AgentCallOptions {
  agentName: string;
  agentLevel: AgentLevel;
  projectId: string;
  projectConfig: HandoffPayload['projectConfig'];
  taskDescription: string;
  successCriteria: string[];
  previousOutput?: string;
  relevantSSoTDocs?: string[];
}

export interface AgentCallResult {
  success: boolean;
  output: string;
  handoffResult: HandoffResult;
  tokensUsed?: {
    input: number;
    output: number;
  };
}

/**
 * Call a sub-agent using the Agents SDK
 */
export async function callAgent(options: AgentCallOptions): Promise<AgentCallResult> {
  const {
    agentLevel,
    projectId,
    projectConfig,
    taskDescription,
    successCriteria,
    previousOutput,
  } = options;

  // Normalize agent name immediately at entry point
  const agentName = normalizeAgentName(options.agentName);

  console.log(`\n[AGENT CALL] ${agentName} (${agentLevel})`);
  console.log(`  Project: ${projectId}`);
  console.log(`  Task: ${taskDescription.substring(0, 100)}...`);

  // Load agent memory for context
  let memory = await loadMemory(projectId, agentName);
  if (!memory) {
    memory = createEmptyMemory(projectId, agentName);
  }
  const memoryContext = getMemoryContext(memory);

  // Get model for this agent level
  const model = getModelForLevel(agentLevel, projectConfig.models);
  console.log(`  Model: ${model}`);

  // Get sub-agent config
  const agentConfig = getSubAgentConfig(agentName);

  // Create the agent with tools
  const agent = agentConfig
    ? await createSubAgent(agentConfig, [
        readFileTool,
        writeFileTool,
        listDirectoryTool,
        loadMemoryTool,
        saveMemoryTool,
        createHandoffTool,
        getProjectPathTool,
      ])
    : new Agent({
        name: agentName,
        instructions: `You are ${agentName}. Complete the assigned task.

## Memory Context
${memoryContext}

## Project Configuration
- Project ID: ${projectId}
- Commands: ${JSON.stringify(projectConfig.commands)}
- Paths: ${JSON.stringify(projectConfig.paths)}
`,
        model,
        tools: [
          readFileTool,
          writeFileTool,
          listDirectoryTool,
          createHandoffTool,
        ],
      });

  // Build the input prompt
  const inputPrompt = buildTaskPrompt(taskDescription, successCriteria, previousOutput, projectId);

  try {
    // Run the agent using SDK
    const result = await runAgent(agent, inputPrompt);
    const response = result.finalOutput;

    // Parse response for blocker detection
    const blockerReport = detectBlocker(response, agentName);

    // Update memory with this interaction
    const updatedMemory = await addInteraction(memory, {
      taskId: `TASK-${Date.now()}`,
      input: taskDescription.substring(0, 500),
      output: response.substring(0, 1000),
      outcome: blockerReport ? 'failure' : 'success',
    });

    await saveMemory(updatedMemory);

    // Build handoff result
    const handoffResult: HandoffResult = {
      handoffId: `HO-${Date.now()}`,
      agentName,
      taskId: `TASK-${Date.now()}`,
      status: blockerReport ? 'blocked' : 'completed',
      output: response,
      artifacts: extractArtifacts(response),
      blockerReport,
      timestamp: new Date().toISOString(),
    };

    console.log(`  Status: ${handoffResult.status}`);

    return {
      success: !blockerReport,
      output: response,
      handoffResult,
    };
  } catch (error) {
    console.error(`  Error: ${error}`);

    const handoffResult: HandoffResult = {
      handoffId: `HO-${Date.now()}`,
      agentName,
      taskId: `TASK-${Date.now()}`,
      status: 'failed',
      output: `Error calling agent: ${error}`,
      artifacts: [],
      timestamp: new Date().toISOString(),
    };

    return {
      success: false,
      output: `Error: ${error}`,
      handoffResult,
    };
  }
}

/**
 * Build task prompt for agent input
 */
function buildTaskPrompt(
  taskDescription: string,
  successCriteria: string[],
  previousOutput?: string,
  projectId?: string
): string {
  let prompt = `## Task

${taskDescription}

## Success Criteria

${successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}
`;

  if (projectId) {
    prompt += `\n## Project ID\n${projectId}\n`;
  }

  if (previousOutput) {
    prompt += `\n## Previous Agent Output\n${previousOutput}\n`;
  }

  prompt += `
## Instructions

1. Use the available tools to complete the task
2. Read files to understand context before making changes
3. Write files to create or modify code
4. Create a handoff when complete with status and artifacts
5. If blocked, report the blocker clearly
`;

  return prompt;
}

export interface CompanyHeadCallOptions {
  projectId: string;
  projectConfig: HandoffPayload['projectConfig'];
  productSpec: string;
  phasePlan: string;
  currentPhase: number;
}

export interface DepartmentTask {
  department: string;
  order: number;
  tasks: Array<{
    taskId: string;
    description: string;
    successCriteria: string[];
    requiredArtifacts: string[];
    dependencies: string[];
  }>;
}

export interface CompanyHeadResult {
  success: boolean;
  phase: number;
  departmentTasks: DepartmentTask[];
  rawOutput: string;
}

export async function callCompanyHead(options: CompanyHeadCallOptions): Promise<CompanyHeadResult> {
  const { projectId, projectConfig, productSpec, phasePlan, currentPhase } = options;

  console.log(`\n[COMPANY HEAD CALL]`);
  console.log(`  Project: ${projectId}`);
  console.log(`  Phase: ${currentPhase}`);

  // Load memory
  let memory = await loadMemory(projectId, 'company_head');
  if (!memory) {
    memory = createEmptyMemory(projectId, 'company_head');
  }
  const memoryContext = getMemoryContext(memory);

  const model = getModelForLevel('companyHead', projectConfig.models);
  console.log(`  Model: ${model}`);

  // Create Company Head agent with tools
  const companyHeadAgent = new Agent({
    name: 'CompanyHead',
    instructions: `You are the Company Head responsible for breaking down project phases into department tasks.

## Memory Context
${memoryContext}

## Your Role
- Analyze the product specification and phase plan
- Break down the current phase into tasks for each department
- Assign tasks in dependency order: architecture → data → api → ui → qa_security

## Output Format
You MUST output valid JSON in the following format:

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
`,
    model,
    tools: [
      readFileTool,
      listDirectoryTool,
      loadMemoryTool,
    ],
  });

  // Build input prompt
  const inputPrompt = `## Product Specification

${productSpec}

## Phase Plan

${phasePlan}

## Current Phase: ${currentPhase}

Please analyze the product specification and break down Phase ${currentPhase} into department tasks.
Output your response as JSON with the department task assignments.`;

  try {
    const result = await runAgent(companyHeadAgent, inputPrompt);
    const response = result.finalOutput;

    // Parse JSON from response
    const parsed = parseJsonFromOutput<{ phase: number; departmentTasks: DepartmentTask[] }>(response);
    const departmentTasks = parsed?.departmentTasks || [];

    // Update memory
    const updatedMemory = await addInteraction(memory, {
      taskId: `PHASE-${currentPhase}`,
      input: `Break down Phase ${currentPhase}`,
      output: `Created ${departmentTasks.length} department task assignments`,
      outcome: departmentTasks.length > 0 ? 'success' : 'failure',
    });

    await saveMemory(updatedMemory);

    console.log(`  Departments: ${departmentTasks.map(d => d.department).join(', ')}`);

    return {
      success: departmentTasks.length > 0,
      phase: currentPhase,
      departmentTasks,
      rawOutput: response,
    };
  } catch (error) {
    console.error(`  Error: ${error}`);
    return {
      success: false,
      phase: currentPhase,
      departmentTasks: [],
      rawOutput: `Error: ${error}`,
    };
  }
}

export interface DeptHeadCallOptions {
  projectId: string;
  projectConfig: HandoffPayload['projectConfig'];
  department: string;
  departmentTasks: string;
  availableAgents: string[];
}

export interface AgentAssignment {
  taskId: string;
  assignedTo: string;
  instructions: string;
  successCriteria: string[];
  skillsRequired: string[];
}

export interface DeptHeadResult {
  success: boolean;
  assignments: AgentAssignment[];
  rawOutput: string;
}

export async function callDeptHead(options: DeptHeadCallOptions): Promise<DeptHeadResult> {
  const { projectId, projectConfig, department, departmentTasks, availableAgents } = options;

  const agentName = `${department}_department_head`;

  console.log(`\n[DEPT HEAD CALL] ${department}`);
  console.log(`  Project: ${projectId}`);
  console.log(`  Agents: ${availableAgents.join(', ')}`);

  // Load memory
  let memory = await loadMemory(projectId, agentName);
  if (!memory) {
    memory = createEmptyMemory(projectId, agentName);
  }
  const memoryContext = getMemoryContext(memory);

  const model = getModelForLevel('deptHead', projectConfig.models);
  console.log(`  Model: ${model}`);

  // Create Department Head agent with tools
  const deptHeadAgent = new Agent({
    name: `${department}DeptHead`,
    instructions: `You are the ${department} Department Head responsible for assigning tasks to sub-agents.

## Memory Context
${memoryContext}

## Your Role
- Review the tasks assigned to your department
- Assign each task to the most appropriate sub-agent
- Provide clear instructions and success criteria for each assignment

## Available Sub-Agents
${availableAgents.map(a => `- ${a}`).join('\n')}

## Output Format
You MUST output valid JSON in the following format:

\`\`\`json
{
  "assignments": [
    {
      "taskId": "TASK-${department.toUpperCase()}-<YYYYMMDD>-<###>",
      "assignedTo": "<agent_name>",
      "instructions": "<detailed_instructions>",
      "successCriteria": ["<criterion_1>", "<criterion_2>"],
      "skillsRequired": ["<skill_1>", "<skill_2>"]
    }
  ]
}
\`\`\`
`,
    model,
    tools: [
      readFileTool,
      listDirectoryTool,
      loadMemoryTool,
    ],
  });

  // Build input prompt
  const inputPrompt = `## Department Tasks

${departmentTasks}

## Available Agents
${availableAgents.join(', ')}

Please assign these tasks to the appropriate sub-agents.
Output your response as JSON with the agent assignments.`;

  try {
    const result = await runAgent(deptHeadAgent, inputPrompt);
    const response = result.finalOutput;

    // Parse JSON from response
    const parsed = parseJsonFromOutput<{ assignments: AgentAssignment[] }>(response);
    const assignments = parsed?.assignments || [];

    // Update memory
    const updatedMemory = await addInteraction(memory, {
      taskId: `DEPT-${department}-${Date.now()}`,
      input: `Assign tasks to sub-agents`,
      output: `Created ${assignments.length} agent assignments`,
      outcome: assignments.length > 0 ? 'success' : 'failure',
    });

    await saveMemory(updatedMemory);

    console.log(`  Assignments: ${assignments.length}`);

    return {
      success: assignments.length > 0,
      assignments,
      rawOutput: response,
    };
  } catch (error) {
    console.error(`  Error: ${error}`);
    return {
      success: false,
      assignments: [],
      rawOutput: `Error: ${error}`,
    };
  }
}

function detectBlocker(response: string, agentName: string): BlockerReport | undefined {
  const blockerPatterns = [
    /## BLOCKER REPORT/i,
    /BLOCKER:/i,
    /I cannot proceed/i,
    /I am blocked/i,
    /Missing required/i,
  ];

  for (const pattern of blockerPatterns) {
    if (pattern.test(response)) {
      return {
        agentName,
        taskId: `TASK-${Date.now()}`,
        blockerType: 'ambiguous_instruction',
        details: extractBlockerDetails(response),
        requestedAction: 'Review and clarify instructions',
      };
    }
  }

  return undefined;
}

function extractBlockerDetails(response: string): string {
  const blockerMatch = response.match(/## BLOCKER REPORT[\s\S]*?(?=##|$)/i);
  if (blockerMatch) {
    return blockerMatch[0].substring(0, 500);
  }
  return 'Agent reported a blocker. See full output for details.';
}

function extractArtifacts(response: string): string[] {
  const artifacts: string[] = [];

  // Look for file paths in the response
  const pathPatterns = [
    /Created:\s*`([^`]+)`/g,
    /Modified:\s*`([^`]+)`/g,
    /File:\s*`([^`]+)`/g,
    /\|\s*([^|]+\.(?:ts|tsx|js|jsx|json|md|sql|css|html))\s*\|/g,
  ];

  for (const pattern of pathPatterns) {
    let match;
    while ((match = pattern.exec(response)) !== null) {
      const artifact = match[1].trim();
      if (artifact && !artifacts.includes(artifact)) {
        artifacts.push(artifact);
      }
    }
  }

  return artifacts;
}
