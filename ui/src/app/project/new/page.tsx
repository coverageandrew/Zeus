'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { useProjectStore } from '@/lib/project-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Zap, ArrowLeft, Loader2 } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject, isLoading } = useProjectStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setError(null);
      const project = await createProject(name.trim(), description.trim());
      router.push(`/project/${project.id}/chat`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Zap size={24} className="text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Project</h1>
              <p className="text-stone-400">Set up your project and start chatting with the Intake Agent</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Project Name *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome App"
                className="bg-stone-900 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Description (optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of what you want to build..."
                rows={4}
                className="bg-stone-900 border-stone-700 text-white placeholder:text-stone-500"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-stone-700 text-stone-300 hover:bg-stone-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
