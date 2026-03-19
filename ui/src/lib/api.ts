const API_BASE = '/api';

// Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: 'intake' | 'in_progress' | 'completed' | 'error';
  currentPhase: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  children?: FileItem[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  agent: string;
  message: string;
  details?: string;
}

// Helper for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Projects API
export const projectsApi = {
  list: () => apiCall<{ projects: Project[] }>('/projects'),
  
  get: (id: string) => apiCall<Project>(`/projects/${id}`),
  
  create: (name: string, description?: string) =>
    apiCall<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),
  
  update: (id: string, updates: Partial<Project>) =>
    apiCall<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string) =>
    apiCall<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
};

// Intake API
export const intakeApi = {
  chat: (projectId: string, message: string, history: ChatMessage[]) =>
    apiCall<{
      response: string;
      specUpdated: boolean;
      specPreview: string | null;
      timestamp: string;
    }>('/intake/chat', {
      method: 'POST',
      body: JSON.stringify({ projectId, message, history }),
    }),
  
  handoff: (projectId: string) =>
    apiCall<{
      success: boolean;
      message: string;
      projectId: string;
      newStatus: string;
      newPhase: number;
    }>('/intake/handoff', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),
  
  getSpec: (projectId: string) =>
    apiCall<{ content: string }>(`/intake/spec/${projectId}`),
};

// Files API
export const filesApi = {
  list: (projectId: string) =>
    apiCall<{ files: FileItem[] }>(`/files/${projectId}`),
  
  getContent: (projectId: string, filePath: string) =>
    apiCall<{
      path: string;
      content: string;
      size: number;
      modified: string;
    }>(`/files/${projectId}/content?path=${encodeURIComponent(filePath)}`),
};

// Logs API
export const logsApi = {
  list: (projectId: string, options?: { level?: string; agent?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.level) params.set('level', options.level);
    if (options?.agent) params.set('agent', options.agent);
    if (options?.limit) params.set('limit', options.limit.toString());
    
    const query = params.toString();
    return apiCall<{ logs: LogEntry[] }>(`/logs/${projectId}${query ? `?${query}` : ''}`);
  },
  
  add: (projectId: string, agent: string, message: string, level?: string) =>
    apiCall<{ success: boolean; entry: LogEntry }>(`/logs/${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ agent, message, level }),
    }),
};

// Health check
export const healthApi = {
  check: () => apiCall<{ status: string; timestamp: string }>('/health'),
};
