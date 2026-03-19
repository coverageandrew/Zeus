'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { useProjectStore } from '@/lib/project-store';
import { 
  MessageSquare, 
  FolderOpen, 
  ScrollText, 
  Code2, 
  Brain 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'sandbox', label: 'Sandbox', icon: Code2 },
  { id: 'memory', label: 'Memory', icon: Brain },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  const { getProject } = useProjectStore();
  const project = getProject(projectId);

  const activeTab = pathname?.split('/').pop() || 'chat';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Project Header */}
        <div className="border-b border-stone-800 bg-stone-900/50">
          <div className="px-6 py-4">
            <h1 className="text-xl font-semibold text-white">
              {project?.name || 'Project'}
            </h1>
            {project?.description && (
              <p className="text-sm text-stone-400 mt-1">{project.description}</p>
            )}
          </div>

          {/* Tabs */}
          <div className="px-6 flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/project/${projectId}/${tab.id}`}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                    isActive
                      ? 'bg-stone-950 text-amber-500 border-t border-l border-r border-stone-800'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
