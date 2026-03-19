'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  ScrollText, 
  RefreshCw, 
  Clock, 
  Loader2, 
  Building2,
  Users,
  Bot,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  agent: string;
  message: string;
}

// Agent hierarchy definition - Zeus theme colors (stone/amber)
const AGENT_HIERARCHY = [
  {
    id: 'company_head',
    name: 'Company Head',
    type: 'head' as const,
    color: 'bg-amber-500',
    iconColor: 'text-stone-950',
    children: [
      {
        id: 'architecture',
        name: 'Architecture Dept',
        type: 'department' as const,
        color: 'bg-stone-700',
        iconColor: 'text-amber-500',
        children: [
          { id: 'scaffolder', name: 'Scaffolder Agent', type: 'agent' as const, color: 'bg-stone-800', iconColor: 'text-amber-400' },
          { id: 'database', name: 'Database Agent', type: 'agent' as const, color: 'bg-stone-800', iconColor: 'text-amber-400' },
          { id: 'api', name: 'API Agent', type: 'agent' as const, color: 'bg-stone-800', iconColor: 'text-amber-400' },
        ]
      },
      {
        id: 'frontend',
        name: 'Frontend Dept',
        type: 'department' as const,
        color: 'bg-stone-700',
        iconColor: 'text-amber-500',
        children: [
          { id: 'ui', name: 'UI Agent', type: 'agent' as const, color: 'bg-stone-800', iconColor: 'text-amber-400' },
          { id: 'styling', name: 'Styling Agent', type: 'agent' as const, color: 'bg-stone-800', iconColor: 'text-amber-400' },
        ]
      },
      {
        id: 'backend',
        name: 'Backend Dept',
        type: 'department' as const,
        color: 'bg-stone-700',
        iconColor: 'text-amber-500',
        children: [
          { id: 'logic', name: 'Logic Agent', type: 'agent' as const, color: 'bg-stone-800', iconColor: 'text-amber-400' },
          { id: 'integration', name: 'Integration Agent', type: 'agent' as const, color: 'bg-stone-800', iconColor: 'text-amber-400' },
        ]
      },
      {
        id: 'qa',
        name: 'QA Dept',
        type: 'department' as const,
        color: 'bg-stone-700',
        iconColor: 'text-amber-500',
        children: [
          { id: 'testing', name: 'Testing Agent', type: 'agent' as const, color: 'bg-stone-800', iconColor: 'text-amber-400' },
          { id: 'review', name: 'Review Agent', type: 'agent' as const, color: 'bg-stone-800', iconColor: 'text-amber-400' },
        ]
      },
    ]
  }
];

interface AgentNodeProps {
  node: typeof AGENT_HIERARCHY[0] | typeof AGENT_HIERARCHY[0]['children'][0] | typeof AGENT_HIERARCHY[0]['children'][0]['children'][0];
  logs: LogEntry[];
  depth: number;
}

