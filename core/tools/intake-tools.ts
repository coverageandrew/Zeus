import { tool } from '@openai/agents';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const ZEUS_ROOT = process.cwd();

/**
 * Tool to create a new project folder structure
 */
export const createProjectFolderTool = tool({
  name: 'create_project_folder',
  description: 'Create a new project folder with initial structure',
  parameters: z.object({
    projectId: z.string().describe('Project identifier (kebab-case, e.g., "invoice-manager")'),
    projectName: z.string().describe('Human-readable project name'),
  }),
  async execute({ projectId, projectName }) {
    const projectPath = path.join(ZEUS_ROOT, 'projects', projectId);
    
    try {
      // Check if project already exists
      try {
        await fs.access(projectPath);
        return {
          success: false,
          error: `Project already exists: ${projectId}`,
          path: null,
        };
      } catch {
        // Project doesn't exist, good to create
      }

      // Create project directory structure
      await fs.mkdir(projectPath, { recursive: true });
      await fs.mkdir(path.join(projectPath, 'logs'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'change_requests'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'handoffs'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'intake'), { recursive: true });

      return {
        success: true,
        path: projectPath,
        message: `Created project folder: ${projectPath}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create project folder: ${error}`,
        path: null,
      };
    }
  },
});

/**
 * Tool to create or update PRODUCT_SPEC.md
 */
