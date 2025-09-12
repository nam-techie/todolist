import { User } from 'firebase/auth';
import { workspaceService } from './workspaceService';
import { Workspace } from '../types/Task';

export class UserWorkspaceService {
  private static readonly USER_WORKSPACE_KEY = 'user_workspace_created';

  /**
   * Extract first name from display name or email
   */
  private static extractUserName(user: User): string {
    if (user.displayName) {
      // Extract first name from display name (e.g., "Phuong Nam" -> "Phuong Nam")
      return user.displayName.trim();
    }
    
    if (user.email) {
      // Extract name from email (e.g., "phuongnam@gmail.com" -> "Phuong Nam")
      const emailName = user.email.split('@')[0];
      // Convert dot/underscore to space and capitalize
      return emailName
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    return 'Personal';
  }

  /**
   * Get appropriate workspace name for user
   */
  static getUserWorkspaceName(user: User): string {
    return this.extractUserName(user);
  }

  /**
   * Check if user workspace has been created
   */
  static hasUserWorkspaceBeenCreated(userId: string): boolean {
    const created = localStorage.getItem(`${this.USER_WORKSPACE_KEY}_${userId}`);
    return created === 'true';
  }

  /**
   * Mark user workspace as created
   */
  static markUserWorkspaceAsCreated(userId: string): void {
    localStorage.setItem(`${this.USER_WORKSPACE_KEY}_${userId}`, 'true');
  }

  /**
   * Create or update default workspace for user
   */
  static createOrUpdateUserWorkspace(user: User): Workspace | null {
    const userName = this.getUserWorkspaceName(user);
    const workspaces = workspaceService.getWorkspaces();
    
    // Find existing default workspace
    const defaultWorkspace = workspaces.find(w => w.id === 'default');
    
    if (defaultWorkspace) {
      // Update existing default workspace
      const updatedWorkspace = workspaceService.updateWorkspace('default', {
        name: userName,
        color: '#10B981', // Green color
        icon: '👤' // User icon
      });
      
      this.markUserWorkspaceAsCreated(user.uid);
      return updatedWorkspace;
    } else {
      // Create new default workspace (shouldn't happen, but just in case)
      const newWorkspace = workspaceService.createWorkspace({
        name: userName,
        color: '#10B981',
        icon: '👤'
      });
      
      this.markUserWorkspaceAsCreated(user.uid);
      return newWorkspace;
    }
  }

  /**
   * Initialize user workspace on first login
   */
  static initializeUserWorkspace(user: User): void {
    if (!this.hasUserWorkspaceBeenCreated(user.uid)) {
      console.log('Creating personalized workspace for user:', user.email);
      this.createOrUpdateUserWorkspace(user);
    }
  }
}

export const userWorkspaceService = new UserWorkspaceService();
