import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

// GET /api/files/[projectId]/content?path=...
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const filePath = request.nextUrl.searchParams.get('path');
  
  if (!filePath) {
    return NextResponse.json({ error: 'File path is required' }, { status: 400 });
  }
  
  try {
    const fullPath = path.join(PROJECTS_DIR, projectId, filePath);
    const projectDir = path.join(PROJECTS_DIR, projectId);
    
    // Security: ensure path is within project directory
    if (!fullPath.startsWith(projectDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);
      
      return NextResponse.json({
        path: filePath,
        content,
        size: stats.size,
        modified: stats.mtime.toISOString(),
      });
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error getting file content:', error);
    return NextResponse.json({ error: 'Failed to get file content' }, { status: 500 });
  }
}
