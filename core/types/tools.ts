import { z } from 'zod';

/**
 * File operation result
 */
export interface FileOperationResult {
  success: boolean;
  path: string;
  content?: string;
  error?: string;
  message?: string;
}

/**
 * Directory item
 */
export interface DirectoryItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
}

/**
 * Directory listing result
 */
export interface DirectoryListResult {
  success: boolean;
  path: string;
  items: DirectoryItem[];
  error?: string;
}

/**
 * Memory operation result
 */
export interface MemoryOperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Project config result
 */
export interface ProjectConfigResult {
  success: boolean;
  config: Record<string, unknown> | null;
  error?: string;
}

/**
 * Handoff creation result
 */
export interface HandoffCreationResult {
  success: boolean;
  handoff?: {
    handoffId: string;
    agentName: string;
    taskId: string;
    status: 'completed' | 'blocked' | 'failed';
    output: string;
    artifacts: string[];
    timestamp: string;
  };
  filePath?: string;
  error?: string;
}

/**
 * Agent assignment from department head
 */
export const AgentAssignmentSchema = z.object({
  taskId: z.string(),
  assignedTo: z.string(),
  instructions: z.string(),
  successCriteria: z.array(z.string()),
  skillsRequired: z.array(z.string()),
});

export type AgentAssignment = z.infer<typeof AgentAssignmentSchema>;

/**
 * Department head response
 */
export const DeptHeadResponseSchema = z.object({
  assignments: z.array(AgentAssignmentSchema),
});

export type DeptHeadResponse = z.infer<typeof DeptHeadResponseSchema>;

/**
 * Tool execution context
 */
export interface ToolContext {
  projectId: string;
  projectPath: string;
  agentName: string;
}
