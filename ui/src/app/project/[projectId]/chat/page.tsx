'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useProjectStore } from '@/lib/project-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApiRequirementsPanel } from '@/components/ui-custom/api-requirements-panel';
import { 
  Send, 
  Bot, 
  User,
  Loader2,
  FileText,
  CheckCircle2,
  PlayCircle,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ProjectChatPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { getProject, updateProject } = useProjectStore();
  const project = getProject(projectId);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [specPreview, setSpecPreview] = useState<string | null>(null);
  const [specLoading, setSpecLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [ideMode, setIdeMode] = useState(false);

  // Check if IDE mode is enabled
  useEffect(() => {
    const savedIdeMode = localStorage.getItem('zeus_ide_mode');
    setIdeMode(savedIdeMode === 'true');
  }, []);

  // Load initial spec and set appropriate welcome message
  useEffect(() => {
    if (!projectId) return;
    
    setSpecLoading(true);
    fetch(`/api/intake/spec/${projectId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(({ content }) => {
        setSpecPreview(content);
        
        const hasRealSpec = content && 
          !content.includes('To be defined during intake') &&
          content.length > 200;
        
        if (hasRealSpec) {
          setMessages([{
            id: '1',
            role: 'assistant',
            content: `Welcome back! I see this project already has a detailed PRODUCT_SPEC.md.\n\nYou can:\n• Ask questions about the current requirements\n• Request changes to the spec\n• Continue development if you're ready\n\nHow can I help you today?`,
            timestamp: new Date(),
          }]);
        } else {
          setMessages([{
            id: '1',
            role: 'assistant',
            content: `Hello! I'm the Intake Agent for Zeus. I'll help you define the requirements for your project.\n\nTo get started, please tell me:\n1. What type of application do you want to build?\n2. Who is the target audience?\n3. What are the main features you need?`,
            timestamp: new Date(),
          }]);
        }
      })
      .catch(() => {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `Hello! I'm the Intake Agent for Zeus. I'll help you define the requirements for your project.\n\nTo get started, please tell me:\n1. What type of application do you want to build?\n2. Who is the target audience?\n3. What are the main features you need?`,
          timestamp: new Date(),
        }]);
      })
      .finally(() => setSpecLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !projectId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      }));

      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, message: userMessage.content, history }),
      });

      const result = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(result.timestamp),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (result.specUpdated && result.specPreview) {
        setSpecPreview(result.specPreview);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-220px)]">
      {/* IDE Mode Banner */}
      {ideMode && (
        <div className="lg:col-span-12 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Bot size={16} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-amber-400">IDE Mode Active</div>
            <p className="text-sm text-white/60">
              Zeus is not making LLM calls. Use your IDE to read project files and make updates. 
              See <code className="bg-stone-800 px-1 rounded text-xs">IDE_INSTRUCTIONS.md</code> for the workflow.
            </p>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="lg:col-span-5 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col bg-stone-900 border border-stone-800 rounded-xl p-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === 'user' ? 'bg-stone-700' : 'bg-amber-500'
                  }`}>
                    {message.role === 'user' 
                      ? <User size={16} className="text-white" />
                      : <Bot size={16} className="text-stone-950" />
                    }
                  </div>
                  <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-stone-700 text-white'
                      : 'bg-stone-800 text-white border-l-2 border-amber-500'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs text-white/40 mt-2 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <Bot size={16} className="text-stone-950" />
                  </div>
                  <div className="bg-stone-800 rounded-lg px-4 py-3 border-l-2 border-amber-500">
                    <div className="flex items-center gap-2 text-white/60">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-stone-800 pt-4 mt-4">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your project requirements..."
                className="flex-1 bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 self-end"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Panel - Status + Spec */}
      <div className="lg:col-span-4 flex flex-col gap-3 min-h-0">
        {/* Ready to Begin - moved to top */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shrink-0">
          {project?.status === 'intake' ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-amber-500" />
                <h3 className="font-medium text-white text-sm">Ready to Begin?</h3>
              </div>
              <p className="text-xs text-white/60 mb-3">
                When satisfied with requirements, confirm to hand off to development.
              </p>
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-medium text-sm"
                disabled={!specPreview || specPreview.includes('To be defined') || isStarting}
                onClick={async () => {
                  setIsStarting(true);
                  try {
                    const res = await fetch(`/api/projects/${projectId}/start`, {
                      method: 'POST',
                    });
                    if (res.ok) {
                      const data = await res.json();
                      updateProject(projectId, { status: 'in_progress', currentPhase: 0 });
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: `🚀 **Development Started!**\n\nYour project is now in Phase 0: Foundation.\n\nTo run the orchestrator and begin automated development:\n\`\`\`\nnpx tsx core/index.ts run ${projectId}\n\`\`\`\n\nYou can also view progress in the **Logs** tab.`,
                        timestamp: new Date(),
                      }]);
                    } else {
                      throw new Error('Failed to start');
                    }
                  } catch (err) {
                    console.error('Failed to start development:', err);
                    setMessages(prev => [...prev, {
                      id: Date.now().toString(),
                      role: 'assistant',
                      content: '❌ Failed to start development. Please try again.',
                      timestamp: new Date(),
                    }]);
                  } finally {
                    setIsStarting(false);
                  }
                }}
              >
                {isStarting ? <><Loader2 size={14} className="animate-spin mr-2" /> Starting...</> : 'Confirm & Start Development'}
              </Button>
            </>
          ) : project?.status === 'in_progress' ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <PlayCircle size={16} className="text-emerald-500" />
                <h3 className="font-medium text-white text-sm">In Progress</h3>
              </div>
              <p className="text-xs text-white/60">
                Phase {project.currentPhase} in progress. Chat to request changes.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={16} className="text-amber-500" />
                <h3 className="font-medium text-white text-sm">Chat with Agent</h3>
              </div>
              <p className="text-xs text-white/60">
                Ask questions or discuss requirements.
              </p>
            </>
          )}
        </div>

        {/* Spec Preview */}
        <div className="flex-1 flex flex-col bg-stone-900 border border-stone-800 rounded-xl p-4 overflow-hidden min-h-0">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <FileText size={16} className="text-amber-500" />
            <h3 className="font-medium text-white text-sm">PRODUCT_SPEC.md</h3>
          </div>
          {specLoading ? (
            <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
              <Loader2 size={20} className="animate-spin mr-2" />
              Loading spec...
            </div>
          ) : specPreview ? (
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="text-xs text-white/80 pr-2">
                {specPreview.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h1 key={i} className="text-sm font-bold text-amber-500 mt-3 mb-1">{line.slice(2)}</h1>;
                  if (line.startsWith('## ')) return <h2 key={i} className="text-xs font-semibold text-amber-400 mt-2 mb-1">{line.slice(3)}</h2>;
                  if (line.startsWith('### ')) return <h3 key={i} className="text-xs font-medium text-amber-300 mt-1 mb-0.5">{line.slice(4)}</h3>;
                  if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 border-amber-500 pl-2 text-white/60 italic text-xs">{line.slice(2)}</blockquote>;
                  if (line.startsWith('- [ ] ')) return <div key={i} className="flex items-start gap-1 ml-1 text-xs"><span className="text-stone-500">☐</span><span>{line.slice(6)}</span></div>;
                  if (line.startsWith('- [x] ')) return <div key={i} className="flex items-start gap-1 ml-1 text-xs"><span className="text-emerald-500">☑</span><span>{line.slice(6)}</span></div>;
                  if (line.startsWith('- ')) return <div key={i} className="flex items-start gap-1 ml-1 text-xs"><span className="text-amber-500">•</span><span>{line.slice(2)}</span></div>;
                  if (line.startsWith('---')) return <hr key={i} className="border-stone-700 my-2" />;
                  if (line.startsWith('|')) return <div key={i} className="font-mono text-[10px] text-white/60">{line}</div>;
                  if (!line.trim()) return <div key={i} className="h-1" />;
                  return <p key={i} className="text-white/70 text-xs">{line}</p>;
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
              Spec will appear here as you chat...
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - API Keys only */}
      <div className="lg:col-span-3 flex flex-col min-h-0">
        <div className="flex-1 bg-stone-900 border border-stone-800 rounded-xl p-4 overflow-hidden flex flex-col">
          <ApiRequirementsPanel projectId={projectId} className="flex-1 flex flex-col min-h-0" />
        </div>
      </div>
    </div>
  );
}
