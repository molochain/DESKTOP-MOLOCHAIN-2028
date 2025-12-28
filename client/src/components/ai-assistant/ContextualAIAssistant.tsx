import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, MessageSquare, Lightbulb, Target, TrendingUp, Send, Bot, User, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  messageType: string;
  createdAt: string;
  metadata?: any;
}

interface Conversation {
  id: number;
  title?: string;
  context: string;
  contextId?: string;
  isActive: boolean;
  createdAt: string;
}

interface Insight {
  id: number;
  missionId: string;
  insightType: 'risk' | 'opportunity' | 'performance' | 'prediction';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  status: 'active' | 'addressed' | 'dismissed';
  createdAt: string;
}

interface Recommendation {
  id: number;
  type: 'optimization' | 'resource_allocation' | 'timeline' | 'budget';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  createdAt: string;
}

interface ContextualAIAssistantProps {
  context: string;
  contextId?: string;
  missionId?: string;
}

export function ContextualAIAssistant({ context, contextId, missionId }: ContextualAIAssistantProps) {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch conversations for this context
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/ai/conversations', context, contextId],
    queryFn: () => fetch(`/api/ai/conversations?context=${context}&contextId=${contextId || ''}`).then(res => res.json())
  });

  // Fetch messages for current conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/ai/conversations', currentConversation?.id, 'messages'],
    queryFn: () => currentConversation 
      ? fetch(`/api/ai/conversations/${currentConversation.id}/messages`).then(res => res.json())
      : Promise.resolve([]),
    enabled: !!currentConversation
  });

  // Fetch mission insights
  const { data: insights = [] } = useQuery({
    queryKey: ['/api/ai/insights/mission', missionId],
    queryFn: () => missionId 
      ? fetch(`/api/ai/insights/mission/${missionId}`).then(res => res.json())
      : Promise.resolve([]),
    enabled: !!missionId
  });

  // Fetch recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/ai/recommendations', context, contextId],
    queryFn: () => fetch(`/api/ai/recommendations?context=${context}&contextId=${contextId || ''}`).then(res => res.json())
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: (data: any) => fetch('/api/ai/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/recommendations'] });
    }
  });

  // Update insight status mutation
  const updateInsightMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      fetch(`/api/ai/insights/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/insights'] });
    }
  });

  // Update recommendation status mutation
  const updateRecommendationMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      fetch(`/api/ai/recommendations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/recommendations'] });
    }
  });

  // Create conversation if none exists
  useEffect(() => {
    if (conversations.length === 0 && !currentConversation) {
      const title = missionId ? `Mission ${missionId} Analysis` : `${context} Discussion`;
      createConversationMutation.mutate({
        sessionId: `session-${Date.now()}`,
        context,
        contextId,
        title
      });
    } else if (conversations.length > 0 && !currentConversation) {
      setCurrentConversation(conversations[0]);
    }
  }, [conversations, currentConversation, context, contextId, missionId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversation || sendMessageMutation.isPending) return;

    const userMessage = message;
    setMessage('');
    setIsTyping(true);

    try {
      await sendMessageMutation.mutateAsync({
        message: userMessage,
        conversationId: currentConversation.id,
        context,
        contextId: contextId || missionId
      });
    } catch (error) {
// REMOVED: console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'performance': return <Target className="h-4 w-4 text-blue-500" />;
      case 'prediction': return <Brain className="h-4 w-4 text-purple-500" />;
      default: return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Mission Insights</h2>
          <p className="text-gray-600 dark:text-gray-400">Contextual intelligence for {context}</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations ({recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                AI Assistant
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Ask questions about your mission, get insights, and receive recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-96 w-full border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="space-y-4">
                  {messages.map((msg: Message) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          {msg.role === 'user' ? <User className="h-4 w-4 text-gray-900 dark:text-white" /> : <Bot className="h-4 w-4 text-blue-400" />}
                        </div>
                        <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-white'}`}>
                          <p className="text-sm">{msg.content}</p>
                          {msg.messageType !== 'text' && (
                            <Badge variant="secondary" className="mt-2">
                              {msg.messageType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                        <Bot className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about mission progress, risks, or get recommendations..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-white flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="space-y-4">
            {insights.map((insight: Insight) => (
              <Card key={insight.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getInsightIcon(insight.insightType)}
                      <div>
                        <CardTitle className="text-gray-900 dark:text-white text-lg">{insight.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getSeverityColor(insight.severity)}>{insight.severity}</Badge>
                          <Badge variant="outline">{insight.insightType}</Badge>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Confidence: {Math.round((insight.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateInsightMutation.mutate({ id: insight.id, status: 'addressed' })}
                        disabled={insight.status === 'addressed'}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        {insight.status === 'addressed' ? <CheckCircle2 className="h-4 w-4" /> : 'Mark Addressed'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{insight.description}</p>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Created: {new Date(insight.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            {insights.length === 0 && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No insights available yet. Start chatting to generate insights!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <div className="space-y-4">
            {recommendations.map((rec: Recommendation) => (
              <Card key={rec.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white text-lg">{rec.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{rec.type}</Badge>
                        <Badge variant={rec.impact === 'high' ? 'default' : 'secondary'}>
                          Impact: {rec.impact}
                        </Badge>
                        <Badge variant={rec.effort === 'low' ? 'default' : 'secondary'}>
                          Effort: {rec.effort}
                        </Badge>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Priority: {rec.priority}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRecommendationMutation.mutate({ id: rec.id, status: 'accepted' })}
                        disabled={rec.status !== 'pending'}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRecommendationMutation.mutate({ id: rec.id, status: 'rejected' })}
                        disabled={rec.status !== 'pending'}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{rec.description}</p>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Created: {new Date(rec.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            {recommendations.length === 0 && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No recommendations yet. Continue using the AI assistant to get personalized suggestions!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <div className="grid gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Mission Analysis Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Active Insights</span>
                      <Badge variant="default">{insights.filter((i: Insight) => i.status === 'active').length}</Badge>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Pending Recommendations</span>
                      <Badge variant="default">{recommendations.filter((r: Recommendation) => r.status === 'pending').length}</Badge>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Critical Risks</span>
                      <Badge variant="destructive">{insights.filter((i: Insight) => i.severity === 'critical').length}</Badge>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">High Impact Opportunities</span>
                      <Badge variant="default">{recommendations.filter((r: Recommendation) => r.impact === 'high').length}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}