import * as fs from 'fs/promises';
import * as path from 'path';
import type { AgentMemory, MemoryContext, Interaction, Decision, Artifact, Issue } from '../types/index.js';
import { createChatCompletion, getSummarizerModel } from './openai-client.js';
import { getDepartmentForAgent, normalizeAgentName } from './registry.js';

const ZEUS_ROOT = process.cwd();
const MAX_RECENT_INTERACTIONS = 10;
const SUMMARIZE_THRESHOLD = 10;

export function getMemoryPath(projectId: string, rawAgentName: string): string {
  const agentName = normalizeAgentName(rawAgentName);
  const dept = getDepartmentForAgent(agentName);
  
  if (agentName === 'company_head') {
    return path.join(ZEUS_ROOT, 'projects', projectId, 'memory', 'company_head.json');
  }
  
  if (agentName.includes('department_head')) {
    const deptName = agentName.replace('_department_head', '');
    return path.join(ZEUS_ROOT, 'projects', projectId, 'memory', deptName, 'department_head.json');
  }
  
  if (dept) {
    return path.join(ZEUS_ROOT, 'projects', projectId, 'memory', dept, `${agentName}.json`);
  }
  
  return path.join(ZEUS_ROOT, 'projects', projectId, 'memory', `${agentName}.json`);
}

export async function loadMemory(projectId: string, agentName: string): Promise<AgentMemory | null> {
  const memoryPath = getMemoryPath(projectId, agentName);
  
  try {
    const content = await fs.readFile(memoryPath, 'utf-8');
    return JSON.parse(content) as AgentMemory;
  } catch {
    return null;
  }
}

export async function saveMemory(memory: AgentMemory): Promise<void> {
  const memoryPath = getMemoryPath(memory.projectId, memory.agentName);
  
  await fs.mkdir(path.dirname(memoryPath), { recursive: true });
  await fs.writeFile(memoryPath, JSON.stringify(memory, null, 2));
}

export function createEmptyMemory(projectId: string, rawAgentName: string): AgentMemory {
  const agentName = normalizeAgentName(rawAgentName);
  return {
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

export async function addInteraction(
  memory: AgentMemory,
  interaction: Omit<Interaction, 'timestamp'>
): Promise<AgentMemory> {
  const newInteraction: Interaction = {
    ...interaction,
    timestamp: new Date().toISOString(),
  };

  const updatedMemory: AgentMemory = {
    ...memory,
    lastUpdated: new Date().toISOString(),
    recentInteractions: [...memory.recentInteractions, newInteraction],
  };

  if (updatedMemory.recentInteractions.length > SUMMARIZE_THRESHOLD) {
    return summarizeMemory(updatedMemory);
  }

  return updatedMemory;
}

export function addDecision(memory: AgentMemory, description: string, rationale: string): AgentMemory {
  const decision: Decision = {
    timestamp: new Date().toISOString(),
    description,
    rationale,
  };

  return {
    ...memory,
    lastUpdated: new Date().toISOString(),
    decisions: [...memory.decisions, decision],
  };
}

export function addArtifact(
  memory: AgentMemory,
  artifactPath: string,
  type: string,
  description: string
): AgentMemory {
  const artifact: Artifact = {
    path: artifactPath,
    type,
    createdAt: new Date().toISOString(),
    description,
  };

  return {
    ...memory,
    lastUpdated: new Date().toISOString(),
    artifacts: [...memory.artifacts, artifact],
  };
}

export function addIssue(
  memory: AgentMemory,
  description: string,
  severity: Issue['severity'],
  blockedBy?: string
): AgentMemory {
  const issue: Issue = {
    id: `issue-${Date.now()}`,
    description,
    severity,
    blockedBy,
  };

  return {
    ...memory,
    lastUpdated: new Date().toISOString(),
    openIssues: [...memory.openIssues, issue],
  };
}

export function resolveIssue(memory: AgentMemory, issueId: string): AgentMemory {
  return {
    ...memory,
    lastUpdated: new Date().toISOString(),
    openIssues: memory.openIssues.filter(i => i.id !== issueId),
  };
}

export function getMemoryContext(memory: AgentMemory | null): MemoryContext {
  if (!memory) {
    return {
      summary: '',
      decisions: [],
      openIssues: [],
      recentInteractions: [],
    };
  }

  return {
    summary: memory.summary,
    decisions: memory.decisions.slice(-5),
    openIssues: memory.openIssues,
    recentInteractions: memory.recentInteractions.slice(-5),
  };
}

export function formatMemoryForPrompt(context: MemoryContext): string {
  const parts: string[] = [];

  if (context.summary) {
    parts.push(`### Summary of Previous Work\n${context.summary}`);
  }

  if (context.decisions.length > 0) {
    parts.push('### Key Decisions Made');
    for (const decision of context.decisions) {
      parts.push(`- **${decision.description}**: ${decision.rationale}`);
    }
  }

  if (context.openIssues.length > 0) {
    parts.push('### Open Issues');
    for (const issue of context.openIssues) {
      parts.push(`- [${issue.severity.toUpperCase()}] ${issue.description}${issue.blockedBy ? ` (Blocked by: ${issue.blockedBy})` : ''}`);
    }
  }

  if (context.recentInteractions.length > 0) {
    parts.push('### Recent Interactions');
    for (const interaction of context.recentInteractions) {
      parts.push(`#### Task: ${interaction.taskId} (${interaction.outcome})`);
      parts.push(`- Input: ${interaction.input}`);
      parts.push(`- Output: ${interaction.output}`);
    }
  }

  return parts.join('\n\n');
}

async function summarizeMemory(memory: AgentMemory, projectModels?: Record<string, string>): Promise<AgentMemory> {
  const model = getSummarizerModel(projectModels);

  const interactionsText = memory.recentInteractions
    .map(i => `Task ${i.taskId}: ${i.input} -> ${i.output} (${i.outcome})`)
    .join('\n');

  const previousSummary = memory.summary ? `Previous summary: ${memory.summary}\n\n` : '';

  const prompt = `${previousSummary}Summarize the following agent interactions into a concise paragraph (max 200 words) that captures the key work done, decisions made, and current state:

${interactionsText}

Focus on:
1. What was accomplished
2. Key technical decisions
3. Current state of the work
4. Any blockers or issues`;

  try {
    const summary = await createChatCompletion({
      model,
      messages: [
        { role: 'system', content: 'You are a technical summarizer. Create concise, factual summaries.' },
        { role: 'user', content: prompt },
      ],
      maxTokens: 500,
    });

    return {
      ...memory,
      summary,
      recentInteractions: memory.recentInteractions.slice(-5),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to summarize memory:', error);
    return {
      ...memory,
      recentInteractions: memory.recentInteractions.slice(-MAX_RECENT_INTERACTIONS),
      lastUpdated: new Date().toISOString(),
    };
  }
}
