import * as fs from 'fs/promises';
import * as path from 'path';
import type { ProjectConfig, ProjectStatus } from './types/index.js';
import { loadAgentRegistry } from './lib/registry.js';
import {
  callCompanyHead,
  callDeptHead,
  callAgent,
  type DepartmentTask,
  type AgentAssignment,
} from './lib/agent-caller.js';
import {
  saveHandoffToFile,
  logAgentAction,
  getDeptCode,
} from './lib/handoff-manager.js';

const ZEUS_ROOT = process.cwd();

export interface OrchestratorOptions {
  projectId: string;
  startPhase?: number;
  dryRun?: boolean;
}

export interface OrchestratorResult {
  success: boolean;
  projectId: string;
  phasesCompleted: number[];
  errors: string[];
  summary: string;
}

export async function runProject(options: OrchestratorOptions): Promise<OrchestratorResult> {
  const { projectId, startPhase = 0, dryRun = false } = options;

  console.log('═'.repeat(60));
  console.log(`ZEUS ORCHESTRATOR - Project: ${projectId}`);
  console.log('═'.repeat(60));

  const errors: string[] = [];
  const phasesCompleted: number[] = [];

  try {
    // Load project configuration
    const project = await loadProject(projectId);
    if (!project) {
      return {
        success: false,
        projectId,
        phasesCompleted: [],
        errors: [`Project not found: ${projectId}`],
        summary: 'Failed to load project',
      };
    }

    console.log(`\nProject: ${project.config.projectName}`);
    console.log(`Current Phase: ${project.status.currentPhase}`);
    console.log(`Status: ${project.status.status}`);

    if (dryRun) {
      console.log('\n[DRY RUN MODE - No API calls will be made]');
    }

    // Load agent registry
    const registry = await loadAgentRegistry();
    console.log(`\nLoaded ${Object.keys(registry.departments).length} departments`);

    // Determine which phase to run
    const phaseToRun = startPhase ?? project.status.currentPhase;

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`PHASE ${phaseToRun}`);
    console.log('─'.repeat(60));

    if (dryRun) {
      console.log('[DRY RUN] Would call Company Head to break down phase');
      return {
        success: true,
        projectId,
        phasesCompleted: [],
        errors: [],
        summary: 'Dry run completed successfully',
      };
    }

    // Step 1: Call Company Head to break down the phase
    console.log('\n[STEP 1] Company Head - Phase Breakdown');

    const companyHeadResult = await callCompanyHead({
      projectId,
      projectConfig: project.config,
      productSpec: project.productSpec,
      phasePlan: project.phasePlan,
      currentPhase: phaseToRun,
    });

    if (!companyHeadResult.success) {
      errors.push('Company Head failed to break down phase');
      return {
        success: false,
        projectId,
        phasesCompleted,
        errors,
        summary: 'Failed at Company Head phase breakdown',
      };
    }

    await logAgentAction(
      projectId,
      'company_head',
      'PHASE_BREAKDOWN',
      `Broke down Phase ${phaseToRun} into department tasks`,
      `${companyHeadResult.departmentTasks.length} departments assigned`
    );

    // Step 2: Execute departments sequentially (sorted by order)
    const sortedDepts = [...companyHeadResult.departmentTasks].sort((a, b) => a.order - b.order);

    console.log(`\n[STEP 2] Executing ${sortedDepts.length} departments sequentially`);

    for (const deptTask of sortedDepts) {
      console.log(`\n${'─'.repeat(40)}`);
      console.log(`DEPARTMENT: ${deptTask.department} (Order: ${deptTask.order})`);
      console.log('─'.repeat(40));

      const deptResult = await executeDepartment(
        projectId,
        project.config,
        deptTask,
        registry
      );

      if (!deptResult.success) {
        errors.push(`Department ${deptTask.department} failed: ${deptResult.error}`);
        console.log(`\n[ERROR] Department ${deptTask.department} failed. Stopping execution.`);
        break;
      }

      console.log(`\n[SUCCESS] Department ${deptTask.department} completed`);
    }

    if (errors.length === 0) {
      phasesCompleted.push(phaseToRun);

      // Update project status
      await updateProjectStatus(projectId, {
        currentPhase: phaseToRun + 1,
        status: 'ACTIVE',
        phaseName: getPhaseName(phaseToRun + 1),
        blockingIssues: [],
        nextAction: `Begin Phase ${phaseToRun + 1}`,
      });

      console.log(`\n${'═'.repeat(60)}`);
      console.log(`PHASE ${phaseToRun} COMPLETED SUCCESSFULLY`);
      console.log('═'.repeat(60));
    }

    return {
      success: errors.length === 0,
      projectId,
      phasesCompleted,
      errors,
      summary: errors.length === 0
        ? `Phase ${phaseToRun} completed successfully`
        : `Phase ${phaseToRun} failed with ${errors.length} errors`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(errorMessage);

    return {
      success: false,
      projectId,
      phasesCompleted,
      errors,
      summary: `Orchestrator error: ${errorMessage}`,
    };
  }
}

