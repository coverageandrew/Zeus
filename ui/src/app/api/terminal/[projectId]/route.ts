import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import { createServer } from 'net';
import path from 'path';
import fs from 'fs/promises';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

// Store active processes per project
const activeProcesses: Map<string, ReturnType<typeof spawn>> = new Map();

// Find an available port starting from the given port
async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(startPort, () => {
      const port = (server.address() as { port: number }).port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

// POST /api/terminal/[projectId] - Run a command and stream output via SSE
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { command } = await request.json();
  
  if (!command) {
    return new Response(JSON.stringify({ error: 'Command is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const projectDir = path.join(PROJECTS_DIR, projectId);
  
  try {
    await fs.access(projectDir);
  } catch {
    return new Response(JSON.stringify({ error: `Project not found at ${projectDir}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Read PROJECT_CONFIG.json to get codebasePath
  let codebaseDir = projectDir;
  try {
    const configPath = path.join(projectDir, 'PROJECT_CONFIG.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    if (config.codebasePath) {
      codebaseDir = path.join(projectDir, config.codebasePath);
      console.log('[Terminal API] Using codebasePath:', codebaseDir);
    }
  } catch {
    // No config or no codebasePath, use project root
  }
  
  // Check if codebase directory exists
  try {
    await fs.access(codebaseDir);
  } catch {
    return new Response(JSON.stringify({ 
      error: `Codebase directory not found at ${codebaseDir}. Check codebasePath in PROJECT_CONFIG.json.` 
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Check if codebase has package.json
  const hasPackageJson = await fs.access(path.join(codebaseDir, 'package.json')).then(() => true).catch(() => false);
  
  // If running npm commands but no package.json, return helpful error
  if (command.startsWith('npm ') && !hasPackageJson) {
    return new Response(JSON.stringify({ 
      error: `No package.json found in codebase. The project needs to be scaffolded first.\n\nRun the orchestrator to generate code:\n  npx tsx core/index.ts run ${projectId}` 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // For dev commands, find an available port starting from 3001 (Zeus UI uses 3000)
  let finalCommand = command;
  let assignedPort: number | null = null;
  
  if (command.includes('npm run dev') && !command.includes('--port')) {
    // Clean up any stale lock files before starting
    const lockPath = path.join(codebaseDir, '.next', 'dev', 'lock');
    try {
      await fs.unlink(lockPath);
    } catch {
      // Lock file doesn't exist, that's fine
    }
    
    assignedPort = await findAvailablePort(3001);
    finalCommand = `${command} -- --port ${assignedPort}`;
  }
  
  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (type: string, data: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
      };
      
      sendEvent('info', `[Running in: ${codebaseDir}]`);
      if (assignedPort) {
        sendEvent('info', `[Using port: ${assignedPort}]`);
      }
      sendEvent('info', `$ ${finalCommand}`);
      
      // Parse command - handle shell commands
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'cmd.exe' : '/bin/sh';
      const shellArgs = isWindows ? ['/c', finalCommand] : ['-c', finalCommand];
      
      const proc = spawn(shell, shellArgs, {
        cwd: codebaseDir,
        env: { ...process.env, FORCE_COLOR: '1', PORT: assignedPort?.toString() || '' },
      });
      
      // Store process reference for potential kill
      activeProcesses.set(projectId, proc);
      
      proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            sendEvent('stdout', line);
          }
        }
      });
      
      proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            sendEvent('stderr', line);
          }
        }
      });
      
      proc.on('close', (code) => {
        activeProcesses.delete(projectId);
        sendEvent('exit', `Process exited with code ${code}`);
        controller.close();
      });
      
      proc.on('error', (err) => {
        activeProcesses.delete(projectId);
        sendEvent('error', err.message);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// DELETE /api/terminal/[projectId] - Kill running process
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  const proc = activeProcesses.get(projectId);
  if (proc) {
    proc.kill('SIGTERM');
    activeProcesses.delete(projectId);
    return new Response(JSON.stringify({ success: true, message: 'Process killed' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ success: true, message: 'No process running' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET /api/terminal/[projectId] - Check if process is running
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  const isRunning = activeProcesses.has(projectId);
  return new Response(JSON.stringify({ running: isRunning }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
