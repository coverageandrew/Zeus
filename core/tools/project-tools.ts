import { tool } from '@openai/agents';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const ZEUS_ROOT = process.cwd();

/**
 * Tool to load project configuration
 */
export const loadProjectConfigTool = tool({
  name: 'load_project_config',
  description: 'Load the PROJECT_CONFIG.json for a project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
  }),
  async execute({ projectId }) {
    const configPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PROJECT_CONFIG.json');
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      return {
        success: true,
        config,
      };
    } catch (error) {
      return {
        success: false,
        config: null,
        error: `Failed to load project config: ${error}`,
      };
    }
  },
});

/**
 * Tool to load product specification
 */
export const loadProductSpecTool = tool({
  name: 'load_product_spec',
  description: 'Load the PRODUCT_SPEC.md for a project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
  }),
  async execute({ projectId }) {
    const specPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PRODUCT_SPEC.md');
    try {
      const content = await fs.readFile(specPath, 'utf-8');
      return {
        success: true,
        spec: content,
      };
    } catch (error) {
      return {
        success: false,
        spec: null,
        error: `Failed to load product spec: ${error}`,
      };
    }
  },
});

/**
 * Tool to load phase plan
 */
export const loadPhasePlanTool = tool({
  name: 'load_phase_plan',
  description: 'Load the PHASE_PLAN.md for a project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
  }),
  async execute({ projectId }) {
    const planPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PHASE_PLAN.md');
    try {
      const content = await fs.readFile(planPath, 'utf-8');
      return {
        success: true,
        plan: content,
      };
    } catch (error) {
      return {
        success: false,
        plan: null,
        error: `Failed to load phase plan: ${error}`,
      };
    }
  },
});

/**
 * Tool to load project status
 */
export const loadProjectStatusTool = tool({
  name: 'load_project_status',
  description: 'Load the PROJECT_STATUS.md for a project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
  }),
  async execute({ projectId }) {
    const statusPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PROJECT_STATUS.md');
    try {
      const content = await fs.readFile(statusPath, 'utf-8');
      
      // Parse status from markdown
      const statusMatch = content.match(/\| Status \| (\w+) \|/);
      const phaseMatch = content.match(/\| Current Phase \| (\d+) \|/);
      const phaseNameMatch = content.match(/\| Phase Name \| ([^|]+) \|/);

      return {
        success: true,
        raw: content,
        parsed: {
          status: statusMatch?.[1] || 'UNKNOWN',
          currentPhase: parseInt(phaseMatch?.[1] || '0', 10),
          phaseName: phaseNameMatch?.[1]?.trim() || 'Unknown',
        },
      };
    } catch (error) {
      return {
        success: false,
        raw: null,
        parsed: null,
        error: `Failed to load project status: ${error}`,
      };
    }
  },
});

/**
 * Tool to update project status
 */
export const updateProjectStatusTool = tool({
  name: 'update_project_status',
  description: 'Update the PROJECT_STATUS.md for a project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    status: z.string().optional().describe('New status (CREATED, ACTIVE, BLOCKED, COMPLETED)'),
    currentPhase: z.number().optional().describe('Current phase number (0-6)'),
    phaseName: z.string().optional().describe('Name of the current phase'),
    nextAction: z.string().optional().describe('Next action to take'),
  }),
  async execute({ projectId, status, currentPhase, phaseName, nextAction }) {
    const statusPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PROJECT_STATUS.md');
    
    try {
      let content = await fs.readFile(statusPath, 'utf-8');

      if (status) {
        content = content.replace(/\| Status \| \w+ \|/, `| Status | ${status} |`);
      }

      if (currentPhase !== undefined) {
        content = content.replace(/\| Current Phase \| \d+ \|/, `| Current Phase | ${currentPhase} |`);
      }

      if (phaseName) {
        content = content.replace(/\| Phase Name \| [^|]+ \|/, `| Phase Name | ${phaseName} |`);
      }

      if (nextAction) {
        content = content.replace(/\| Next Action \| [^|]+ \|/, `| Next Action | ${nextAction} |`);
      }

      await fs.writeFile(statusPath, content);

      return {
        success: true,
        message: 'Project status updated',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update project status: ${error}`,
      };
    }
  },
});

/**
 * Tool to list all projects
 */
export const listProjectsTool = tool({
  name: 'list_projects',
  description: 'List all available projects',
  parameters: z.object({}),
  async execute() {
    const projectsDir = path.join(ZEUS_ROOT, 'projects');
    try {
      const entries = await fs.readdir(projectsDir, { withFileTypes: true });
      const projects = entries
        .filter(e => e.isDirectory() && !e.name.startsWith('_'))
        .map(e => e.name);

      return {
        success: true,
        projects,
      };
    } catch (error) {
      return {
        success: false,
        projects: [],
        error: `Failed to list projects: ${error}`,
      };
    }
  },
});

/**
 * Tool to get project path
 */
export const getProjectPathTool = tool({
  name: 'get_project_path',
  description: 'Get the absolute path to a project directory',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
  }),
  async execute({ projectId }) {
    const projectPath = path.join(ZEUS_ROOT, 'projects', projectId);
    try {
      await fs.access(projectPath);
      return {
        success: true,
        path: projectPath,
      };
    } catch {
      return {
        success: false,
        path: null,
        error: `Project not found: ${projectId}`,
      };
    }
  },
});