interface DepartmentExecutionResult {
  success: boolean;
  error?: string;
  tasksCompleted: number;
}

function normalizeDepartmentName(name: string): string {
  const mapping: Record<string, string> = {
    'architecture': 'architecture',
    'Architecture': 'architecture',
    'data': 'data',
    'Data': 'data',
    'api': 'api',
    'API': 'api',
    'ui': 'ui',
    'UI': 'ui',
    'qa_security': 'qa_security',
    'qa & security': 'qa_security',
    'QA & Security': 'qa_security',
    'QA': 'qa_security',
    'qa': 'qa_security',
  };
  return mapping[name] || name.toLowerCase().replace(/\s+&\s+/g, '_').replace(/\s+/g, '_');
}

async function executeDepartment(
  projectId: string,
  projectConfig: ProjectConfig,
  deptTask: DepartmentTask,
  registry: Awaited<ReturnType<typeof loadAgentRegistry>>
): Promise<DepartmentExecutionResult> {
  const department = normalizeDepartmentName(deptTask.department);
  const deptRegistry = registry.departments[department];

  if (!deptRegistry) {
    return {
      success: false,
      error: `Department not found in registry: ${department}`,
      tasksCompleted: 0,
    };
  }

  const availableAgents = deptRegistry.agents.map(a => a.name);

  // Step 2a: Call Department Head to assign tasks to sub-agents
  console.log(`\n[DEPT HEAD] Assigning tasks to sub-agents`);

  const deptHeadResult = await callDeptHead({
    projectId,
    projectConfig,
    department,
    departmentTasks: JSON.stringify(deptTask.tasks, null, 2),
    availableAgents,
  });

  if (!deptHeadResult.success) {
    return {
      success: false,
      error: 'Department Head failed to assign tasks',
      tasksCompleted: 0,
    };
  }

  await logAgentAction(
    projectId,
    `${department}_department_head`,
    'TASK_ASSIGNMENT',
    `Assigned ${deptHeadResult.assignments.length} tasks to sub-agents`,
    'Assignments created'
  );

  // Step 2b: Execute sub-agent tasks sequentially
  let tasksCompleted = 0;

  for (const assignment of deptHeadResult.assignments) {
    console.log(`\n[SUB-AGENT] ${assignment.assignedTo} - Task: ${assignment.taskId}`);

    const agentResult = await callAgent({
      agentName: assignment.assignedTo,
      agentLevel: 'subAgent',
      projectId,
      projectConfig,
      taskDescription: assignment.instructions,
      successCriteria: assignment.successCriteria,
    });

    // Save handoff
    await saveHandoffToFile(projectId, department, agentResult.handoffResult);

    await logAgentAction(
      projectId,
      assignment.assignedTo,
      'TASK_EXECUTION',
      assignment.instructions.substring(0, 200),
      agentResult.handoffResult.status
    );

    if (!agentResult.success) {
      // Check if it's a blocker
      if (agentResult.handoffResult.status === 'blocked') {
        console.log(`\n[BLOCKED] Agent ${assignment.assignedTo} hit a blocker`);
        return {
          success: false,
          error: `Agent ${assignment.assignedTo} blocked: ${agentResult.handoffResult.blockerReport?.details}`,
          tasksCompleted,
        };
      }

      // For failures, we could implement retry logic here
      console.log(`\n[FAILED] Agent ${assignment.assignedTo} failed task`);
      return {
        success: false,
        error: `Agent ${assignment.assignedTo} failed task ${assignment.taskId}`,
        tasksCompleted,
      };
    }

    tasksCompleted++;
    console.log(`  ✓ Task completed (${tasksCompleted}/${deptHeadResult.assignments.length})`);
  }

  return {
    success: true,
    tasksCompleted,
  };
}

interface LoadedProject {
  config: ProjectConfig;
  status: ProjectStatus;
  productSpec: string;
  phasePlan: string;
}

