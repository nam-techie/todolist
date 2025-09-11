import { Task } from '../types/Task';

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  completed: boolean;
  date: string; // YYYY-MM-DD format
  workspaceId?: string;
  taskId?: string;
}

export interface ForestTree {
  id: string;
  type: 'sapling' | 'young' | 'mature' | 'ancient';
  sessionId: string;
  plantedDate: string;
  duration: number;
}

export interface ForestStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  treesPlanted: number;
  forestLevel: number;
}

class FocusForestService {
  private readonly SESSIONS_KEY = 'focus_forest_sessions';
  private readonly STATS_KEY = 'focus_forest_stats';
  private readonly TREES_KEY = 'focus_forest_trees';

  // Session Management
  getSessions(): FocusSession[] {
    try {
      const sessions = localStorage.getItem(this.SESSIONS_KEY);
      if (!sessions) return [];
      
      const parsedSessions = JSON.parse(sessions);
      return parsedSessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime)
      }));
    } catch (error) {
      console.error('Error loading focus sessions:', error);
      return [];
    }
  }

  saveSession(session: Omit<FocusSession, 'id'>): FocusSession {
    const sessions = this.getSessions();
    const newSession: FocusSession = {
      ...session,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    
    sessions.push(newSession);
    this.saveSessions(sessions);
    
    // Update stats and plant tree if session was completed
    if (newSession.completed) {
      this.updateStats(newSession);
      this.plantTree(newSession);
    }
    
    return newSession;
  }

  private saveSessions(sessions: FocusSession[]): void {
    try {
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving focus sessions:', error);
    }
  }

  // Tree Management
  getTrees(): ForestTree[] {
    try {
      const trees = localStorage.getItem(this.TREES_KEY);
      return trees ? JSON.parse(trees) : [];
    } catch (error) {
      console.error('Error loading forest trees:', error);
      return [];
    }
  }

  private plantTree(session: FocusSession): ForestTree {
    const trees = this.getTrees();
    const treeType = this.getTreeType(session.duration);
    
    const newTree: ForestTree = {
      id: `tree_${session.id}`,
      type: treeType,
      sessionId: session.id,
      plantedDate: session.date,
      duration: session.duration
    };
    
    trees.push(newTree);
    this.saveTrees(trees);
    
    return newTree;
  }

  private getTreeType(duration: number): ForestTree['type'] {
    if (duration >= 120) return 'ancient';      // 2+ hours
    if (duration >= 60) return 'mature';        // 1+ hour
    if (duration >= 30) return 'young';         // 30+ minutes
    return 'sapling';                           // < 30 minutes
  }

  private saveTrees(trees: ForestTree[]): void {
    try {
      localStorage.setItem(this.TREES_KEY, JSON.stringify(trees));
    } catch (error) {
      console.error('Error saving forest trees:', error);
    }
  }

  // Stats Management
  getStats(): ForestStats {
    try {
      const stats = localStorage.getItem(this.STATS_KEY);
      if (!stats) {
        return {
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          treesPlanted: 0,
          forestLevel: 1
        };
      }
      return JSON.parse(stats);
    } catch (error) {
      console.error('Error loading forest stats:', error);
      return {
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        treesPlanted: 0,
        forestLevel: 1
      };
    }
  }

  private updateStats(session: FocusSession): void {
    const stats = this.getStats();
    const sessions = this.getSessions();
    
    // Update basic stats
    stats.totalSessions += 1;
    stats.totalMinutes += session.duration;
    stats.treesPlanted += 1;
    
    // Calculate streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const todaySessions = sessions.filter(s => s.date === today && s.completed);
    const yesterdaySessions = sessions.filter(s => s.date === yesterday && s.completed);
    
    if (todaySessions.length === 1) { // First session today
      if (yesterdaySessions.length > 0) {
        stats.currentStreak += 1;
      } else {
        stats.currentStreak = 1;
      }
    }
    
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
    
    // Calculate forest level (every 10 trees = 1 level)
    stats.forestLevel = Math.floor(stats.treesPlanted / 10) + 1;
    
    this.saveStats(stats);
  }

  private saveStats(stats: ForestStats): void {
    try {
      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving forest stats:', error);
    }
  }

  // Utility methods
  getSessionsForDate(date: string): FocusSession[] {
    return this.getSessions().filter(session => session.date === date);
  }

  getTreesForDate(date: string): ForestTree[] {
    return this.getTrees().filter(tree => tree.plantedDate === date);
  }

  getTodayStats(): { sessions: number; minutes: number; trees: number } {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = this.getSessionsForDate(today).filter(s => s.completed);
    const todayTrees = this.getTreesForDate(today);
    
    return {
      sessions: todaySessions.length,
      minutes: todaySessions.reduce((sum, session) => sum + session.duration, 0),
      trees: todayTrees.length
    };
  }

  getForestVisualization(): { [date: string]: ForestTree[] } {
    const trees = this.getTrees();
    const forestMap: { [date: string]: ForestTree[] } = {};
    
    trees.forEach(tree => {
      if (!forestMap[tree.plantedDate]) {
        forestMap[tree.plantedDate] = [];
      }
      forestMap[tree.plantedDate].push(tree);
    });
    
    return forestMap;
  }
}

export const focusForestService = new FocusForestService();

