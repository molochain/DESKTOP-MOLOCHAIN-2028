import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import { Bell, UserPlus, Heart, MessageCircle, Briefcase, TrendingUp, Settings, Check, X } from "lucide-react";
import { Link } from "wouter";

interface Notification {
  id: string;
  type: 'connection' | 'like' | 'comment' | 'job' | 'post' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  userImage?: string;
  userName?: string;
}

const sampleNotifications: Notification[] = [
  {
    id: "notif1",
    type: "connection",
    title: "New Connection Request",
    description: "Emma Wilson wants to connect with you",
    timestamp: "2 hours ago",
    isRead: false,
    userImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face",
    userName: "Emma Wilson",
  },
  {
    id: "notif2",
    type: "like",
    title: "Your post was liked",
    description: "Sarah Chen and 5 others liked your post about supply chain innovations",
    timestamp: "5 hours ago",
    isRead: false,
    userImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    userName: "Sarah Chen",
  },
  {
    id: "notif3",
    type: "comment",
    title: "New comment on your post",
    description: "Mike Johnson commented: 'Great insights on freight forwarding!'",
    timestamp: "1 day ago",
    isRead: true,
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    userName: "Mike Johnson",
  },
  {
    id: "notif4",
    type: "job",
    title: "New job match",
    description: "Senior Supply Chain Manager position at Global Logistics Corp matches your profile",
    timestamp: "2 days ago",
    isRead: true,
    actionUrl: "/jobs",
  },
  {
    id: "notif5",
    type: "post",
    title: "Trending in your network",
    description: "Post about 'AI in Logistics' is gaining traction with 150+ engagements",
    timestamp: "3 days ago",
    isRead: true,
  },
  {
    id: "notif6",
    type: "system",
    title: "Profile views increased",
    description: "Your profile was viewed by 23 people this week, up 45% from last week",
    timestamp: "1 week ago",
    isRead: true,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notifId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (notifId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notifId));
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'connection':
        return <UserPlus className="h-5 w-5 text-molochain-blue" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'job':
        return <Briefcase className="h-5 w-5 text-purple-600" />;
      case 'post':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-molochain-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unread notifications</span>
                  <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
                    {unreadCount}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  data-testid="button-mark-all-read"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
                <div className="pt-4 border-t">
                  <Button variant="ghost" className="w-full justify-start" data-testid="button-settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Notification settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Notifications List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger 
                      value="all" 
                      onClick={() => setFilter('all')}
                      data-testid="tab-all"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger 
                      value="unread" 
                      onClick={() => setFilter('unread')}
                      data-testid="tab-unread"
                    >
                      Unread ({unreadCount})
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No {filter === 'unread' ? 'unread ' : ''}notifications</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors ${
                            !notification.isRead ? 'bg-blue-50/50 border-molochain-blue/20' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {notification.userImage ? (
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={notification.userImage} />
                                <AvatarFallback>
                                  {notification.userName?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                {getIcon(notification.type)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {notification.timestamp}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="h-2 w-2 bg-molochain-blue rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              {notification.type === 'connection' && (
                                <>
                                  <Button size="sm" className="bg-molochain-blue hover:bg-molochain-blue/90" data-testid={`button-accept-${notification.id}`}>
                                    Accept
                                  </Button>
                                  <Button size="sm" variant="outline" data-testid={`button-decline-${notification.id}`}>
                                    Decline
                                  </Button>
                                </>
                              )}
                              {notification.actionUrl && (
                                <Link href={notification.actionUrl}>
                                  <Button size="sm" variant="outline" data-testid={`button-view-${notification.id}`}>
                                    View
                                  </Button>
                                </Link>
                              )}
                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  data-testid={`button-mark-read-${notification.id}`}
                                >
                                  Mark as read
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                                className="ml-auto"
                                data-testid={`button-delete-${notification.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <MobileNav />
      <div className="md:hidden h-20"></div> {/* Spacer for mobile nav */}
    </div>
  );
}