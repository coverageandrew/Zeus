import { tool } from '@openai/agents';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

type DirItem = { name: string; type: 'file' | 'directory'; path: string };

/**
 * Helper function for recursive directory listing
 */
async function listDirectoryRecursive(dirPath: string, projectPath: string): Promise<DirItem[]> {
  const fullPath = path.join(projectPath, dirPath);
  const items: DirItem[] = [];
  
  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    for (const entry of entries) {
      const itemPath = path.join(dirPath, entry.name);
      items.push({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        path: itemPath,
      });
      if (entry.isDirectory()) {
        const subItems = await listDirectoryRecursive(itemPath, projectPath);
        items.push(...subItems);
      }
    }
  } catch {
    // Directory not accessible
  }
  
  return items;
}

/**
 * Tool to read a file from the project
 */
export const readFileTool = tool({
  name: 'read_file',
  description: 'Read the contents of a file from the project directory',
  parameters: z.object({
    filePath: z.string().describe('Relative path to the file from project root'),
    projectPath: z.string().describe('Absolute path to the project root'),
  }),
  async execute({ filePath, projectPath }) {
    const fullPath = path.join(projectPath, filePath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        success: true,
        path: filePath,
        content,
      };
    } catch (error) {
      return {
        success: false,
        path: filePath,
        error: `Failed to read file: ${error}`,
      };
    }
  },
});

/**
 * Tool to write/create a file in the project
 */
export const writeFileTool = tool({
  name: 'write_file',
  description: 'Write content to a file in the project directory. Creates parent directories if needed.',
  parameters: z.object({
    filePath: z.string().describe('Relative path to the file from project root'),
    projectPath: z.string().describe('Absolute path to the project root'),
    content: z.string().describe('Content to write to the file'),
  }),
  async execute({ filePath, projectPath, content }) {
    const fullPath = path.join(projectPath, filePath);
    try {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
      return {
        success: true,
        path: filePath,
        message: `File written successfully`,
      };
    } catch (error) {
      return {
        success: false,
        path: filePath,
        error: `Failed to write file: ${error}`,
      };
    }
  },
});

/**
 * Tool to list directory contents
 */
export const listDirectoryTool = tool({
  name: 'list_directory',
  description: 'List files and directories in a given path',
  parameters: z.object({
    dirPath: z.string().describe('Relative path to the directory from project root'),
    projectPath: z.string().describe('Absolute path to the project root'),
    recursive: z.boolean().optional().describe('Whether to list recursively (default: false)'),
  }),
  async execute({ dirPath, projectPath, recursive = false }) {
    const fullPath = path.join(projectPath, dirPath);
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const items: Array<{ name: string; type: 'file' | 'directory'; path: string }> = [];

      for (const entry of entries) {
        const itemPath = path.join(dirPath, entry.name);
        items.push({
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          path: itemPath,
        });

        if (recursive && entry.isDirectory()) {
          const subItems = await listDirectoryRecursive(itemPath, projectPath);
          items.push(...subItems);
        }
      }

      return {
        success: true,
        path: dirPath,
        items,
      };
    } catch (error) {
      return {
        success: false,
        path: dirPath,
        error: `Failed to list directory: ${error}`,
        items: [],
      };
    }
  },
});

/**
 * Tool to check if a file or directory exists
 */
export const existsTool = tool({
  name: 'path_exists',
  description: 'Check if a file or directory exists',
  parameters: z.object({
    targetPath: z.string().describe('Relative path to check from project root'),
    projectPath: z.string().describe('Absolute path to the project root'),
  }),
  async execute({ targetPath, projectPath }) {
    const fullPath = path.join(projectPath, targetPath);
    try {
      const stats = await fs.stat(fullPath);
      return {
        exists: true,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        path: targetPath,
      };
    } catch {
      return {
        exists: false,
        isFile: false,
        isDirectory: false,
        path: targetPath,
      };
    }
  },
});

/**
 * Tool to delete a file
 */
export const deleteFileTool = tool({
  name: 'delete_file',
  description: 'Delete a file from the project directory',
  parameters: z.object({
    filePath: z.string().describe('Relative path to the file from project root'),
    projectPath: z.string().describe('Absolute path to the project root'),
  }),
  async execute({ filePath, projectPath }) {
    const fullPath = path.join(projectPath, filePath);
    try {
      await fs.unlink(fullPath);
      return {
        success: true,
        path: filePath,
        message: 'File deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        path: filePath,
        error: `Failed to delete file: ${error}`,
      };
    }
  },
});
