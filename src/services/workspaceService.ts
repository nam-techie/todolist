import { Workspace } from '../types/Task';

class WorkspaceService {
  private storageKey = 'taskflow-workspaces';

  getWorkspaces(): Workspace[] {
    try {
      const workspaces = localStorage.getItem(this.storageKey);
      const parsed = workspaces ? JSON.parse(workspaces) : [];
      
      // Ensure default workspace exists
      if (!parsed.find((w: Workspace) => w.id === 'default')) {
        const defaultWorkspace: Workspace = {
          id: 'default',
          name: 'Personal',
          icon: '📝',
          color: 'green',
          createdAt: new Date().toISOString(),
        };
        parsed.unshift(defaultWorkspace);
        this.saveWorkspaces(parsed);
      }
      
      return parsed;
    } catch (error) {
      console.error('Error loading workspaces:', error);
      return [{
        id: 'default',
        name: 'Personal',
        icon: '📝',
        color: 'green',
        createdAt: new Date().toISOString(),
      }];
    }
  }

  saveWorkspaces(workspaces: Workspace[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(workspaces));
    } catch (error) {
      console.error('Error saving workspaces:', error);
    }
  }

  createWorkspace(workspaceData: Omit<Workspace, 'id' | 'createdAt'>): Workspace {
    const newWorkspace: Workspace = {
      ...workspaceData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const workspaces = this.getWorkspaces();
    workspaces.push(newWorkspace);
    this.saveWorkspaces(workspaces);
    
    return newWorkspace;
  }

  updateWorkspace(workspaceId: string, updates: Partial<Omit<Workspace, 'id' | 'createdAt'>>): Workspace | null {
    const workspaces = this.getWorkspaces();
    const workspaceIndex = workspaces.findIndex(workspace => workspace.id === workspaceId);
    
    if (workspaceIndex === -1) {
      return null;
    }

    const updatedWorkspace = {
      ...workspaces[workspaceIndex],
      ...updates,
    };

    workspaces[workspaceIndex] = updatedWorkspace;
    this.saveWorkspaces(workspaces);
    
    return updatedWorkspace;
  }

  deleteWorkspace(workspaceId: string): void {
    if (workspaceId === 'default') return; // Cannot delete default workspace
    
    const workspaces = this.getWorkspaces();
    const filteredWorkspaces = workspaces.filter(workspace => workspace.id !== workspaceId);
    this.saveWorkspaces(filteredWorkspaces);
  }
}

export const workspaceService = new WorkspaceService();