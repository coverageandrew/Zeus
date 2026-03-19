import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

interface MemoryEntry {
  id: string;
  agent: string;
  key: string;
  value: string;
  timestamp: string;
}

// GET /api/memory/[projectId] - Get all memory entries for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  try {
    const projectDir = path.join(PROJECTS_DIR, projectId);
    const memoryDir = path.join(projectDir, 'memory');
    
    try {
      await fs.access(projectDir);
    } catch {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const memories: MemoryEntry[] = [];
    
    try {
      await fs.access(memoryDir);
      const files = await fs.readdir(memoryDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(path.join(memoryDir, file), 'utf-8');
            const data = JSON.parse(content);
            const agentName = file.replace('.json', '').replace(/_/g, ' ');
            
            // Handle both object and array formats
            if (Array.isArray(data)) {
              for (const entry of data) {
                memories.push({
                  id: `${file}-${memories.length}`,
                  agent: agentName,
                  key: entry.key || 'memory',
                  value: typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value),
                  timestamp: entry.timestamp || new Date().toISOString(),
                });
              }
            } else if (typeof data === 'object') {
              for (const [key, value] of Object.entries(data)) {
                memories.push({
                  id: `${file}-${key}`,
                  agent: agentName,
                  key,
                  value: typeof value === 'string' ? value : JSON.stringify(value),
                  timestamp: new Date().toISOString(),
                });
              }
            }
          } catch {
            // Skip invalid JSON files
          }
        }
      }
    } catch {
      // Memory directory doesn't exist yet
    }
    
    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Error getting memory:', error);
    return NextResponse.json({ error: 'Failed to get memory' }, { status: 500 });
  }
}

// DELETE /api/memory/[projectId] - Clear all memory for a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  try {
    const projectDir = path.join(PROJECTS_DIR, projectId);
    const memoryDir = path.join(projectDir, 'memory');
    
    try {
      await fs.access(memoryDir);
      const files = await fs.readdir(memoryDir);
      
      for (const file of files) {
        await fs.unlink(path.join(memoryDir, file));
      }
      
      return NextResponse.json({ success: true, message: 'Memory cleared' });
    } catch {
      return NextResponse.json({ success: true, message: 'No memory to clear' });
    }
  } catch (error) {
    console.error('Error clearing memory:', error);
    return NextResponse.json({ error: 'Failed to clear memory' }, { status: 500 });
  }
}
