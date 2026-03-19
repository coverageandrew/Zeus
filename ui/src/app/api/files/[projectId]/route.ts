import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  children?: FileItem[];
}

async function buildFileTree(dirPath: string, basePath: string = ''): Promise<FileItem[]> {
  const items: FileItem[] = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const itemPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const children = await buildFileTree(fullPath, itemPath);
        items.push({
          name: entry.name,
          type: 'folder',
          path: itemPath,
          children,
        });
      } else {
        const stats = await fs.stat(fullPath);
        items.push({
          name: entry.name,
          type: 'file',
          path: itemPath,
          size: stats.size,
        });
      }
    }
  } catch (error) {
    console.error('Error building file tree:', error);
  }
  
  items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  
  return items;
}

// GET /api/files/[projectId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  try {
    const projectDir = path.join(PROJECTS_DIR, projectId);
    
    try {
      await fs.access(projectDir);
    } catch {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const files = await buildFileTree(projectDir);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error getting files:', error);
    return NextResponse.json({ error: 'Failed to get files' }, { status: 500 });
  }
}
