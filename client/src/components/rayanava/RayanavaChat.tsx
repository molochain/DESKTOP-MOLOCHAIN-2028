import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, Sparkles, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'rayanava';
  content: string;
  timestamp: Date;
  emotion?: string;
}

export function RayanavaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [rayanavaStatus, setRayanavaStatus] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchRayanavaStatus = async () => {
    try {
      const response = await fetch('/api/rayanava/status');
      const data = await response.json();
      if (data.success) {
        setRayanavaStatus(data.data);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch Rayanava status:', error);
      }
    }
  };

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/me');
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  // Fetch Rayanava's status and check auth on component mount
  useEffect(() => {
    fetchRayanavaStatus();
    checkAuthentication();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Check authentication first
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to chat with Rayanava AI",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const currentInput = input; // Capture input before clearing
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/rayanava/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput, // Use captured input
          context: { history: [...messages, userMessage] } // Include current message in history
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue chatting",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Connection Error",
            description: data.error || "Unable to reach Rayanava AI. Please try again.",
            variant: "destructive"
          });
        }
        // Remove the user message on error
        setMessages(prev => prev.slice(0, -1));
      } else if (data.success) {
        const rayanavaMessage: Message = {
          role: 'rayanava',
          content: data.data.response,
          timestamp: new Date(),
          emotion: data.data.emotion
        };
        setMessages(prev => [...prev, rayanavaMessage]);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to get response from Rayanava",
          variant: "destructive"
        });
        // Remove the user message on error
        setMessages(prev => prev.slice(0, -1));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error communicating with Rayanava:', error);
      }
      toast({
        title: "Connection Error",
        description: "Could not connect to Rayanava AI. Please check your connection and try again.",
        variant: "destructive"
      });
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto" data-testid="rayanava-chat-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle>Rayanava AI Assistant</CardTitle>
          </div>
          {rayanavaStatus && (
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {rayanavaStatus.status}
            </Badge>
          )}
        </div>
        <CardDescription>
          An independent AI character with comprehensive automation and analysis capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Capabilities Display */}
        {rayanavaStatus && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Capabilities</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {rayanavaStatus.capabilities?.slice(0, 5).map((capability: string, index: number) => (
                <Badge key={index} variant="secondary" data-testid={`capability-${index}`}>
                  {capability}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea className="h-[400px] w-full pr-4" data-testid="chat-messages">
          <div className="space-y-4">
            {!isAuthenticated ? (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Authentication Required</p>
                <p className="text-sm mt-2">Please sign in to start chatting with Rayanava AI</p>
                <Button 
                  className="mt-4" 
                  onClick={() => window.location.href = '/auth/signin'}
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with Rayanava</p>
                <p className="text-sm mt-2">Ask about automation, analysis, or any business intelligence needs</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${index}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === 'rayanava' && <Bot className="h-4 w-4" />}
                      <span className="text-xs font-medium">
                        {message.role === 'user' ? 'You' : 'Rayanava'}
                      </span>
                      {message.emotion && (
                        <Badge variant="outline" className="text-xs">
                          {message.emotion}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Rayanava is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask Rayanava anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
            disabled={loading}
            data-testid="input-message"
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim() || !isAuthenticated}
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}