import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EnhancedCodeEditor from "@/components/developer-portal/EnhancedCodeEditor";
import LiveCollaboration from "@/components/developer-portal/LiveCollaboration";
import { 
  Code, 
  Users, 
  MessageCircle, 
  Play, 
  Save, 
  Share2, 
  Settings, 
  Eye,
  EyeOff,
  Download,
  Upload,
  GitBranch,
  Terminal,
  FileText,
  Plus,
  X,
  Send,
  Maximize2,
  Minimize2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Types for collaboration workspace
interface WorkspaceUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  cursor?: {
    line: number;
    column: number;
    color: string;
  };
}

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  lastModified: string;
  modifiedBy: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'code_share';
}

interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  files: CodeFile[];
  collaborators: WorkspaceUser[];
  createdAt: string;
  updatedAt: string;
}

export default function DeveloperWorkspace() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showCollaborators, setShowCollaborators] = useState(true);

  // WebSocket connection for real-time collaboration
  const wsRef = useRef<WebSocket | null>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Fetch workspace projects
  const { data: projects, isLoading } = useQuery<WorkspaceProject[]>({
    queryKey: ['/api/collaboration/workspace/projects'],
    queryFn: async () => {
      const response = await fetch('/api/collaboration/workspace/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  // Create new project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description: string }) => {
      const response = await fetch('/api/collaboration/workspace/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/workspace/projects'] });
      toast({
        title: "Project Created",
        description: "New collaboration project has been created successfully.",
      });
    },
  });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async ({ projectId, fileId, content }: { projectId: string; fileId: string; content: string }) => {
      const response = await fetch(`/api/collaboration/workspace/projects/${projectId}/files/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to save file');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Saved",
        description: "Your changes have been saved successfully.",
      });
    },
  });

  // WebSocket setup for real-time collaboration
  useEffect(() => {
    const connectWebSocket = () => {
      if (!activeProject || !user) return;

      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/developer-workspace`;
      
      try {
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          reconnectAttemptsRef.current = 0;
          wsRef.current?.send(JSON.stringify({
            type: 'join_workspace',
            projectId: activeProject,
            userId: user.email || 'anonymous',
            userName: user.email || 'Anonymous User',
          }));
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (error) {
            // Handle error silently
          }
        };

        wsRef.current.onerror = (error) => {
          // Handle error silently
        };

        wsRef.current.onclose = () => {
          
          // Only attempt to reconnect if we haven't exceeded max attempts
          if (reconnectAttemptsRef.current < maxReconnectAttempts && activeProject && user) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Exponential backoff
            // Attempting to reconnect
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
          }
        };
      } catch (error) {
        // Handle connection error silently
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [activeProject, user]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'code_change':
        if (data.fileId === activeFile && data.userId !== user?.id) {
          setCode(data.content);
        }
        break;
      case 'cursor_position':
        // Update cursor positions for other users
        queryClient.setQueryData(['/api/collaboration/workspace/projects'], (oldData: WorkspaceProject[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(project => {
            if (project.id === activeProject) {
              return {
                ...project,
                collaborators: project.collaborators.map(collaborator => {
                  if (collaborator.id === data.userId) {
                    return {
                      ...collaborator,
                      cursor: data.cursor
                    };
                  }
                  return collaborator;
                })
              };
            }
            return project;
          });
        });
        break;
      case 'chat_message':
        setChatMessages(prev => [...prev, data.message]);
        break;
      case 'user_joined':
        toast({
          title: "User Joined",
          description: `${data.userName} joined the workspace.`,
        });
        break;
      case 'user_left':
        toast({
          title: "User Left",
          description: `${data.userName} left the workspace.`,
        });
        break;
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    
    // Send real-time updates via WebSocket
    if (wsRef.current && activeProject && activeFile) {
      wsRef.current.send(JSON.stringify({
        type: 'code_change',
        projectId: activeProject,
        fileId: activeFile,
        content: value,
        userId: user?.email || 'anonymous',
      }));
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && wsRef.current && activeProject) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: user?.email || '',
        userName: user?.email || 'Anonymous',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'message',
      };

      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        projectId: activeProject,
        message,
      }));

      setChatMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const currentProject = projects?.find(p => p.id === activeProject);
  const currentFile = currentProject?.files.find(f => f.id === activeFile);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''} container mx-auto p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Developer Workspace</h1>
          <p className="text-muted-foreground">Real-time collaborative development environment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCollaborators(!showCollaborators)}
          >
            <Users className="h-4 w-4 mr-2" />
            {showCollaborators ? 'Hide Users' : 'Show Users'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Project Sidebar */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Projects
                <Button size="sm" onClick={() => {
                  const name = prompt("Project name:");
                  const description = prompt("Project description:");
                  if (name && description) {
                    createProjectMutation.mutate({ name, description });
                  }
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {projects?.map((project) => (
                    <div
                      key={project.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        activeProject === project.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                      }`}
                      onClick={() => setActiveProject(project.id)}
                    >
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">{project.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{project.files.length} files</Badge>
                        <Badge variant="outline">{project.collaborators.length} users</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* File Explorer */}
              {currentProject && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Files</h4>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1">
                      {currentProject.files.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            activeFile === file.id ? 'bg-primary/10' : 'hover:bg-muted'
                          }`}
                          onClick={() => {
                            setActiveFile(file.id);
                            setCode(file.content);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Code Editor */}
        <div className={`${showChat && showCollaborators ? 'col-span-6' : showChat || showCollaborators ? 'col-span-7' : 'col-span-9'}`}>
          {currentFile ? (
            <EnhancedCodeEditor
              file={currentFile}
              onSave={(content: string) => {
                if (activeProject && activeFile) {
                  saveFileMutation.mutate({
                    projectId: activeProject,
                    fileId: activeFile,
                    content,
                  });
                }
              }}
              onRun={(code: string) => {
                // Handle code execution - send to WebSocket for server execution
                if (wsRef.current && activeProject) {
                  wsRef.current.send(JSON.stringify({
                    type: 'code_execution',
                    projectId: activeProject,
                    fileId: activeFile,
                    code,
                    language: currentFile.language,
                    userId: user?.email || 'anonymous',
                  }));
                }
              }}
              className="h-full"
            />
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a file to start coding</h3>
                  <p className="text-muted-foreground">Choose a project and file from the sidebar to begin collaborative development</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar for Chat and Collaborators */}
        <div className={`${showChat && showCollaborators ? 'col-span-3' : showChat || showCollaborators ? 'col-span-2' : 'hidden'}`}>
          <div className="space-y-6">
            {/* Collaborators */}
            {showCollaborators && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Collaborators ({currentProject?.collaborators.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {currentProject?.collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{collaborator.name}</div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                collaborator.status === 'online' ? 'bg-green-500' :
                                collaborator.status === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="text-xs text-muted-foreground capitalize">
                                {collaborator.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            {showChat && (
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex flex-col">
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-3">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{message.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm bg-muted p-2 rounded">{message.message}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button size="sm" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}