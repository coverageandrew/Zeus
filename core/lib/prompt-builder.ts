/**
 * Prompt Builder - Simplified for Agents SDK
 * 
 * Most prompt building is now handled directly in agent definitions.
 * This module provides utility functions for loading context.
 */

import type { ProjectConfig } from '../types/index.js';
import type { MemoryContext } from '../types/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const ZEUS_ROOT = process.cwd();

/**
 * Load an agent definition from markdown file
 */
export async function loadAgentInstructions(agentPath: string): Promise<string> {
  const fullPath = path.join(ZEUS_ROOT, agentPath);
  try {
    return await fs.readFile(fullPath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Load SSoT document content
 */
export async function loadSSoTDocument(docName: string): Promise<string> {
  const docPath = path.join(ZEUS_ROOT, 'company', docName);
  try {
    return await fs.readFile(docPath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Load multiple SSoT documents and combine them
 */
export async function loadSSoTContext(docNames: string[]): Promise<string> {
  const contents: string[] = [];
  
  for (const docName of docNames) {
    const content = await loadSSoTDocument(docName);
    if (content) {
      contents.push(`## ${docName}\n\n${content}`);
    }
  }
  
  return contents.join('\n\n---\n\n');
}

/**
 * Load skill files for an agent
 */
export async function loadSkillsContext(skillNames: string[]): Promise<string> {
  const skills: string[] = [];
  
  for (const skillName of skillNames) {
    const skillPath = path.join(ZEUS_ROOT, '.windsurf', 'workflows', `${skillName}.md`);
    try {
      const content = await fs.readFile(skillPath, 'utf-8');
      skills.push(`## Skill: ${skillName}\n\n${content}`);
    } catch {
      // Skill file not found, skip
    }
  }
  
  return skills.join('\n\n---\n\n');
}

/**
 * Format project config for injection into prompts
 */
export function formatProjectConfig(config: ProjectConfig): string {
  const lines: string[] = [];

  lines.push(`**Project ID:** ${config.projectId}`);
  lines.push(`**Project Name:** ${config.projectName}`);
  lines.push('');

  lines.push('### Commands');
  for (const [key, value] of Object.entries(config.commands)) {
    lines.push(`- **${key}:** \`${value}\``);
  }
  lines.push('');

  lines.push('### Paths');
  for (const [key, value] of Object.entries(config.paths)) {
    lines.push(`- **${key}:** \`${value}\``);
  }

  if (config.database) {
    lines.push('');
    lines.push('### Database');
    lines.push(`- **Provider:** ${config.database.provider}`);
    if (config.database.projectId) {
      lines.push(`- **Project ID:** ${config.database.projectId}`);
    }
  }

  if (config.deployment) {
    lines.push('');
    lines.push('### Deployment');
    lines.push(`- **Provider:** ${config.deployment.provider}`);
    if (config.deployment.projectId) {
      lines.push(`- **Project ID:** ${config.deployment.projectId}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format memory context for injection into prompts
 */
export function formatMemoryContext(memory: MemoryContext): string {
  if (!memory) return '';

  const parts: string[] = [];

  if (memory.summary) {
    parts.push('### Summary');
    parts.push(memory.summary);
    parts.push('');
  }

  if (memory.decisions && memory.decisions.length > 0) {
    parts.push('### Key Decisions');
    for (const decision of memory.decisions) {
      parts.push(`- ${decision.description} (${decision.rationale})`);
    }
    parts.push('');
  }

  if (memory.openIssues && memory.openIssues.length > 0) {
    parts.push('### Open Issues');
    for (const issue of memory.openIssues) {
      parts.push(`- [${issue.severity}] ${issue.description}`);
    }
    parts.push('');
  }

  if (memory.recentInteractions && memory.recentInteractions.length > 0) {
    parts.push('### Recent Work');
    for (const interaction of memory.recentInteractions.slice(-5)) {
      parts.push(`- [${interaction.outcome}] ${interaction.taskId}: ${interaction.input.substring(0, 100)}...`);
    }
  }

  return parts.join('\n');
}
