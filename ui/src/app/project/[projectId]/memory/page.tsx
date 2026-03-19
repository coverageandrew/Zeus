'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Trash2, 
  RefreshCw,
  Bot,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface MemoryEntry {
  id: string;
  agent: string;
  key: string;
  value: string;
  timestamp: string;
}

export default function ProjectMemoryPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMemories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/memory/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      } else {
        setError('Failed to load memories');
      }
    } catch (err) {
      setError('Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMemories = async () => {
    if (!confirm('Clear all agent memories? This cannot be undone.')) return;
    
    setIsClearing(true);
    try {
      const res = await fetch(`/api/memory/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        setMemories([]);
      }
    } catch (err) {
      console.error('Failed to clear memories:', err);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [projectId]);

  // Group memories by agent
  const groupedMemories = memories.reduce((acc, mem) => {
    if (!acc[mem.agent]) acc[mem.agent] = [];
    acc[mem.agent].push(mem);
    return acc;
  }, {} as Record<string, MemoryEntry[]>);

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-amber-500" />
          <h3 className="font-medium text-white">Agent Memory</h3>
          <span className="text-xs text-white/50">
            ({memories.length} {memories.length === 1 ? 'entry' : 'entries'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMemories}
            disabled={isLoading}
            className="border-stone-700 text-stone-300 hover:bg-stone-800"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearMemories}
            disabled={isClearing || memories.length === 0}
            className="border-stone-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            {isClearing ? <Loader2 size={14} className="animate-spin mr-1" /> : <Trash2 size={14} className="mr-1" />}
            Clear All
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-stone-900 border border-stone-800 rounded-xl p-4 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-white/40">
            <Loader2 size={24} className="animate-spin mr-2" />
            Loading memories...
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-400">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        ) : memories.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40">
            <Brain size={48} className="mb-4 text-stone-600" />
            <p>No memories stored yet</p>
            <p className="text-sm mt-2">Agents will store context here as they work</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {Object.entries(groupedMemories).map(([agent, entries]) => (
                <div key={agent} className="bg-stone-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-700">
                    <Bot size={16} className="text-amber-500" />
                    <h4 className="font-medium text-white capitalize">{agent}</h4>
                    <span className="text-xs text-white/40">
                      {entries.length} {entries.length === 1 ? 'memory' : 'memories'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <div key={entry.id} className="bg-stone-900/50 rounded p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-amber-400 mb-1">
                              {entry.key}
                            </div>
                            <div className="text-sm text-white/80 break-words">
                              {entry.value.length > 500 
                                ? entry.value.slice(0, 500) + '...' 
                                : entry.value}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-white/40">
                          <Clock size={10} />
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
