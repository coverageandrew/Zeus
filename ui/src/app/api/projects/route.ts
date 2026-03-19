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

// GET /api/projects - List all projects
export async function GET() {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects: Project[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const config = await readProjectConfig(entry.name);
        if (config) {
          projects.push(config);
        }
      }
    }

    projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error listing projects:', error);
    return NextResponse.json({ error: 'Failed to list projects' }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    const projectId = `proj_${timestamp}_${randomPart}`;

    const projectDir = path.join(PROJECTS_DIR, projectId);
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(path.join(projectDir, 'logs'), { recursive: true });
    await fs.mkdir(path.join(projectDir, 'artifacts'), { recursive: true });

    const config: Project = {
      id: projectId,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'intake',
      currentPhase: 0,
    };

    await writeProjectConfig(projectId, config);

    await fs.writeFile(
      path.join(projectDir, 'PRODUCT_SPEC.md'),
      `# Product Specification: ${name}\n\n> Status: Draft\n> Created: ${new Date().toISOString()}\n\n## Overview\n\n${description || 'To be defined during intake.'}\n\n## Requirements\n\n*Requirements will be gathered during the intake conversation.*\n`
    );

    await fs.writeFile(
      path.join(projectDir, 'PROJECT_STATUS.md'),
      `# Project Status: ${name}\n\n**Current Phase:** 0 - Intake\n**Status:** In Progress\n**Last Updated:** ${new Date().toISOString()}\n\n## Progress\n\n- [ ] Intake conversation\n- [ ] Requirements finalized\n- [ ] Development started\n`
    );

    await fs.writeFile(
      path.join(projectDir, 'INTAKE_CONVERSATION.md'),
      `# Intake Conversation Log\n\n**Project:** ${name}\n**Started:** ${new Date().toISOString()}\n\n---\n\n`
    );

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
