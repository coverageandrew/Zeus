import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { projectsApi, Project } from './api';

export type { Project };

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  setActiveProject: (id: string | null) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  refreshProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      isLoading: false,
      error: null,

      loadProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const { projects } = await projectsApi.list();
          set({ projects, isLoading: false });
        } catch (error) {
          console.error('Failed to load projects:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to load projects' 
          });
        }
      },

      createProject: async (name: string, description?: string) => {
        set({ isLoading: true, error: null });
        try {
          const newProject = await projectsApi.create(name, description);
          
          set((state) => ({
            projects: [...state.projects, newProject],
            activeProjectId: newProject.id,
            isLoading: false,
          }));

          return newProject;
        } catch (error) {
          console.error('Failed to create project:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to create project' 
          });
          throw error;
        }
      },

      setActiveProject: (id: string | null) => {
        set({ activeProjectId: id });
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        // Optimistic update
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          ),
        }));
        
        // Sync with backend
        projectsApi.update(id, updates).catch((error) => {
          console.error('Failed to update project:', error);
        });
      },

      deleteProject: async (id: string) => {
        try {
          await projectsApi.delete(id);
          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
            activeProjectId:
              state.activeProjectId === id ? null : state.activeProjectId,
          }));
        } catch (error) {
          console.error('Failed to delete project:', error);
          throw error;
        }
      },

      getProject: (id: string) => {
        return get().projects.find((project) => project.id === id);
      },
      
      refreshProject: async (id: string) => {
        try {
          const project = await projectsApi.get(id);
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? project : p
            ),
          }));
        } catch (error) {
          console.error('Failed to refresh project:', error);
        }
      },
    }),
    {
      name: 'zeus-projects',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
