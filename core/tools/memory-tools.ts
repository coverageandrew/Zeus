import { tool } from '@openai/agents';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const ZEUS_ROOT = process.cwd();

/**
 * Memory structure schema
 */
const MemorySchema = z.object({
  agentName: z.string(),
  projectId: z.string(),
  lastUpdated: z.string(),
  summary: z.string(),
  decisions: z.array(z.object({
    timestamp: z.string(),
    description: z.string(),
    rationale: z.string(),
  })),
  artifacts: z.array(z.object({
    path: z.string(),
    type: z.string(),
    createdAt: z.string(),
    description: z.string(),
  })),
  openIssues: z.array(z.object({
    id: z.string(),
    description: z.string(),
    severity: z.string(),
    blockedBy: z.string().optional(),
  })),
  recentInteractions: z.array(z.object({
    timestamp: z.string(),
    taskId: z.string(),
    input: z.string(),
    output: z.string(),
    outcome: z.enum(['success', 'failure', 'partial']),
  })),
});

type Memory = z.infer<typeof MemorySchema>;

/**
 * Get memory file path for an agent
 */
function getMemoryPath(projectId: string, agentName: string): string {
  const normalizedName = agentName.toLowerCase().replace(/\s+/g, '_');
  return path.join(ZEUS_ROOT, 'projects', projectId, 'memory', `${normalizedName}.json`);
}

/**
 * Tool to load agent memory
 */
export const loadMemoryTool = tool({
  name: 'load_memory',
  description: 'Load the memory/context for an agent from a project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    agentName: z.string().describe('Name of the agent'),
  }),
  async execute({ projectId, agentName }) {
    const memoryPath = getMemoryPath(projectId, agentName);
    try {
      const content = await fs.readFile(memoryPath, 'utf-8');
      const memory = JSON.parse(content) as Memory;
      return {
        success: true,
        memory,
      };
    } catch {
      return {
        success: false,
        memory: null,
        message: 'No existing memory found for this agent',
      };
    }
  },
});

/**
 * Tool to save agent memory
 */
export const saveMemoryTool = tool({
  name: 'save_memory',
  description: 'Save the memory/context for an agent to a project',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    agentName: z.string().describe('Name of the agent'),
    summary: z.string().describe('Summary of work done'),
    decisions: z.array(z.object({
      timestamp: z.string(),
      description: z.string(),
      rationale: z.string(),
    })).optional().describe('Key decisions made'),
    artifacts: z.array(z.object({
      path: z.string(),
      type: z.string(),
      createdAt: z.string(),
      description: z.string(),
    })).optional().describe('Artifacts created'),
    openIssues: z.array(z.object({
      id: z.string(),
      description: z.string(),
      severity: z.string(),
      blockedBy: z.string().optional(),
    })).optional().describe('Open issues'),
  }),
  async execute({ projectId, agentName, summary, decisions = [], artifacts = [], openIssues = [] }) {
    const memoryPath = getMemoryPath(projectId, agentName);
    
    // Load existing memory or create new
    let memory: Memory;
    try {
      const content = await fs.readFile(memoryPath, 'utf-8');
      memory = JSON.parse(content) as Memory;
    } catch {
      memory = {
        agentName,
        projectId,
        lastUpdated: new Date().toISOString(),
        summary: '',
        decisions: [],
        artifacts: [],
        openIssues: [],
        recentInteractions: [],
      };
    }

    // Update memory
    memory.summary = summary;
    memory.lastUpdated = new Date().toISOString();
    memory.decisions = [...memory.decisions, ...decisions];
    memory.artifacts = [...memory.artifacts, ...artifacts];
    memory.openIssues = openIssues;

    // Save
    try {
      await fs.mkdir(path.dirname(memoryPath), { recursive: true });
      await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2));
      return {
        success: true,
        message: 'Memory saved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save memory: ${error}`,
      };
    }
  },
});

/**
 * Tool to add an interaction to memory
 */
export const addInteractionTool = tool({
  name: 'add_interaction',
  description: 'Add a new interaction record to agent memory',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    agentName: z.string().describe('Name of the agent'),
    taskId: z.string().describe('Task identifier'),
    input: z.string().describe('Task input/description'),
    output: z.string().describe('Task output/result'),
    outcome: z.enum(['success', 'failure', 'partial']).describe('Outcome of the task'),
  }),
  async execute({ projectId, agentName, taskId, input, output, outcome }) {
    const memoryPath = getMemoryPath(projectId, agentName);
    
    // Load existing memory
    let memory: Memory;
    try {
      const content = await fs.readFile(memoryPath, 'utf-8');
      memory = JSON.parse(content) as Memory;
    } catch {
      memory = {
        agentName,
        projectId,
        lastUpdated: new Date().toISOString(),
        summary: '',
        decisions: [],
        artifacts: [],
        openIssues: [],
        recentInteractions: [],
      };
    }

    // Add interaction
    memory.recentInteractions.push({
      timestamp: new Date().toISOString(),
      taskId,
      input: input.substring(0, 500),
      output: output.substring(0, 1000),
      outcome,
    });

    // Keep only last 10 interactions
    if (memory.recentInteractions.length > 10) {
      memory.recentInteractions = memory.recentInteractions.slice(-10);
    }

    memory.lastUpdated = new Date().toISOString();

    // Save
    try {
      await fs.mkdir(path.dirname(memoryPath), { recursive: true });
      await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2));
      return {
        success: true,
        message: 'Interaction added to memory',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add interaction: ${error}`,
      };
    }
  },
});

/**
 * Tool to get memory context as a string for injection into prompts
 */
export const getMemoryContextTool = tool({
  name: 'get_memory_context',
  description: 'Get formatted memory context for an agent to use in prompts',
  parameters: z.object({
    projectId: z.string().describe('Project identifier'),
    agentName: z.string().describe('Name of the agent'),
  }),
  async execute({ projectId, agentName }) {
    const memoryPath = getMemoryPath(projectId, agentName);
    
    try {
      const content = await fs.readFile(memoryPath, 'utf-8');
      const memory = JSON.parse(content) as Memory;

      const context = `
## Memory Context for ${agentName}

### Summary
${memory.summary || 'No previous work recorded.'}

### Key Decisions
${memory.decisions.length > 0 
  ? memory.decisions.map(d => `- ${d.description} (${d.rationale})`).join('\n')
  : 'No decisions recorded.'}

### Open Issues
${memory.openIssues.length > 0
  ? memory.openIssues.map(i => `- [${i.severity}] ${i.description}`).join('\n')
  : 'No open issues.'}

### Recent Interactions
${memory.recentInteractions.slice(-5).map(i => 
  `- [${i.outcome}] ${i.taskId}: ${i.input.substring(0, 100)}...`
).join('\n') || 'No recent interactions.'}
`;

      return {
        success: true,
        context,
      };
    } catch {
      return {
        success: true,
        context: 'No previous memory found for this agent.',
      };
    }
  },
});
