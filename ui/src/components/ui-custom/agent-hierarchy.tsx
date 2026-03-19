'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  Users, 
  Bot,
  Clock,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  agent: string;
  message: string;
}

interface AgentNodeBase {
  id: string;
  name: string;
  type: 'company_head' | 'department' | 'agent';
  color: string;
  icon: 'building' | 'users' | 'bot';
  children?: AgentNodeBase[];
}

interface AgentNode extends AgentNodeBase {
  children?: AgentNode[];
  logs: LogEntry[];
}

// Zeus agent hierarchy structure
const AGENT_HIERARCHY: AgentNodeBase[] = [
  {
    id: 'company_head',
    name: 'Company Head',
    type: 'company_head',
    color: 'bg-purple-500',
    icon: 'building',
    children: [
      {
        id: 'architecture_department',
        name: 'Architecture Department',
        type: 'department',
        color: 'bg-blue-500',
        icon: 'users',
        children: [
          { id: 'scaffolder_agent', name: 'Scaffolder Agent', type: 'agent', color: 'bg-emerald-500', icon: 'bot' },
          { id: 'database_agent', name: 'Database Agent', type: 'agent', color: 'bg-emerald-500', icon: 'bot' },
          { id: 'api_agent', name: 'API Agent', type: 'agent', color: 'bg-emerald-500', icon: 'bot' },
        ]
      },
      {
        id: 'frontend_department',
        name: 'Frontend Department',
        type: 'department',
        color: 'bg-cyan-500',
        icon: 'users',
        children: [
          { id: 'ui_agent', name: 'UI Agent', type: 'agent', color: 'bg-emerald-500', icon: 'bot' },
          { id: 'styling_agent', name: 'Styling Agent', type: 'agent', color: 'bg-emerald-500', icon: 'bot' },
        ]
      },
      {
        id: 'backend_department',
        name: 'Backend Department',
        type: 'department',
        color: 'bg-orange-500',
        icon: 'users',
        children: [
          { id: 'logic_agent', name: 'Logic Agent', type: 'agent', color: 'bg-emerald-500', icon: 'bot' },
          { id: 'integration_agent', name: 'Integration Agent', type: 'agent', color: 'bg-emerald-500', icon: 'bot' },
        ]
      },
      {
        id: 'qa_department',
        name: 'QA Department',
        type: 'department',
        color: 'bg-pink-500',
        icon: 'users',
        children: [
          { id: 'testing_agent', name: 'Testing Agent', type: 'agent', color: 'bg-emerald-500', icon: 'bot' },
          { id: 'review_agent', name: 'Review Agent', type: 'agent', color: 'bg-emerald-500', icon: 'bot' },
        ]
      },
    ]
  }
];

