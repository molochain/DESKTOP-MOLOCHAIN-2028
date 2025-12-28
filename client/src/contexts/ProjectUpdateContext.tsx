import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProjectUpdate {
  id: string;
  projectId: string;
  type: 'milestone' | 'status' | 'comment' | 'document';
  title: string;
  description: string;
  timestamp: string;
  author: string;
  metadata?: any;
}

interface ProjectUpdateContextType {
  updates: ProjectUpdate[];
  isConnected: boolean;
  connectionState: {
    isConnecting: boolean;
    reconnectAttempts: number;
    maxAttempts: number;
    lastError?: string;
  };
  subscribeToProject: (projectId: string) => void;
  unsubscribeFromProject: (projectId: string) => void;
  addMilestoneUpdate: (projectId: string, milestone: any) => void;
  addComment: (projectId: string, comment: string) => void;
}

const ProjectUpdateContext = createContext<ProjectUpdateContextType | null>(null);

export function ProjectUpdateProvider({ children }: { children: React.ReactNode }) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [subscribedProjects, setSubscribedProjects] = useState<Set<string>>(new Set());
  const [connectionState, setConnectionState] = useState({
    isConnecting: false,
    reconnectAttempts: 0,
    maxAttempts: 5,
    lastError: undefined as string | undefined
  });
  const { toast } = useToast();

  // Polling-based update system instead of WebSocket
  const fetchProjectUpdates = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/updates`);
      if (response.ok) {
        const projectUpdates = await response.json();
        setUpdates(prev => {
          const filtered = prev.filter(u => u.projectId !== projectId);
          return [...filtered, ...projectUpdates];
        });
      }
    } catch (error) {
      // Handle fetch error silently in production
      if (import.meta.env.DEV) {
        console.debug('Failed to fetch project updates:', error);
      }
    }
  };

  const subscribeToProject = (projectId: string) => {
    setSubscribedProjects(prev => new Set([...prev, projectId]));
    fetchProjectUpdates(projectId);
  };

  const unsubscribeFromProject = (projectId: string) => {
    setSubscribedProjects(prev => {
      const newSet = new Set(prev);
      newSet.delete(projectId);
      return newSet;
    });
    setUpdates(prev => prev.filter(u => u.projectId !== projectId));
  };

  const addMilestoneUpdate = async (projectId: string, milestone: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone)
      });
      
      if (response.ok) {
        toast({ title: "Milestone added successfully" });
        fetchProjectUpdates(projectId);
      }
    } catch (error) {
      toast({ 
        title: "Failed to add milestone", 
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const addComment = async (projectId: string, comment: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      
      if (response.ok) {
        toast({ title: "Comment added successfully" });
        fetchProjectUpdates(projectId);
      }
    } catch (error) {
      toast({ 
        title: "Failed to add comment", 
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      subscribedProjects.forEach(projectId => {
        fetchProjectUpdates(projectId);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [subscribedProjects]);

  const value: ProjectUpdateContextType = {
    updates,
    isConnected: true, // Always connected since we're using REST API
    connectionState,
    subscribeToProject,
    unsubscribeFromProject,
    addMilestoneUpdate,
    addComment
  };

  return (
    <ProjectUpdateContext.Provider value={value}>
      {children}
    </ProjectUpdateContext.Provider>
  );
}

export function useProjectUpdates() {
  const context = useContext(ProjectUpdateContext);
  if (!context) {
    throw new Error('useProjectUpdates must be used within a ProjectUpdateProvider');
  }
  return context;
}