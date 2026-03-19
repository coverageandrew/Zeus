'use client';

import { useParams } from 'next/navigation';
import { ApiRequirementsPanel } from '@/components/ui-custom/api-requirements-panel';
import { Key } from 'lucide-react';

export default function ProjectApiPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="h-[calc(100vh-220px)]">
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 h-full">
        <div className="flex items-center gap-2 mb-6">
          <Key size={20} className="text-amber-500" />
          <h3 className="text-lg font-medium text-white">API Requirements</h3>
        </div>
        <p className="text-sm text-white/60 mb-6">
          Configure the API keys required for this project. Click on each card to expand and add your key.
        </p>
        <ApiRequirementsPanel projectId={projectId} className="max-w-2xl" />
      </div>
    </div>
  );
}
