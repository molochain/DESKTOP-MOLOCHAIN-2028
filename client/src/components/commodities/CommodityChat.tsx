import { useState, useEffect, useRef } from 'react';
import { Send, Users, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'system' | 'price_alert';
}

interface ChatUser {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface CommodityChatProps {
  commodityType: string;
  title: string;
}

// Simplified chat component without WebSocket dependencies
export default function CommodityChat({ commodityType, title }: CommodityChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [username, setUsername] = useState<string>('');
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Set a random username if none is provided
  useEffect(() => {
    if (!username) {
      const randomId = Math.floor(Math.random() * 1000);
      setUsername(`User${randomId}`);
    }
  }, [username]);

  // Automatically scroll to the bottom when new messages come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate initial messages and user activity
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'System',
        message: `Welcome to ${title} discussion room!`,
        timestamp: new Date(Date.now() - 300000),
        type: 'system'
      },
      {
        id: '2',
        username: 'TraderBot',
        message: `Current ${commodityType} market is showing positive trends`,
        timestamp: new Date(Date.now() - 180000),
        type: 'user'
      }
    ];

    const initialUsers: ChatUser[] = [
      { id: '1', username: 'TraderBot', isOnline: true },
      { id: '2', username: 'MarketAnalyst', isOnline: true },
      { id: '3', username: 'CommodityExpert', isOnline: false, lastSeen: new Date(Date.now() - 3600000) }
    ];

    setMessages(initialMessages);
    setOnlineUsers(initialUsers);
  }, [commodityType, title]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username,
      message: userInput.trim(),
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setUserInput('');

    // Simulate sending to server via REST API
    try {
      await fetch('/api/commodity-chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodityType,
          message: newMessage.message,
          username: newMessage.username
        })
      });
    } catch (error) {
      toast({
        title: "Message failed to send",
        description: "Your message couldn't be delivered. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-gray-600">
              Discussing {commodityType} market trends
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {onlineUsers.filter(u => u.isOnline).length} online
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-green-500" />
              <Badge variant="outline" className="text-green-600">
                Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col space-y-1 ${
                message.username === username ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.type === 'system'
                    ? 'bg-blue-100 text-blue-800 self-center text-center'
                    : message.username === username
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.type !== 'system' && (
                  <div className="text-xs opacity-70 mb-1">
                    {message.username}
                  </div>
                )}
                <div className="text-sm">{message.message}</div>
              </div>
              <div className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Online Users */}
      <div className="border-t border-b p-2 bg-gray-50">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <span className="text-sm text-gray-600 whitespace-nowrap">Online:</span>
          {onlineUsers.filter(user => user.isOnline).map((user) => (
            <Badge key={user.id} variant="secondary" className="whitespace-nowrap">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
              {user.username}
            </Badge>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Discuss ${commodityType} trends...`}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!userInput.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send • {username}
        </div>
      </div>
    </div>
  );
}