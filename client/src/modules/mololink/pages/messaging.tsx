import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import { Search, Send, Paperclip, MoreVertical, Circle } from "lucide-react";
import { useAuth } from "../lib/auth";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantTitle: string;
  participantImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

const sampleConversations: Conversation[] = [
  {
    id: "conv1",
    participantId: "user2",
    participantName: "Sarah Chen",
    participantTitle: "Port Operations Director",
    participantImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    lastMessage: "Thanks for the update on the container shipment!",
    lastMessageTime: "10:30 AM",
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: "msg1",
        senderId: "user2",
        senderName: "Sarah Chen",
        senderImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
        content: "Hi John! I wanted to discuss the new port automation system we're implementing.",
        timestamp: "9:45 AM",
        isRead: true,
      },
      {
        id: "msg2",
        senderId: "user1",
        senderName: "You",
        content: "Hi Sarah! That sounds interesting. I'd love to hear more about it.",
        timestamp: "10:15 AM",
        isRead: true,
      },
      {
        id: "msg3",
        senderId: "user2",
        senderName: "Sarah Chen",
        senderImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
        content: "Great! We're seeing a 25% increase in throughput already.",
        timestamp: "10:28 AM",
        isRead: true,
      },
      {
        id: "msg4",
        senderId: "user2",
        senderName: "Sarah Chen",
        senderImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
        content: "Thanks for the update on the container shipment!",
        timestamp: "10:30 AM",
        isRead: false,
      },
    ],
  },
  {
    id: "conv2",
    participantId: "user3",
    participantName: "Mike Johnson",
    participantTitle: "Freight Forwarding Specialist",
    participantImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    lastMessage: "The customs clearance is complete",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: "msg5",
        senderId: "user3",
        senderName: "Mike Johnson",
        senderImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
        content: "The customs clearance is complete",
        timestamp: "Yesterday",
        isRead: true,
      },
    ],
  },
  {
    id: "conv3",
    participantId: "user4",
    participantName: "Emma Wilson",
    participantTitle: "Warehouse Operations Manager",
    participantImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face",
    lastMessage: "Can we schedule a call about inventory optimization?",
    lastMessageTime: "2 days ago",
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: "msg6",
        senderId: "user4",
        senderName: "Emma Wilson",
        senderImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face",
        content: "Can we schedule a call about inventory optimization?",
        timestamp: "2 days ago",
        isRead: false,
      },
    ],
  },
];

export default function Messaging() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(sampleConversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = sampleConversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    // In a real app, this would send to backend
    setMessageInput("");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-molochain-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="h-[calc(100vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="md:col-span-1 border-r h-full flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Messages</CardTitle>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-messages"
                  />
                </div>
              </CardHeader>
              <ScrollArea className="flex-1">
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                      data-testid={`conversation-${conversation.id}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.participantImage} />
                            <AvatarFallback>
                              {conversation.participantName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm truncate">{conversation.participantName}</p>
                              <p className="text-xs text-muted-foreground truncate">{conversation.participantTitle}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">{conversation.lastMessage}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-molochain-blue">{conversation.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col h-full">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.participantImage} />
                          <AvatarFallback>
                            {selectedConversation.participantName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedConversation.participantName}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedConversation.isOnline ? 'Active now' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" data-testid="button-more-options">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 'user1' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex space-x-2 max-w-[70%] ${message.senderId === 'user1' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {message.senderId !== 'user1' && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={message.senderImage} />
                                <AvatarFallback>
                                  {message.senderName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div
                                className={`rounded-lg p-3 ${
                                  message.senderId === 'user1'
                                    ? 'bg-molochain-blue text-white'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" data-testid="button-attach">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                        data-testid="input-message"
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-molochain-blue hover:bg-molochain-blue/90"
                        data-testid="button-send"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      <MobileNav />
      <div className="md:hidden h-20"></div> {/* Spacer for mobile nav */}
    </div>
  );
}