export const writeProductSpecTool = tool({
  name: 'write_product_spec',
  description: 'Create or update the PRODUCT_SPEC.md file for a project. Call this whenever the spec changes based on user feedback.',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    projectName: z.string().describe('Human-readable project name'),
    goal: z.string().describe('Primary goal/purpose of the application'),
    targetUsers: z.string().describe('Who will use this application'),
    coreFeatures: z.array(z.string()).describe('List of core features (in scope)'),
    nonGoals: z.array(z.string()).describe('List of non-goals (out of scope)'),
    userStories: z.array(z.object({
      actor: z.string().describe('Who (e.g., "freelancer", "admin")'),
      action: z.string().describe('What they want to do'),
      benefit: z.string().describe('Why they want to do it'),
    })).describe('User stories'),
    technicalRequirements: z.object({
      database: z.string().optional().describe('Database choice'),
      auth: z.string().optional().describe('Authentication approach'),
      hosting: z.string().optional().describe('Deployment target'),
      integrations: z.array(z.string()).optional().describe('Third-party integrations'),
      framework: z.string().optional().describe('Frontend/backend framework'),
    }).describe('Technical requirements'),
    uiPreferences: z.object({
      primaryColor: z.string().optional().describe('Primary brand color'),
      secondaryColor: z.string().optional().describe('Secondary color'),
      style: z.string().optional().describe('UI style (minimal, modern, playful, etc.)'),
      components: z.string().optional().describe('Component library preference'),
    }).optional().describe('UI/design preferences'),
    constraints: z.array(z.string()).optional().describe('Any constraints or limitations'),
  }),
  async execute({ 
    projectId, 
    projectName, 
    goal, 
    targetUsers, 
    coreFeatures, 
    nonGoals, 
    userStories, 
    technicalRequirements,
    uiPreferences,
    constraints 
  }) {
    const specPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PRODUCT_SPEC.md');
    
    const userStoriesFormatted = userStories
      .map((s, i) => `${i + 1}. As a **${s.actor}**, I want to **${s.action}** so that **${s.benefit}**`)
      .join('\n');

    const techReqLines: string[] = [];
    if (technicalRequirements.database) techReqLines.push(`- **Database:** ${technicalRequirements.database}`);
    if (technicalRequirements.auth) techReqLines.push(`- **Authentication:** ${technicalRequirements.auth}`);
    if (technicalRequirements.hosting) techReqLines.push(`- **Hosting:** ${technicalRequirements.hosting}`);
    if (technicalRequirements.framework) techReqLines.push(`- **Framework:** ${technicalRequirements.framework}`);
    if (technicalRequirements.integrations?.length) {
      techReqLines.push(`- **Integrations:** ${technicalRequirements.integrations.join(', ')}`);
    }

    const uiLines: string[] = [];
    if (uiPreferences) {
      if (uiPreferences.primaryColor) uiLines.push(`- **Primary Color:** ${uiPreferences.primaryColor}`);
      if (uiPreferences.secondaryColor) uiLines.push(`- **Secondary Color:** ${uiPreferences.secondaryColor}`);
      if (uiPreferences.style) uiLines.push(`- **Style:** ${uiPreferences.style}`);
      if (uiPreferences.components) uiLines.push(`- **Components:** ${uiPreferences.components}`);
    }

    const content = `# Product Specification: ${projectName}

> **Project ID:** ${projectId}
> **Status:** DRAFT
> **Created:** ${new Date().toISOString().split('T')[0]}
> **Last Updated:** ${new Date().toISOString()}

---

## 1. Goal

${goal}

---

## 2. Target Users

${targetUsers}

---

## 3. Core Features (In Scope)

${coreFeatures.map(f => `- ${f}`).join('\n')}

---

## 4. Non-Goals (Out of Scope)

${nonGoals.map(n => `- ${n}`).join('\n')}

---

## 5. User Stories

${userStoriesFormatted}

---

## 6. Technical Requirements

${techReqLines.length > 0 ? techReqLines.join('\n') : '- To be determined'}

---

## 7. UI/Design Preferences

${uiLines.length > 0 ? uiLines.join('\n') : '- To be determined'}

---

## 8. Constraints

${constraints?.length ? constraints.map(c => `- ${c}`).join('\n') : '- None specified'}

---

*Generated by Intake Agent*
`;

    try {
      await fs.writeFile(specPath, content);
      return {
        success: true,
        message: `PRODUCT_SPEC.md written to ${specPath}`,
        path: specPath,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write PRODUCT_SPEC.md: ${error}`,
        path: null,
      };
    }
  },
});

/**
 * Tool to create PROJECT_CONFIG.json
 */
export const writeProjectConfigTool = tool({
  name: 'write_project_config',
  description: 'Create or update the PROJECT_CONFIG.json file for a project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    projectName: z.string().describe('Human-readable project name'),
    techStack: z.object({
      frontend: z.string().optional(),
      backend: z.string().optional(),
      database: z.string().optional(),
      hosting: z.string().optional(),
      auth: z.string().optional(),
    }).describe('Technology stack'),
    features: z.array(z.string()).describe('List of features'),
  }),
  async execute({ projectId, projectName, techStack, features }) {
    const configPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PROJECT_CONFIG.json');
    
    const config = {
      projectId,
      projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'CREATED',
      currentPhase: 0,
      techStack,
      features,
    };

    try {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      return {
        success: true,
        message: `PROJECT_CONFIG.json written to ${configPath}`,
        path: configPath,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write PROJECT_CONFIG.json: ${error}`,
        path: null,
      };
    }
  },
});

/**
 * Tool to create PROJECT_STATUS.md
 */
