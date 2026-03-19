'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProjectStore } from '@/lib/project-store';
import { 
  Zap, 
  Plus, 
  LayoutDashboard, 
  Settings, 
  Folder,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
  const pathname = usePathname();
  const { projects, loadProjects, isLoading, deleteProject } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="w-64 h-screen bg-stone-900 border-r border-stone-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Zap size={18} className="text-stone-950" />
          </div>
          <span className="text-lg font-semibold text-white">Zeus</span>
        </Link>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <Link href="/project/new">
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-medium">
            <Plus size={16} className="mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-2">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            pathname === '/'
              ? 'bg-stone-800 text-amber-500'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
          )}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
      </nav>

      {/* Projects List */}
      <div className="flex-1 overflow-hidden flex flex-col mt-4">
        <div className="px-4 py-2">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            My Projects
          </span>
        </div>
        <ScrollArea className="flex-1 px-2">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-stone-500">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="px-3 py-2 text-sm text-stone-500">No projects yet</div>
          ) : (
            <div className="space-y-1">
              {projects.map((project) => {
                const isActive = pathname?.startsWith(`/project/${project.id}`);
                return (
                  <div key={project.id} className="group relative">
                    <Link
                      href={`/project/${project.id}/chat`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-stone-800 text-amber-500'
                          : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                      )}
                    >
                      <Folder size={16} />
                      <span className="truncate flex-1">{project.name}</span>
                      {isActive && <ChevronRight size={14} />}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-stone-500 hover:text-red-400 transition-all"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-stone-800">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-stone-800 text-amber-500'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
          )}
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </div>
  );
}
