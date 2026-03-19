import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  agent: string;
  message: string;
}

async function parseMarkdownLogFile(filePath: string, dateStr: string): Promise<LogEntry[]> {
  const entries: LogEntry[] = [];
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const sections = content.split(/(?=## \[)/);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section.startsWith('## [')) continue;
      
      const headerMatch = section.match(/^## \[(\d{2}:\d{2})\] - (\w+)/);
      if (!headerMatch) continue;
      
      const [, time, action] = headerMatch;
      const agentMatch = section.match(/\*\*Agent:\*\*\s*(.+)/);
      const agent = agentMatch ? agentMatch[1].trim() : 'System';
      const detailsMatch = section.match(/\*\*Details:\*\*\s*([\s\S]*?)(?=\*\*Result:|---|\*\*|$)/);
      const details = detailsMatch ? detailsMatch[1].trim() : '';
      const resultMatch = section.match(/\*\*Result:\*\*\s*(.+)/);
      const result = resultMatch ? resultMatch[1].trim() : '';
      
      let level: LogEntry['level'] = 'info';
      if (result.toLowerCase().includes('error') || result.toLowerCase().includes('fail')) {
        level = 'error';
      } else if (result.toLowerCase().includes('warn')) {
        level = 'warn';
      }
      
      const timestamp = new Date(`${dateStr}T${time}:00`).toISOString();
      const message = details || action;
      
      entries.push({
        id: `${dateStr}-${i}`,
        timestamp,
        level,
        agent: agent.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        message: `[${action}] ${message}${result ? ` → ${result}` : ''}`,
      });
    }
  } catch {
    // File doesn't exist
  }
  
  return entries;
}

// GET /api/logs/[projectId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const level = request.nextUrl.searchParams.get('level');
  
  try {
    const projectDir = path.join(PROJECTS_DIR, projectId);
    const logsDir = path.join(projectDir, 'logs');
    
    try {
      await fs.access(projectDir);
    } catch {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const allLogs: LogEntry[] = [];
    
    try {
      await fs.access(logsDir);
      const logFiles = await fs.readdir(logsDir);
      
      // First try to read structured JSON logs (created by start endpoint)
      for (const file of logFiles) {
        if (file === 'activity.json') {
          try {
            const content = await fs.readFile(path.join(logsDir, file), 'utf-8');
            const jsonLogs = JSON.parse(content) as Array<{
              timestamp: string;
              event: string;
              agent: string;
              phase?: number;
              message: string;
            }>;
            for (let i = 0; i < jsonLogs.length; i++) {
              const log = jsonLogs[i];
              allLogs.push({
                id: `json-${i}`,
                timestamp: log.timestamp,
                level: log.event.includes('error') ? 'error' : 'info',
                agent: log.agent.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                message: `[${log.event}] ${log.message}${log.phase !== undefined ? ` (Phase ${log.phase})` : ''}`,
              });
            }
          } catch {
            // JSON parse error, skip
          }
        }
      }
      
      // Also read markdown logs for backward compatibility
      for (const file of logFiles) {
        if (file.endsWith('.md')) {
          const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})\.md$/);
          if (dateMatch) {
            const logs = await parseMarkdownLogFile(path.join(logsDir, file), dateMatch[1]);
            allLogs.push(...logs);
          }
        }
      }
    } catch {
      // Logs directory doesn't exist
    }
    
    // Sort by timestamp descending
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Filter by level if specified
    const filteredLogs = level && level !== 'all'
      ? allLogs.filter(log => log.level === level)
      : allLogs;
    
    return NextResponse.json({ logs: filteredLogs });
  } catch (error) {
    console.error('Error getting logs:', error);
    return NextResponse.json({ error: 'Failed to get logs' }, { status: 500 });
  }
}

// POST /api/logs/[projectId]
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  try {
    const { agent, message, level = 'info' } = await request.json();
    
    if (!agent || !message) {
      return NextResponse.json({ error: 'agent and message are required' }, { status: 400 });
    }
    
    const projectDir = path.join(PROJECTS_DIR, projectId);
    const logsDir = path.join(projectDir, 'logs');
    
    await fs.mkdir(logsDir, { recursive: true });
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    const logFile = path.join(logsDir, `${dateStr}.md`);
    
    const entry = `\n## [${timeStr}] - LOG_ENTRY\n\n**Agent:** ${agent}\n**Action:** LOG_ENTRY\n**Details:**\n${message}\n**Result:** ${level.toUpperCase()}\n\n---\n`;
    
    try {
      await fs.appendFile(logFile, entry);
    } catch {
      await fs.writeFile(logFile, `# Logs for ${dateStr}\n\n---\n${entry}`);
    }
    
    const logEntry: LogEntry = {
      id: `${dateStr}-${Date.now()}`,
      timestamp: now.toISOString(),
      level: level as LogEntry['level'],
      agent,
      message,
    };
    
    return NextResponse.json({ success: true, entry: logEntry });
  } catch (error) {
    console.error('Error adding log:', error);
    return NextResponse.json({ error: 'Failed to add log' }, { status: 500 });
  }
}
