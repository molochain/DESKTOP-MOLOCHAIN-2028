import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  AlertCircle,
  Loader2,
  Settings,
  MessageSquare,
  Star,
  Zap,
  Rocket
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  personality?: string;
}

interface AIStatus {
  available: boolean;
  configured: boolean;
  requiresKey: boolean;
  model: string;
  personalities: string[];
}

const personalityIcons: Record<string, string> = {
  Molo: '🚀',
  Luna: '🌟', 
  Spark: '⚡'
};

const personalityColors: Record<string, string> = {
  Molo: 'bg-blue-500',
  Luna: 'bg-purple-500',
  Spark: 'bg-yellow-500'
};

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [personality, setPersonality] = useState<'Molo' | 'Luna' | 'Spark'>('Molo');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const { toast } = useToast();

  // Check AI status
  const { data: aiStatus } = useQuery<AIStatus>({
    queryKey: ['/api/ai-assistant/status'],
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          personality,
          context: location || 'dashboard', // Send as string instead of object
          contextId: 'main-session',
          previousMessages: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        personality
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error: any) => {
      setIsTyping(false);
      
      if (error?.requiresKey) {
        toast({
          title: "AI Assistant Not Configured",
          description: "Please add your OpenAI API key in Settings to enable the AI assistant.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to send message",
          description: error?.message || "Please try again later.",
          variant: "destructive"
        });
      }
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessage.mutate(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm ${personality} ${personalityIcons[personality]}, your AI assistant. I can help you navigate the platform, answer questions about your data, and provide guidance on using different features. How can I help you today?`,
        timestamp: new Date(),
        personality
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Update welcome message when personality changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm ${personality} ${personalityIcons[personality]}, your AI assistant. I can help you navigate the platform, answer questions about your data, and provide guidance on using different features. How can I help you today?`,
        timestamp: new Date(),
        personality
      };
      setMessages([welcomeMessage]);
    }
  }, [personality]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          
          {/* Personality Selector */}
          <Tabs value={personality} onValueChange={(v) => setPersonality(v as typeof personality)}>
            <TabsList className="grid w-[180px] grid-cols-3">
              <TabsTrigger value="Molo" className="text-xs">
                <Rocket className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="Luna" className="text-xs">
                <Star className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="Spark" className="text-xs">
                <Zap className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* AI Status */}
        {aiStatus && !aiStatus.configured && (
          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium">AI Assistant requires configuration</p>
              <p>Add your OpenAI API key in Settings to enable AI responses.</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-full ${personalityColors[message.personality || personality]} flex items-center justify-center text-white text-sm`}>
                    {personalityIcons[message.personality || personality]}
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className={`w-8 h-8 rounded-full ${personalityColors[personality]} flex items-center justify-center text-white text-sm`}>
                  {personalityIcons[personality]}
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1 items-center">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              size="icon"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setInput("What can you help me with?")}
              disabled={isTyping}
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Help
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setInput("Show me the system status")}
              disabled={isTyping}
            >
              <Activity className="h-3 w-3 mr-1" />
              Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setInput("Guide me through this page")}
              disabled={isTyping}
            >
              <Map className="h-3 w-3 mr-1" />
              Guide
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setInput("What are the latest updates?")}
              disabled={isTyping}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Updates
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Import missing icons
import { HelpCircle, Activity, Map } from 'lucide-react';