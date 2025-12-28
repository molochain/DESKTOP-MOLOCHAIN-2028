import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import { UserPlus, Search, Building2, MapPin, Check, Clock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { apiRequest } from "../lib/queryClient";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

export default function Network() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: connections, isLoading: connectionsLoading } = useQuery<any[]>({
    queryKey: ["/api/connections"],
    enabled: isAuthenticated,
  });

  // Mutation for sending connection requests
  const connectMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      const response = await apiRequest("POST", "/api/connections", { receiverId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send connection request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions to check connection status
  const isConnected = (userId: string): boolean => {
    return connections?.some(conn => 
      (conn.requesterId === userId || conn.receiverId === userId) && 
      conn.status === 'accepted'
    ) || false;
  };

  const isPending = (userId: string): boolean => {
    return connections?.some(conn => 
      (conn.requesterId === userId || conn.receiverId === userId) && 
      conn.status === 'pending'
    ) || false;
  };

  const handleConnect = (userId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to send connection requests.",
        variant: "destructive",
      });
      return;
    }
    connectMutation.mutate(userId);
  };

  const filteredUsers = users?.filter(user => 
    user.id !== String(currentUser?.id) && (
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const connectedUsers = filteredUsers?.filter(user => isConnected(user.id));
  const pendingUsers = filteredUsers?.filter(user => isPending(user.id));
  const suggestedUsers = filteredUsers?.filter(user => !isConnected(user.id) && !isPending(user.id));

  return (
    <div className="min-h-screen bg-molochain-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Network Stats */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Network</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Connections</span>
                  <span className="font-semibold">{connectedUsers?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold">{pendingUsers?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Suggestions</span>
                  <span className="font-semibold">{suggestedUsers?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="font-semibold">{users?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Connections */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Manage Your Network</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search connections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-connections"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="connections" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="connections" data-testid="tab-connections">Connections</TabsTrigger>
                    <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
                    <TabsTrigger value="suggestions" data-testid="tab-suggestions">Suggestions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="connections" className="mt-6 space-y-4">
                    {usersLoading || connectionsLoading ? (
                      <div className="text-center py-8">Loading connections...</div>
                    ) : connectedUsers?.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No connections yet</p>
                        <p className="text-sm mt-2">Start connecting with logistics professionals to build your network</p>
                      </div>
                    ) : (
                      connectedUsers?.map((user) => (
                        <div key={user.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.profileImage || undefined} />
                            <AvatarFallback>
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{user.title}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              {user.company && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {user.company}
                                </span>
                              )}
                              {user.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {user.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-message-${user.id}`}>
                            <Check className="h-4 w-4 mr-1" />
                            Connected
                          </Button>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="pending" className="mt-6 space-y-4">
                    {usersLoading || connectionsLoading ? (
                      <div className="text-center py-8">Loading pending requests...</div>
                    ) : pendingUsers?.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No pending requests</p>
                        <p className="text-sm mt-2">Send connection requests to grow your network</p>
                      </div>
                    ) : (
                      pendingUsers?.map((user) => (
                        <div key={user.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.profileImage || undefined} />
                            <AvatarFallback>
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{user.title}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              {user.company && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {user.company}
                                </span>
                              )}
                              {user.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {user.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" disabled data-testid={`button-pending-${user.id}`}>
                            <Clock className="h-4 w-4 mr-1" />
                            Pending
                          </Button>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="suggestions" className="mt-6 space-y-4">
                    {usersLoading || connectionsLoading ? (
                      <div className="text-center py-8">Loading suggestions...</div>
                    ) : suggestedUsers?.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No suggestions available</p>
                        <p className="text-sm mt-2">You've connected with everyone available</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {suggestedUsers?.map((user) => (
                          <div key={user.id} className="p-4 border rounded-lg">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={user.profileImage || undefined} />
                                <AvatarFallback>
                                  {user.firstName[0]}{user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                                <p className="text-sm text-muted-foreground">{user.title}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  {user.company && (
                                    <span className="flex items-center gap-1">
                                      <Building2 className="h-3 w-3" />
                                      {user.company}
                                    </span>
                                  )}
                                  {user.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {user.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-molochain-blue hover:bg-molochain-blue/90" 
                                onClick={() => handleConnect(user.id)}
                                disabled={connectMutation.isPending}
                                data-testid={`button-connect-${user.id}`}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                {connectMutation.isPending ? 'Connecting...' : 'Connect'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
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