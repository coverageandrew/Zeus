'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  children?: FileItem[];
}

export default function ProjectFilesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ name: string; path: string; content: string } | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    
    setIsLoading(true);
    fetch(`/api/files/${projectId}`)
      .then(res => res.json())
      .then(({ files }) => {
        setFiles(files || []);
        const firstFile = files?.find((f: FileItem) => f.type === 'file');
        if (firstFile) loadFileContent(firstFile.path, firstFile.name);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [projectId]);

  const loadFileContent = async (filePath: string, fileName: string) => {
    setIsLoadingContent(true);
    try {
      const res = await fetch(`/api/files/${projectId}/content?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      setSelectedFile({ name: fileName, path: filePath, content: data.content });
    } catch (err) {
      setSelectedFile({ name: fileName, path: filePath, content: 'Error loading file' });
    } finally {
      setIsLoadingContent(false);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <button
          onClick={() => item.type === 'folder' ? toggleFolder(item.path) : loadFileContent(item.path, item.name)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
            'hover:bg-stone-800',
            selectedFile?.path === item.path && item.type === 'file' && 'bg-stone-800 text-amber-500'
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {item.type === 'folder' ? (
            <>
              {expandedFolders.has(item.path) ? <ChevronDown size={14} className="text-white/50" /> : <ChevronRight size={14} className="text-white/50" />}
              <FolderOpen size={16} className="text-amber-500" />
            </>
          ) : (
            <>
              <span className="w-[14px]" />
              <FileText size={16} className="text-white/50" />
            </>
          )}
          <span className="truncate">{item.name}</span>
        </button>
        {item.type === 'folder' && expandedFolders.has(item.path) && item.children && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-white/40"><Loader2 className="animate-spin mr-2" /> Loading files...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)]">
      <div className="lg:col-span-1 bg-stone-900 border border-stone-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={18} className="text-amber-500" />
          <h3 className="font-medium text-white">Project Files</h3>
        </div>
        <ScrollArea className="h-[calc(100%-40px)]">
          {files.length === 0 ? (
            <div className="text-sm text-white/40">No files found</div>
          ) : (
            <div className="space-y-1">{renderFileTree(files)}</div>
          )}
        </ScrollArea>
      </div>

      <div className="lg:col-span-3 bg-stone-900 border border-stone-800 rounded-xl p-4">
        {isLoadingContent ? (
          <div className="h-full flex items-center justify-center text-white/40"><Loader2 className="animate-spin mr-2" /> Loading...</div>
        ) : selectedFile ? (
          <>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-800">
              <FileText size={18} className="text-amber-500" />
              <h3 className="font-medium text-white">{selectedFile.name}</h3>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono leading-relaxed">{selectedFile.content}</pre>
            </ScrollArea>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-white/40">Select a file to view</div>
        )}
      </div>
    </div>
  );
}