async function loadProject(projectId: string): Promise<LoadedProject | null> {
  const projectDir = path.join(ZEUS_ROOT, 'projects', projectId);

  try {
    // Load PROJECT_CONFIG.json
    const configPath = path.join(projectDir, 'PROJECT_CONFIG.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config: ProjectConfig = JSON.parse(configContent);

    // Load PROJECT_STATUS.md and parse it
    const statusPath = path.join(projectDir, 'PROJECT_STATUS.md');
    const statusContent = await fs.readFile(statusPath, 'utf-8');
    const status = parseProjectStatus(statusContent);

    // Load PRODUCT_SPEC.md
    const specPath = path.join(projectDir, 'PRODUCT_SPEC.md');
    const productSpec = await fs.readFile(specPath, 'utf-8');

    // Load PHASE_PLAN.md
    const phasePath = path.join(projectDir, 'PHASE_PLAN.md');
    const phasePlan = await fs.readFile(phasePath, 'utf-8');

    return {
      config,
      status,
      productSpec,
      phasePlan,
    };
  } catch (error) {
    console.error(`Failed to load project ${projectId}:`, error);
    return null;
  }
}

function parseProjectStatus(content: string): ProjectStatus {
  // Parse status from markdown
  const statusMatch = content.match(/\| Status \| (\w+) \|/);
  const phaseMatch = content.match(/\| Current Phase \| (\d+) \|/);
  const phaseNameMatch = content.match(/\| Phase Name \| ([^|]+) \|/);

  return {
    status: (statusMatch?.[1] as ProjectStatus['status']) || 'CREATED',
    currentPhase: parseInt(phaseMatch?.[1] || '0', 10),
    phaseName: phaseNameMatch?.[1]?.trim() || 'Foundation',
    blockingIssues: [],
    nextAction: '',
  };
}

async function updateProjectStatus(
  projectId: string,
  status: Partial<ProjectStatus>
): Promise<void> {
  const statusPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PROJECT_STATUS.md');

  try {
    let content = await fs.readFile(statusPath, 'utf-8');

    if (status.status) {
      content = content.replace(/\| Status \| \w+ \|/, `| Status | ${status.status} |`);
    }

    if (status.currentPhase !== undefined) {
      content = content.replace(/\| Current Phase \| \d+ \|/, `| Current Phase | ${status.currentPhase} |`);
    }

    if (status.phaseName) {
      content = content.replace(/\| Phase Name \| [^|]+ \|/, `| Phase Name | ${status.phaseName} |`);
    }

    if (status.nextAction) {
      content = content.replace(/\| Next Action \| [^|]+ \|/, `| Next Action | ${status.nextAction} |`);
    }

    await fs.writeFile(statusPath, content);
  } catch (error) {
    console.error('Failed to update project status:', error);
  }
}

function getPhaseName(phase: number): string {
  const names: Record<number, string> = {
    0: 'Foundation',
    1: 'Schema & Data',
    2: 'API Layer',
    3: 'UI Layer',
    4: 'Integration',
    5: 'QA & Hardening',
    6: 'Deployment',
  };
  return names[phase] || `Phase ${phase}`;
}

export async function listProjects(): Promise<string[]> {
  const projectsDir = path.join(ZEUS_ROOT, 'projects');
  const entries = await fs.readdir(projectsDir, { withFileTypes: true });

  return entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name);
}

export async function createProject(
  projectName: string,
  productSpec?: string
): Promise<string> {
  const projectId = projectName.toLowerCase().replace(/\s+/g, '-');
  const projectDir = path.join(ZEUS_ROOT, 'projects', projectId);
  const templateDir = path.join(ZEUS_ROOT, 'projects', '_template');

  // Copy template
  await fs.cp(templateDir, projectDir, { recursive: true });

  // Create PROJECT_CONFIG.json
  const config: ProjectConfig = {
    projectId,
    projectName,
    codebasePath: './src',
    commands: {
      lint: 'npm run lint',
      typecheck: 'npm run typecheck',
      test: 'npm run test',
      build: 'npm run build',
      dev: 'npm run dev',
    },
    paths: {
      src: '/src',
      types: '/src/types',
      migrations: '/supabase/migrations',
      components: '/src/components',
    },
  };

  await fs.writeFile(
    path.join(projectDir, 'PROJECT_CONFIG.json'),
    JSON.stringify(config, null, 2)
  );

  // Create memory directory
  await fs.mkdir(path.join(projectDir, 'memory'), { recursive: true });

  // Update PRODUCT_SPEC.md if provided
  if (productSpec) {
    const specPath = path.join(projectDir, 'PRODUCT_SPEC.md');
    let specContent = await fs.readFile(specPath, 'utf-8');
    specContent = specContent.replace(
      '**[MUST BE FILLED BY COMPANY HEAD]**',
      productSpec
    );
    await fs.writeFile(specPath, specContent);
  }

  console.log(`Created project: ${projectId}`);
  return projectId;
}