function normalizeAgentName(name: string): string {
  return name.toLowerCase().replace(/[\s_-]+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function getIcon(icon: string) {
  switch (icon) {
    case 'building': return Building2;
    case 'users': return Users;
    case 'bot': return Bot;
    default: return Bot;
  }
}

function getLevelIcon(level: string) {
  switch (level) {
    case 'error': return <AlertCircle size={12} className="text-red-400" />;
    case 'warn': return <AlertCircle size={12} className="text-amber-400" />;
    case 'info': return <Info size={12} className="text-blue-400" />;
    default: return <CheckCircle size={12} className="text-stone-400" />;
  }
}

interface AgentNodeComponentProps {
  node: AgentNode;
  depth: number;
  isLast: boolean;
  parentLines: boolean[];
}

function AgentNodeComponent({ node, depth, isLast, parentLines }: AgentNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [showLogs, setShowLogs] = useState(false);
  const Icon = getIcon(node.icon);
  const hasChildren = node.children && node.children.length > 0;
  const hasLogs = node.logs.length > 0;

  return (
    <div className="relative">
      {/* Vertical lines from parent */}
      {depth > 0 && parentLines.map((show, i) => (
        show && (
          <div
            key={i}
            className="absolute border-l-2 border-stone-600"
            style={{
              left: `${i * 40 + 20}px`,
              top: 0,
              bottom: isLast && i === parentLines.length - 1 ? '50%' : 0,
            }}
          />
        )
      ))}

      {/* Horizontal line to this node */}
      {depth > 0 && (
        <div
          className="absolute border-t-2 border-stone-600"
          style={{
            left: `${(depth - 1) * 40 + 20}px`,
            top: '24px',
            width: '20px',
          }}
        />
      )}

      {/* Node content */}
      <div 
        className="relative flex items-start gap-3 py-2"
        style={{ marginLeft: `${depth * 40}px` }}
      >
        {/* Node icon and info */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0',
            node.color
          )}>
            <Icon size={20} />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white text-sm">{node.name}</span>
              {hasLogs && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  {node.logs.length}
                </span>
              )}
            </div>
            <span className="text-xs text-white/40 capitalize">{node.type.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Expand/collapse buttons */}
        <div className="flex items-center gap-1 ml-auto">
          {hasLogs && (
            <button
              onClick={() => setShowLogs(!showLogs)}
              className={cn(
                'px-2 py-1 rounded text-xs transition-colors',
                showLogs 
                  ? 'bg-amber-500 text-stone-950' 
                  : 'bg-stone-700 text-white/70 hover:bg-stone-600'
              )}
            >
              {showLogs ? 'Hide Logs' : 'View Logs'}
            </button>
          )}
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-stone-700 text-white/50"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Logs accordion */}
      {showLogs && hasLogs && (
        <div 
          className="ml-12 mb-3 bg-stone-800/50 rounded-lg border border-stone-700 overflow-hidden"
          style={{ marginLeft: `${depth * 40 + 48}px` }}
        >
          <ScrollArea className="max-h-[200px]">
            <div className="p-2 space-y-1">
              {node.logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-2 p-2 rounded bg-stone-900/50 text-xs"
                >
                  {getLevelIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80">{log.message}</p>
                    <span className="text-white/40 flex items-center gap-1 mt-1">
                      <Clock size={10} />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <AgentNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={index === node.children!.length - 1}
              parentLines={[...parentLines, !isLast]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AgentHierarchyProps {
  logs: LogEntry[];
}

export function AgentHierarchy({ logs }: AgentHierarchyProps) {
  // Map logs to agents in the hierarchy
  const mapLogsToHierarchy = (nodes: AgentNodeBase[]): AgentNode[] => {
    return nodes.map(node => {
      const normalizedNodeName = normalizeAgentName(node.name);
      const nodeLogs = logs.filter(log => {
        const normalizedLogAgent = normalizeAgentName(log.agent);
        return normalizedLogAgent.includes(normalizedNodeName) || 
               normalizedNodeName.includes(normalizedLogAgent) ||
               log.agent.toLowerCase().includes(node.id.replace(/_/g, ' '));
      });

      return {
        ...node,
        logs: nodeLogs,
        children: node.children ? mapLogsToHierarchy(node.children) : undefined,
      };
    });
  };

  const hierarchyWithLogs = mapLogsToHierarchy(AGENT_HIERARCHY);

  // Also collect any logs that don't match known agents
  const knownAgentIds = new Set<string>();
  const collectIds = (nodes: AgentNode[]) => {
    nodes.forEach(n => {
      knownAgentIds.add(normalizeAgentName(n.name));
      knownAgentIds.add(n.id);
      if (n.children) collectIds(n.children);
    });
  };
  collectIds(hierarchyWithLogs);

  const unmatchedLogs = logs.filter(log => {
    const normalized = normalizeAgentName(log.agent);
    return !Array.from(knownAgentIds).some(id => 
      normalized.includes(id) || id.includes(normalized)
    );
  });

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-white/60 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span>Company Head</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Department</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Agent</span>
        </div>
      </div>

      {/* Hierarchy tree */}
      <div className="relative">
        {hierarchyWithLogs.map((node, index) => (
          <AgentNodeComponent
            key={node.id}
            node={node}
            depth={0}
            isLast={index === hierarchyWithLogs.length - 1}
            parentLines={[]}
          />
        ))}
      </div>

      {/* Unmatched logs */}
      {unmatchedLogs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-stone-700">
          <h4 className="text-sm font-medium text-white/60 mb-3">Other Activity ({unmatchedLogs.length})</h4>
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-1">
              {unmatchedLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-2 p-2 rounded bg-stone-800/50 text-xs"
                >
                  {getLevelIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <span className="text-amber-400 font-medium">{log.agent}</span>
                    <p className="text-white/80 mt-0.5">{log.message}</p>
                    <span className="text-white/40 flex items-center gap-1 mt-1">
                      <Clock size={10} />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
