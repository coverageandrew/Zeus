import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

// POST /api/projects/[id]/start - Start development for a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    const projectDir = path.join(PROJECTS_DIR, projectId);
    
    // Check project exists
    try {
      await fs.access(projectDir);
    } catch {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Update PROJECT_CONFIG.json status
    const configPath = path.join(projectDir, 'PROJECT_CONFIG.json');
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      config.status = 'in_progress';
      config.currentPhase = 0;
      config.updatedAt = new Date().toISOString();
      config.startedAt = new Date().toISOString();
      
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Failed to update project config:', error);
    }
    
    // Update PROJECT_STATUS.md
    const statusPath = path.join(projectDir, 'PROJECT_STATUS.md');
    try {
      const statusContent = `# Project Status: ${projectId}

**Current Phase:** 0 - Foundation
**Status:** In Progress
**Started:** ${new Date().toISOString()}
**Last Updated:** ${new Date().toISOString()}

## Progress

- [x] Intake conversation completed
- [x] Requirements finalized
- [ ] Phase 0: Foundation
- [ ] Phase 1: Schema & Data
- [ ] Phase 2: API Layer
- [ ] Phase 3: UI Layer
- [ ] Phase 4: Integration
- [ ] Phase 5: QA & Hardening
- [ ] Phase 6: Deployment

## Recent Activity

| Timestamp | Agent | Action | Status |
|-----------|-------|--------|--------|
| ${new Date().toISOString()} | System | Development started | ✓ |
`;
      await fs.writeFile(statusPath, statusContent);
    } catch (error) {
      console.error('Failed to update project status:', error);
    }
    
    // Log the start event
    const logsDir = path.join(projectDir, 'logs');
    try {
      await fs.mkdir(logsDir, { recursive: true });
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        event: 'development_started',
        agent: 'system',
        phase: 0,
        message: 'Development started by user',
      };
      
      const logFile = path.join(logsDir, 'activity.json');
      let logs: unknown[] = [];
      try {
        const existing = await fs.readFile(logFile, 'utf-8');
        logs = JSON.parse(existing);
      } catch {
        // No existing logs
      }
      logs.push(logEntry);
      await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Failed to write log:', error);
    }
    
    // Note: In a full implementation, this would trigger the orchestrator
    // For now, we just update the status and return success
    // The orchestrator can be run separately via CLI: npx tsx core/index.ts run <projectId>
    
    return NextResponse.json({
      success: true,
      message: 'Development started',
      projectId,
      status: 'in_progress',
      currentPhase: 0,
      nextStep: 'Run orchestrator: npx tsx core/index.ts run ' + projectId,
    });
  } catch (error) {
    console.error('Error starting project:', error);
    return NextResponse.json({ error: 'Failed to start project' }, { status: 500 });
  }
}