function AgentNode({ node, logs, depth }: AgentNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  
  // Match logs to this agent
  const agentLogs = logs.filter(log => {
    const logAgent = log.agent.toLowerCase().replace(/[\s_-]+/g, '');
    const nodeName = node.name.toLowerCase().replace(/[\s_-]+/g, '');
    const nodeId = node.id.toLowerCase();
    return logAgent.includes(nodeId) || logAgent.includes(nodeName) || 
           nodeName.includes(logAgent) || nodeId.includes(logAgent);
  });

  const hasChildren = 'children' in node && node.children && node.children.length > 0;
  const hasLogs = agentLogs.length > 0;

  // Toggle logs on card click (only for agents with logs)
  const handleCardClick = () => {
    if (hasLogs) {
      setShowLogs(!showLogs);
    }
  };

  const getIcon = () => {
    if (node.type === 'head') return Building2;
    if (node.type === 'department') return Users;
    return Bot;
  };
  const Icon = getIcon();

  return (
    <div className="relative">
      {/* Connecting line */}
      {depth > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 border-l-2 border-stone-600"
          style={{ left: `${(depth - 1) * 24 + 12}px` }}
        />
      )}
      {depth > 0 && (
        <div 
          className="absolute border-t-2 border-stone-600"
          style={{ 
            left: `${(depth - 1) * 24 + 12}px`, 
            top: '20px',
            width: '12px'
          }}
        />
      )}

      {/* Agent Card - clickable to toggle logs */}
      <div 
        className={cn(
          "bg-stone-900 border border-stone-700 rounded-lg p-3 mb-2 transition-all duration-200 hover:-translate-y-px hover:border-amber-500/50 hover:shadow-[0_0_10px_rgba(245,158,11,0.1)]",
          hasLogs && "cursor-pointer",
          showLogs && "border-amber-500/50 bg-stone-800"
        )}
        style={{ marginLeft: `${depth * 24}px` }}
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-stone-600',
            node.color
          )}>
            <Icon size={18} className={'iconColor' in node ? (node as any).iconColor : 'text-white'} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-white truncate">{node.name}</h4>
              {hasLogs && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  showLogs ? "bg-amber-500 text-stone-950" : "bg-amber-500/20 text-amber-400"
                )}>
                  {agentLogs.length}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/50 capitalize">{node.type}</p>
          </div>

          <div className="flex items-center gap-1">
            {hasChildren && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="p-1 rounded hover:bg-stone-700 text-white/50"
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Logs accordion - tripled size */}
        {showLogs && hasLogs && (
          <div className="mt-3 pt-3 border-t border-stone-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-600 scrollbar-track-transparent">
              <div className="space-y-2 pr-1">
                {agentLogs.slice(0, 15).map((log) => (
                  <div key={log.id} className="flex items-start gap-2 p-2.5 bg-stone-800 rounded text-xs border border-stone-700">
                    {log.level === 'error' ? <AlertCircle size={12} className="text-red-400 shrink-0 mt-0.5" /> :
                     log.level === 'warn' ? <AlertCircle size={12} className="text-amber-400 shrink-0 mt-0.5" /> :
                     <Info size={12} className="text-amber-500/70 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-white/80 text-[11px] leading-relaxed">{log.message}</p>
                      <span className="text-white/40 flex items-center gap-1 mt-1 text-[10px]">
                        <Clock size={10} />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {agentLogs.length > 15 && (
                  <p className="text-[10px] text-white/40 text-center py-2">
                    +{agentLogs.length - 15} more entries
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {(node as any).children.map((child: any) => (
            <AgentNode key={child.id} node={child} logs={logs} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectLogsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const url = filter !== 'all' 
        ? `/api/logs/${projectId}?level=${filter}` 
        : `/api/logs/${projectId}`;
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadLogs();
  }, [projectId, filter]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-500/10';
      case 'warn': return 'text-amber-400 bg-amber-500/10';
      case 'info': return 'text-blue-400 bg-blue-500/10';
      case 'debug': return 'text-stone-400 bg-stone-500/10';
      default: return 'text-stone-400 bg-stone-500/10';
    }
  };

  return (
    <div className="h-[calc(100vh-220px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-amber-500" />
          <h3 className="font-medium text-white">Agent Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="all">All Levels</option>
            <option value="error">Errors</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            className="border-stone-700 text-stone-300"
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-full flex items-center justify-center text-white/40">
          <Loader2 className="animate-spin mr-2" /> Loading logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="h-full flex items-center justify-center text-white/40">
          No logs found
        </div>
      ) : (
        /* Split screen: Hierarchy left, Feed right */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-50px)]">
          {/* Left: Agent Hierarchy with glass cards - scrollable parent */}
          <div className="glass-card rounded-xl p-4 overflow-hidden flex flex-col glow-amber">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10 shrink-0">
              <Building2 size={16} className="text-amber-500" />
              <h4 className="font-medium text-white text-sm">Agent Hierarchy</h4>
              <span className="text-[10px] text-white/40 ml-auto">Click cards to view logs</span>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="pr-2">
                {AGENT_HIERARCHY.map((node) => (
                  <AgentNode key={node.id} node={node} logs={logs} depth={0} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Log Feed */}
          <div className="glass-card rounded-xl p-4 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10 shrink-0">
              <ScrollText size={16} className="text-amber-500" />
              <h4 className="font-medium text-white text-sm">Activity Feed</h4>
              <span className="text-xs text-white/40 ml-auto">{logs.length} entries</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="glass-card rounded-lg p-3 transition-all hover:border-white/20"
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium uppercase shrink-0 mt-0.5',
                        getLevelColor(log.level)
                      )}>
                        {log.level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-amber-500">{log.agent}</span>
                          <span className="text-[10px] text-white/40 flex items-center gap-1 ml-auto">
                            <Clock size={10} />
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-white/70">{log.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