export const writeProjectStatusTool = tool({
  name: 'write_project_status',
  description: 'Create the initial PROJECT_STATUS.md file for a project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    projectName: z.string().describe('Human-readable project name'),
  }),
  async execute({ projectId, projectName }) {
    const statusPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PROJECT_STATUS.md');
    
    const content = `# Project Status: ${projectName}

> **Project ID:** ${projectId}
> **Last Updated:** ${new Date().toISOString()}

---

## Current State

| Field | Value |
|-------|-------|
| Status | CREATED |
| Current Phase | 0 |
| Phase Name | Foundation |
| Next Action | Awaiting Company Head assignment |

---

## Phase Progress

| Phase | Name | Status |
|-------|------|--------|
| 0 | Foundation | PENDING |
| 1 | Data Layer | PENDING |
| 2 | API Layer | PENDING |
| 3 | UI Layer | PENDING |
| 4 | Integration | PENDING |
| 5 | Testing | PENDING |
| 6 | Deployment | PENDING |

---

## Recent Activity

- ${new Date().toISOString()} - Project created by Intake Agent

---

*Auto-generated by Zeus Orchestrator*
`;

    try {
      await fs.writeFile(statusPath, content);
      return {
        success: true,
        message: `PROJECT_STATUS.md written to ${statusPath}`,
        path: statusPath,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write PROJECT_STATUS.md: ${error}`,
        path: null,
      };
    }
  },
});

/**
 * Tool to save intake conversation history
 */
export const saveIntakeConversationTool = tool({
  name: 'save_intake_conversation',
  description: 'Save the intake conversation history to the project folder',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    conversation: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      timestamp: z.string(),
    })).describe('Conversation history'),
  }),
  async execute({ projectId, conversation }) {
    const intakePath = path.join(ZEUS_ROOT, 'projects', projectId, 'intake', 'INTAKE_CONVERSATION.md');
    
    const lines: string[] = [
      '# Intake Conversation',
      '',
      `> **Project ID:** ${projectId}`,
      `> **Date:** ${new Date().toISOString().split('T')[0]}`,
      '',
      '---',
      '',
    ];

    for (const msg of conversation) {
      const role = msg.role === 'user' ? '**User**' : '**Intake Agent**';
      lines.push(`### ${role} (${msg.timestamp})`);
      lines.push('');
      lines.push(msg.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    lines.push('*End of intake conversation*');

    try {
      await fs.writeFile(intakePath, lines.join('\n'));
      return {
        success: true,
        message: `Conversation saved to ${intakePath}`,
        path: intakePath,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save conversation: ${error}`,
        path: null,
      };
    }
  },
});

/**
 * Tool to read current PRODUCT_SPEC.md (for modifications)
 */
export const readProductSpecTool = tool({
  name: 'read_product_spec',
  description: 'Read the current PRODUCT_SPEC.md to review before modifications',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
  }),
  async execute({ projectId }) {
    const specPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PRODUCT_SPEC.md');
    
    try {
      const content = await fs.readFile(specPath, 'utf-8');
      return {
        success: true,
        content,
        path: specPath,
      };
    } catch (error) {
      return {
        success: false,
        content: null,
        error: `PRODUCT_SPEC.md not found: ${error}`,
        path: null,
      };
    }
  },
});

/**
 * Tool to copy PHASE_PLAN.md template to project
 */
export const copyPhasePlanTemplateTool = tool({
  name: 'copy_phase_plan_template',
  description: 'Copy the PHASE_PLAN.md template from company folder to the project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
  }),
  async execute({ projectId }) {
    const templatePath = path.join(ZEUS_ROOT, 'company', 'PHASE_PLAN.md');
    const destPath = path.join(ZEUS_ROOT, 'projects', projectId, 'PHASE_PLAN.md');
    
    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      await fs.writeFile(destPath, content);
      return {
        success: true,
        message: `PHASE_PLAN.md copied to ${destPath}`,
        path: destPath,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to copy PHASE_PLAN.md: ${error}`,
        path: null,
      };
    }
  },
});

/**
 * Tool to write/update API_REQUIREMENTS.md for a project
 * This tracks all external API keys and configurations needed
 */
export const writeApiRequirementsTool = tool({
  name: 'write_api_requirements',
  description: 'Create or update the API_REQUIREMENTS.md file that lists all external API keys and configurations the user needs to provide for the project to work',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    requirements: z.array(z.object({
      service: z.string().describe('Service name (e.g., "Stripe", "Supabase", "SendGrid")'),
      type: z.enum(['api_key', 'oauth', 'webhook', 'database_url', 'other']).describe('Type of credential'),
      envVariable: z.string().describe('Environment variable name (e.g., "STRIPE_SECRET_KEY")'),
      description: z.string().describe('What this is used for'),
      required: z.boolean().describe('Whether this is required or optional'),
      docsUrl: z.string().optional().describe('URL to documentation for getting this credential'),
      notes: z.string().optional().describe('Additional setup notes'),
    })).describe('List of API/config requirements'),
  }),
  async execute({ projectId, requirements }) {
    const reqPath = path.join(ZEUS_ROOT, 'projects', projectId, 'API_REQUIREMENTS.md');
    
    const lines: string[] = [
      '# API Requirements',
      '',
      `> **Project ID:** ${projectId}`,
      `> **Last Updated:** ${new Date().toISOString()}`,
      '',
      'This file lists all external API keys, credentials, and configurations needed for this project.',
      '',
      '---',
      '',
      '## Required Credentials',
      '',
      '| Service | Type | Env Variable | Required | Status |',
      '|---------|------|--------------|----------|--------|',
    ];

    for (const req of requirements) {
      const status = '⬜ Not configured';
      lines.push(`| ${req.service} | ${req.type} | \`${req.envVariable}\` | ${req.required ? 'Yes' : 'No'} | ${status} |`);
    }

    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Setup Instructions');
    lines.push('');

    for (const req of requirements) {
      lines.push(`### ${req.service}`);
      lines.push('');
      lines.push(`**Environment Variable:** \`${req.envVariable}\``);
      lines.push('');
      lines.push(`**Purpose:** ${req.description}`);
      lines.push('');
      if (req.docsUrl) {
        lines.push(`**Documentation:** [${req.service} Docs](${req.docsUrl})`);
        lines.push('');
      }
      if (req.notes) {
        lines.push(`**Notes:** ${req.notes}`);
        lines.push('');
      }
      lines.push('**Setup Steps:**');
      lines.push('1. [ ] Create account / access dashboard');
      lines.push('2. [ ] Generate API key or credentials');
      lines.push(`3. [ ] Add to \`.env\` file as \`${req.envVariable}=your_value_here\``);
      lines.push('4. [ ] Verify connection works');
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    lines.push('## Environment File Template');
    lines.push('');
    lines.push('Copy this to your `.env` file and fill in the values:');
    lines.push('');
    lines.push('```env');
    for (const req of requirements) {
      lines.push(`# ${req.service} - ${req.description}`);
      lines.push(`${req.envVariable}=`);
      lines.push('');
    }
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('*Generated by Intake Agent*');

    try {
      await fs.writeFile(reqPath, lines.join('\n'));
      return {
        success: true,
        message: `API_REQUIREMENTS.md written to ${reqPath}`,
        path: reqPath,
        requirementCount: requirements.length,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write API_REQUIREMENTS.md: ${error}`,
        path: null,
      };
    }
  },
});

/**
 * Tool to read current API_REQUIREMENTS.md
 */
export const readApiRequirementsTool = tool({
  name: 'read_api_requirements',
  description: 'Read the current API_REQUIREMENTS.md to review before modifications',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
  }),
  async execute({ projectId }) {
    const reqPath = path.join(ZEUS_ROOT, 'projects', projectId, 'API_REQUIREMENTS.md');
    
    try {
      const content = await fs.readFile(reqPath, 'utf-8');
      return {
        success: true,
        content,
        path: reqPath,
      };
    } catch (error) {
      return {
        success: false,
        content: null,
        error: `API_REQUIREMENTS.md not found: ${error}`,
        path: null,
      };
    }
  },
});

// Export all intake tools
export const intakeTools = [
  createProjectFolderTool,
  writeProductSpecTool,
  writeProjectConfigTool,
  writeProjectStatusTool,
  saveIntakeConversationTool,
  readProductSpecTool,
  copyPhasePlanTemplateTool,
  writeApiRequirementsTool,
  readApiRequirementsTool,
];
