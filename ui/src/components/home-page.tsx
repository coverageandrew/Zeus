'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useProjectStore } from '@/lib/project-store';
import { 
  Plus, 
  Folder, 
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HomePage() {
  const { projects, loadProjects, isLoading } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Zeus</h1>
        <p className="text-stone-400">Agent orchestration dashboard for building software with AI</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Zap size={24} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Start a New Project</h2>
              <p className="text-sm text-stone-400">Chat with the Intake Agent to define your project requirements</p>
            </div>
          </div>
          <Link href="/project/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-medium">
              <Plus size={16} className="mr-2" />
              Create Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Projects</h2>
        {isLoading ? (
          <div className="text-stone-400">Loading projects...</div>
        ) : recentProjects.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center">
            <Folder size={48} className="mx-auto text-stone-600 mb-4" />
            <p className="text-stone-400 mb-4">No projects yet. Create your first project to get started.</p>
            <Link href="/project/new">
              <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}/chat`}
                className="bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-amber-500/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-stone-800 flex items-center justify-center">
                    <Folder size={20} className="text-amber-500" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    project.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    project.status === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {project.status === 'in_progress' ? 'In Progress' : 
                     project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <h3 className="font-medium text-white mb-1 group-hover:text-amber-500 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-stone-400 line-clamp-2 mb-3">
                  {project.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <ArrowRight size={14} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
