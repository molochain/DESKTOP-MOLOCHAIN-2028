import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import { 
  Search, 
  Building2, 
  MapPin, 
  UserPlus, 
  Filter,
  Briefcase,
  Globe,
  Users,
  Star,
  TrendingUp,
  Package
} from "lucide-react";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

export default function Explorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const { toast } = useToast();

  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch user's connections
  const { data: connections } = useQuery<any[]>({
    queryKey: ["/api/connections"],
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/connections/${userId}/request`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    if (!users) return { industries: [], specializations: [], locations: [] };
    
    const industries = Array.from(new Set(users.map(u => u.industry).filter(Boolean))) as string[];
    const specializations = Array.from(new Set(users.map(u => u.specialization).filter(Boolean))) as string[];
    const locations = Array.from(new Set(users.map(u => u.location).filter(Boolean))) as string[];
    
    return { industries, specializations, locations };
  }, [users]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    let filtered = users.filter(user => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.title?.toLowerCase().includes(searchLower) ||
        user.company?.toLowerCase().includes(searchLower) ||
        user.bio?.toLowerCase().includes(searchLower);
      
      // Industry filter
      const matchesIndustry = industryFilter === "all" || user.industry === industryFilter;
      
      // Specialization filter
      const matchesSpecialization = specializationFilter === "all" || user.specialization === specializationFilter;
      
      // Location filter
      const matchesLocation = locationFilter === "all" || user.location === locationFilter;
      
      return matchesSearch && matchesIndustry && matchesSpecialization && matchesLocation;
    });

    // Sort users
    switch (sortBy) {
      case "connections":
        filtered.sort((a, b) => (b.connections || 0) - (a.connections || 0));
        break;
      case "recent":
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "alphabetical":
        filtered.sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
        break;
      default: // relevance
        // Simple relevance: prioritize users with more complete profiles
        filtered.sort((a, b) => {
          const scoreA = [a.title, a.company, a.bio, a.industry, a.specialization].filter(Boolean).length;
          const scoreB = [b.title, b.company, b.bio, b.industry, b.specialization].filter(Boolean).length;
          return scoreB - scoreA;
        });
    }

    return filtered;
  }, [users, searchTerm, industryFilter, specializationFilter, locationFilter, sortBy]);

  // Check if already connected
  const isConnected = (userId: string) => {
    return connections?.some(conn => 
      (conn.requesterId === userId || conn.receiverId === userId) && 
      conn.status === "accepted"
    );
  };

  const isPending = (userId: string) => {
    return connections?.some(conn => 
      (conn.requesterId === userId || conn.receiverId === userId) && 
      conn.status === "pending"
    );
  };

  return (
    <div className="min-h-screen bg-molochain-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <Card className="mb-6 bg-gradient-to-r from-molochain-blue/10 to-molochain-orange/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Explore Logistics Professionals</h1>
                <p className="text-muted-foreground">
                  Discover and connect with supply chain experts, warehouse managers, and logistics specialists worldwide
                </p>
              </div>
              <Globe className="h-12 w-12 text-molochain-blue opacity-50" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Industry Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry</label>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger data-testid="select-industry-filter">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {filterOptions.industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Specialization Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Specialization</label>
                  <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                    <SelectTrigger data-testid="select-specialization-filter">
                      <SelectValue placeholder="All Specializations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {filterOptions.specializations.map(spec => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger data-testid="select-location-filter">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {filterOptions.locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-testid="select-sort-by">
                      <SelectValue placeholder="Relevance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="connections">Most Connected</SelectItem>
                      <SelectItem value="recent">Recently Joined</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Professionals</span>
                    <span className="font-semibold">{users?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Showing</span>
                    <span className="font-semibold">{filteredUsers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Popular Specializations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary" className="mr-2 mb-2">
                  <Package className="h-3 w-3 mr-1" />
                  Warehouse Management
                </Badge>
                <Badge variant="secondary" className="mr-2 mb-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Supply Chain Analytics
                </Badge>
                <Badge variant="secondary" className="mr-2 mb-2">
                  <Users className="h-3 w-3 mr-1" />
                  Freight Forwarding
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - User Grid */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, title, company, or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-professionals"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-molochain-blue mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading professionals...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-2">No professionals found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={user.profileImage || undefined} />
                          <AvatarFallback>
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate" data-testid={`text-name-${user.id}`}>
                                {user.firstName} {user.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {user.title}
                              </p>
                            </div>
                            {user.connections && user.connections > 100 && (
                              <Badge variant="outline" className="ml-2 shrink-0">
                                <Star className="h-3 w-3 mr-1" />
                                Top
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
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
                            {user.industry && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {user.industry}
                              </span>
                            )}
                          </div>

                          {user.specialization && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {user.specialization}
                              </Badge>
                            </div>
                          )}

                          {user.bio && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {user.bio}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-3">
                            {isConnected(user.id) ? (
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="w-full"
                                disabled
                                data-testid={`button-connected-${user.id}`}
                              >
                                Connected
                              </Button>
                            ) : isPending(user.id) ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                disabled
                                data-testid={`button-pending-${user.id}`}
                              >
                                Pending
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                className="w-full bg-molochain-blue hover:bg-molochain-blue/90"
                                onClick={() => connectMutation.mutate(user.id)}
                                disabled={connectMutation.isPending}
                                data-testid={`button-connect-${user.id}`}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}