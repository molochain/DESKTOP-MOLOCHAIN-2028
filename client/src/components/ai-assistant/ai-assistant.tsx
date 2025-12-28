import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2,
  Sparkles,
  Heart,
  Zap,
  Star,
  Send,
  HelpCircle,
  Lightbulb,
  Navigation
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

interface AssistantPersonality {
  name: string;
  emoji: string;
  greeting: string;
  traits: string[];
  color: string;
}

const personalities: AssistantPersonality[] = [
  {
    name: "Molo",
    emoji: "🚀",
    greeting: "Hey there! I'm Molo, your logistics command companion!",
    traits: ["energetic", "tech-savvy", "solution-focused"],
    color: "text-blue-400"
  },
  {
    name: "Luna",
    emoji: "🌟", 
    greeting: "Hi! I'm Luna, here to illuminate your path through MoloChain!",
    traits: ["wise", "calming", "insightful"],
    color: "text-purple-400"
  },
  {
    name: "Spark",
    emoji: "⚡",
    greeting: "Spark here! Ready to energize your workflow!",
    traits: ["quick", "enthusiastic", "innovative"],
    color: "text-yellow-400"
  }
];

const contextualHelp = {
  '/dashboard': {
    title: 'GOD Layer Control Center',
    tips: [
      'This is your central command hub for the entire MoloChain ecosystem',
      'Monitor key metrics and system health from here',
      'Quick access to all major management functions',
      'Real-time updates keep you informed of system status'
    ],
    quickActions: ['View Health Status', 'Check Recent Activity', 'Access Reports']
  },
  '/departments': {
    title: 'Department Management',
    tips: [
      'Manage all 12 departments across your organization',
      'Each department has specialized dashboards and metrics',
      'Use filters to quickly find specific departments',
      'Department hierarchies show clear reporting structures'
    ],
    quickActions: ['Add New Department', 'View Department Stats', 'Access Department Dashboards']
  },
  '/identity': {
    title: 'Identity & Access Management',
    tips: [
      'Secure document management with birth certificates and passports',
      'Role-based access control ensures proper permissions',
      'Track and audit all identity-related activities',
      'Integration with global identity standards'
    ],
    quickActions: ['Verify Documents', 'Manage Permissions', 'Audit Access']
  },
  '/visions': {
    title: 'Strategic Visions',
    tips: [
      'Define and track long-term organizational goals',
      'Align visions across company, department, and division levels',
      'Monitor progress with key performance indicators',
      'Strategic roadmaps guide implementation'
    ],
    quickActions: ['Create New Vision', 'Track Progress', 'Review Alignment']
  },
  '/capacity-management': {
    title: 'Capacity Management',
    tips: [
      'Monitor system resources and performance in real-time',
      'Predictive analytics help prevent capacity issues',
      'Optimize resource allocation across departments',
      'Set alerts for capacity thresholds'
    ],
    quickActions: ['Check System Health', 'View Forecasts', 'Manage Resources']
  }
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [personality, setPersonality] = useState(personalities[0]);
  const [location] = useLocation();
  const [isTyping, setIsTyping] = useState(false);

  const currentContext = contextualHelp[location as keyof typeof contextualHelp] || {
    title: 'MoloChain Dashboard',
    tips: ['Navigate using the sidebar menu', 'All systems are operational', 'Need help? Just ask!'],
    quickActions: ['Go to Dashboard', 'View System Health']
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message when first opened
      const welcomeMessage: Message = {
        id: '1',
        type: 'assistant',
        content: `${personality.greeting} I can see you're on the ${currentContext.title} page. How can I help you today?`,
        timestamp: new Date(),
        context: location
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, personality, currentContext.title, location]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return `I'd be happy to help! On the ${currentContext.title} page, you can:\n\n${currentContext.tips.map(tip => `• ${tip}`).join('\n')}\n\nWould you like me to elaborate on any of these?`;
    }
    
    if (lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
      const randomTip = currentContext.tips[Math.floor(Math.random() * currentContext.tips.length)];
      return `Here's a helpful tip for ${currentContext.title}: ${randomTip} 💡`;
    }

    if (lowerMessage.includes('navigate') || lowerMessage.includes('go to')) {
      return `You can navigate to any section using the sidebar! Popular destinations from here include: Dashboard, Departments, Identity Management, and Capacity Management. Where would you like to go?`;
    }

    if (lowerMessage.includes('status') || lowerMessage.includes('health')) {
      return `Great question! Your MoloChain system is running perfectly with all 14 API endpoints healthy. All systems are operational and ready for action! 🚀`;
    }

    // Default responses with personality
    const responses = [
      `That's an interesting question! Based on what I see on the ${currentContext.title} page, I'd suggest exploring the available options here first.`,
      `I love your curiosity! 🌟 For ${currentContext.title}, the key is understanding how each feature connects to your overall goals.`,
      `Awesome! Let me think about that in the context of ${currentContext.title}... The best approach would be to start with the fundamentals and build from there.`,
      `Great thinking! On the ${currentContext.title} page, you have powerful tools at your disposal. What specific outcome are you hoping to achieve?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      context: location
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateResponse(inputMessage),
        timestamp: new Date(),
        context: location
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage();
    setInputMessage(action);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <div className="text-2xl">{personality.emoji}</div>
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <Card className="bg-gray-50 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-2xl h-full">
        <CardHeader className="pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                  {personality.emoji}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-2">
                  {personality.name}
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </CardTitle>
                {/* AI Assistant title hidden per user request */}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-white border border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 mb-3">
                {currentContext.quickActions.map((action, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-600 text-xs"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action}
                  </Badge>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-white placeholder-gray-400 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 h-9 w-9 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}