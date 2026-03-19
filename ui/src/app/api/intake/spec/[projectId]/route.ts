import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

// GET /api/intake/spec/[projectId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  try {
    const specPath = path.join(PROJECTS_DIR, projectId, 'PRODUCT_SPEC.md');
    const content = await fs.readFile(specPath, 'utf-8');
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: 'Spec not found' }, { status: 404 });
  }
}
