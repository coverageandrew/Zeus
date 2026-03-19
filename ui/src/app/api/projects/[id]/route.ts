import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: 'intake' | 'in_progress' | 'completed' | 'error';
  currentPhase: number;
}

async function readProjectConfig(projectId: string): Promise<Project | null> {
  try {
    const configPath = path.join(PROJECTS_DIR, projectId, 'PROJECT_CONFIG.json');
    const content = await fs.readFile(configPath, 'utf-8');
    const raw = JSON.parse(content);
    
    return {
      id: raw.id || raw.projectId || projectId,
      name: raw.name || raw.projectName || projectId,
      description: raw.description || '',
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
      status: raw.status || 'intake',
      currentPhase: raw.currentPhase ?? raw.phases?.current ?? 0,
    };
  } catch {
    return null;
  }
}

async function writeProjectConfig(projectId: string, config: Project): Promise<void> {
  const configPath = path.join(PROJECTS_DIR, projectId, 'PROJECT_CONFIG.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

// GET /api/projects/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const config = await readProjectConfig(id);
    if (!config) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting project:', error);
    return NextResponse.json({ error: 'Failed to get project' }, { status: 500 });
  }
}

// PATCH /api/projects/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const config = await readProjectConfig(id);
    if (!config) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updates = await request.json();
    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await writeProjectConfig(id, updatedConfig);
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const projectDir = path.join(PROJECTS_DIR, id);
    await fs.rm(projectDir, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
