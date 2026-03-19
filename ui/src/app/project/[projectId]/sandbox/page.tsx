'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Code2, 
  Eye, 
  Play, 
  Hammer, 
  Terminal,
  Loader2,
  XCircle,
  Send,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalLine {
  id: string;
  type: 'info' | 'success' | 'error' | 'command' | 'stdout' | 'stderr';
  text: string;
  timestamp: Date;
}

export default function ProjectSandboxPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [activeTab, setActiveTab] = useState<'terminal' | 'preview'>('terminal');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [devServerPort, setDevServerPort] = useState<number | null>(null);
  const [customCommand, setCustomCommand] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: '1', type: 'info', text: 'Sandbox ready. Use Build, Run, or enter a custom command.', timestamp: new Date() }
  ]);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);

  const addTerminalLine = (type: TerminalLine['type'], text: string) => {
    setTerminalLines(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type,
      text,
      timestamp: new Date()
    }]);
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const runCommand = async (command: string, onComplete?: () => void) => {
    try {
      const response = await fetch(`/api/terminal/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        const error = await response.json();
        addTerminalLine('error', error.error || 'Failed to run command');
        onComplete?.();
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        addTerminalLine('error', 'No response stream');
        onComplete?.();
        return;
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'stdout') {
                addTerminalLine('info', data.data);
                // Check for dev server ready message
                const portMatch = data.data.match(/localhost:(\d+)/);
                if (portMatch) {
                  setDevServerPort(parseInt(portMatch[1]));
                }
              } else if (data.type === 'stderr') {
                addTerminalLine('error', data.data);
              } else if (data.type === 'info') {
                addTerminalLine('command', data.data);
              } else if (data.type === 'exit') {
                addTerminalLine('info', data.data);
                onComplete?.();
              } else if (data.type === 'error') {
                addTerminalLine('error', data.data);
                onComplete?.();
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      addTerminalLine('error', `Error: ${err}`);
      onComplete?.();
    }
  };

  const handleBuild = async () => {
    setIsBuilding(true);
    await runCommand('npm run build', () => setIsBuilding(false));
  };

  const handleRun = async () => {
    if (isRunning) {
      // Stop the server
      addTerminalLine('command', '$ Stopping server...');
      await fetch(`/api/terminal/${projectId}`, { method: 'DELETE' });
      addTerminalLine('info', 'Server stopped.');
      setIsRunning(false);
      setDevServerPort(null);
      setActiveTab('terminal');
      return;
    }

    // Kill any existing process first
    addTerminalLine('info', 'Preparing dev server...');
    await fetch(`/api/terminal/${projectId}`, { method: 'DELETE' });
    
    setIsRunning(true);
    setDevServerPort(null);
    // API handles lock cleanup and port assignment
    runCommand('npm run dev');
    
    // Switch to preview after a delay to let server start
    setTimeout(() => {
      setActiveTab('preview');
    }, 3000);
  };

  const handleCustomCommand = async () => {
    if (!customCommand.trim()) return;
    const cmd = customCommand;
    setCustomCommand('');
    await runCommand(cmd);
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-amber-400';
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col gap-4">
      {/* Header with buttons */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Code2 size={18} className="text-amber-500" />
          <h3 className="font-medium text-white">Sandbox</h3>
          {isRunning && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Running
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBuild}
            disabled={isBuilding || isRunning}
            className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white"
          >
            {isBuilding ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <Hammer size={14} className="mr-1.5" />
            )}
            Build
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isBuilding}
            className={cn(
              isRunning 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-amber-500 hover:bg-amber-600 text-stone-950'
            )}
          >
            {isRunning ? (
              <>
                <XCircle size={14} className="mr-1.5" />
                Stop
              </>
            ) : (
              <>
                <Play size={14} className="mr-1.5" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Terminal Output - Collapsible */}
      <div className={cn(
        "bg-stone-900 border border-stone-800 rounded-xl shrink-0 transition-all duration-200",
        terminalCollapsed ? "p-3" : "p-4"
      )}>
        <div 
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            !terminalCollapsed && "mb-3 pb-2 border-b border-stone-800"
          )}
          onClick={() => setTerminalCollapsed(!terminalCollapsed)}
        >
          {terminalCollapsed ? (
            <ChevronRight size={14} className="text-amber-500" />
          ) : (
            <ChevronDown size={14} className="text-amber-500" />
          )}
          <Terminal size={14} className="text-amber-500" />
          <span className="text-xs font-medium text-white">Terminal Output</span>
          {terminalCollapsed && terminalLines.length > 0 && (
            <span className="text-[10px] text-white/40">
              ({terminalLines.length} lines)
            </span>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setTerminalLines([{ id: '1', type: 'info', text: 'Terminal cleared.', timestamp: new Date() }]);
            }}
            className="text-[10px] text-white/40 hover:text-white/60 ml-auto"
          >
            Clear
          </button>
        </div>
        {!terminalCollapsed && (
          <ScrollArea className="h-[130px]">
            <div className="font-mono text-xs space-y-1">
              {terminalLines.map((line) => (
                <div key={line.id} className={cn('flex gap-2', getLineColor(line.type))}>
                  <span className="text-white/30 shrink-0">
                    {line.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="break-all">{line.text}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Preview/Code Area */}
      <div className="flex-1 bg-stone-900 border border-stone-800 rounded-xl p-4 overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-800 shrink-0">
          <div className="flex items-center bg-stone-800 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('terminal')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                activeTab === 'terminal' 
                  ? 'bg-amber-500 text-stone-950' 
                  : 'text-white/60 hover:text-white'
              )}
            >
              <Terminal size={12} />
              Console
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                activeTab === 'preview' 
                  ? 'bg-amber-500 text-stone-950' 
                  : 'text-white/60 hover:text-white'
              )}
            >
              <Eye size={12} />
              Preview
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {activeTab === 'terminal' ? (
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1 bg-stone-950 rounded-lg p-4" ref={scrollRef}>
                <div className="font-mono text-xs space-y-1">
                  {terminalLines.map((line) => (
                    <div key={line.id} className={cn('flex gap-2', getLineColor(line.type))}>
                      <span className="text-white/30 shrink-0">
                        {line.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="break-all">{line.text}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {/* Command input */}
              <div className="mt-2 flex gap-2">
                <Input
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomCommand()}
                  placeholder="Enter command (e.g., npm install, ls -la)"
                  className="bg-stone-800 border-stone-700 text-white font-mono text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleCustomCommand}
                  disabled={!customCommand.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950"
                >
                  <Send size={14} />
                </Button>
              </div>
            </div>
          ) : isRunning && devServerPort ? (
            <div className="h-full bg-white rounded-lg overflow-hidden">
              <iframe 
                src={`http://localhost:${devServerPort}`}
                className="w-full h-full"
                title="Preview"
              />
            </div>
          ) : isRunning ? (
            <div className="h-full bg-stone-800 rounded-lg flex items-center justify-center text-white/40">
              <div className="text-center">
                <Loader2 size={48} className="mx-auto mb-4 text-amber-500 animate-spin" />
                <p>Starting dev server...</p>
                <p className="text-sm mt-2">Preview will appear when ready</p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-stone-800 rounded-lg flex items-center justify-center text-white/40">
              <div className="text-center">
                <Eye size={48} className="mx-auto mb-4 text-stone-600" />
                <p>No preview available</p>
                <p className="text-sm mt-2">Click Run to start the dev server</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
