import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Building2, Briefcase, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../lib/auth";
import { queryClient } from "../lib/queryClient";
import { apiRequest } from "../lib/queryClient";
import { 
  CompanyHeader,
  CompanyAbout,
  CompanyMetrics,
  CompanyPosts,
  CompanyEmployees,
  CompanyProfileEditor
} from "@/components/company";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

interface CompanyWithRelations extends Company {
  isFollowing?: boolean;
  isAdmin?: boolean;
}

interface CompanyEmployeeWithUser extends CompanyEmployee {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    title: string | null;
    profileImage: string | null;
  } | null;
}

interface CompanyPostWithAuthor extends CompanyPost {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    title: string | null;
    profileImage: string | null;
  } | null;
}

interface CompanyJob {
  id: string;
  companyId: string;
  title: string;
  department: string;
  location: string;
  type: string; // Full-time, Part-time, Contract
  level: string; // Entry, Mid, Senior
  description: string;
  requirements: string[];
  createdAt: Date;
}

export default function CompanyProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch company data
  const { data: company, isLoading: companyLoading } = useQuery<CompanyWithRelations>({
    queryKey: ["/api/companies/slug", slug],
    queryFn: async () => {
      const response = await fetch(`/api/companies/slug/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch company");
      const companyData = await response.json();
      
      // Check if user is following
      if (user) {
        const followingResponse = await fetch(`/api/users/${user.id}/following-companies`);
        if (followingResponse.ok) {
          const followingCompanies = await followingResponse.json();
          companyData.isFollowing = followingCompanies.some(
            (f: any) => f.companyId === companyData.id
          );
        }
        
        // Check if user is admin
        const adminsResponse = await fetch(`/api/companies/${companyData.id}/admins`);
        if (adminsResponse.ok) {
          const admins = await adminsResponse.json();
          companyData.isAdmin = admins.some((a: any) => a.userId === user.id);
        }
      }
      
      return companyData;
    },
    enabled: !!slug,
  });

  // Fetch employees
  const { data: employees, isLoading: employeesLoading } = useQuery<CompanyEmployeeWithUser[]>({
    queryKey: ["/api/companies", company?.id, "employees"],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${company?.id}/employees`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
    enabled: !!company?.id,
  });

  // Fetch posts
  const { data: posts, isLoading: postsLoading } = useQuery<CompanyPostWithAuthor[]>({
    queryKey: ["/api/companies", company?.id, "posts"],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${company?.id}/posts`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    enabled: !!company?.id,
  });

  // Fetch jobs (mock data for now)
  const { data: jobs } = useQuery<CompanyJob[]>({
    queryKey: ["/api/companies", company?.id, "jobs"],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          id: "job1",
          companyId: company?.id || "",
          title: "Senior Logistics Manager",
          department: "Operations",
          location: "San Francisco, CA",
          type: "Full-time",
          level: "Senior",
          description: "Lead our logistics operations team...",
          requirements: ["5+ years experience", "MBA preferred"],
          createdAt: new Date(),
        },
        {
          id: "job2",
          companyId: company?.id || "",
          title: "Supply Chain Analyst",
          department: "Analytics",
          location: "Remote",
          type: "Full-time",
          level: "Mid",
          description: "Analyze and optimize supply chain processes...",
          requirements: ["3+ years experience", "SQL knowledge"],
          createdAt: new Date(),
        },
      ];
    },
    enabled: !!company?.id,
  });

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !company) throw new Error("Not authenticated");
      
      const url = `/api/companies/${company.id}/follow`;
      const method = company.isFollowing ? "DELETE" : "POST";
      
      return apiRequest(url, method, { userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies/slug", slug] });
      toast({
        title: company?.isFollowing ? "Unfollowed" : "Following",
        description: company?.isFollowing
          ? `You are no longer following ${company?.name}`
          : `You are now following ${company?.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: Partial<Company>) => {
      if (!company) throw new Error("No company data");
      
      return apiRequest(`/api/companies/${company.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies/slug", slug] });
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update company profile",
        variant: "destructive",
      });
    },
  });

  // Connect with employee mutation
  const connectMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      return apiRequest("/api/connections", "POST", {
        requesterId: user.id,
        receiverId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    },
  });

  // Calculate metrics
  const postCount = posts?.length || 0;
  const jobCount = jobs?.length || 0;
  const engagementRate = posts && posts.length > 0
    ? posts.reduce((sum, post) => sum + (post.likes || 0) + (post.comments || 0) + (post.shares || 0), 0) / posts.length
    : 0;

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-molochain-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-80 bg-gray-200 rounded-lg mb-8" />
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg" />
              </div>
              <div>
                <div className="h-64 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-molochain-bg">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Company not found</h3>
              <p className="text-muted-foreground mb-4">
                The company you're looking for doesn't exist.
              </p>
              <Link href="/companies">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Companies
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-molochain-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/companies">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </Link>

        {/* Company Header */}
        <CompanyHeader
          company={company}
          isFollowing={company.isFollowing}
          isAdmin={company.isAdmin}
          onFollow={() => followMutation.mutate()}
          onEdit={() => setIsEditDialogOpen(true)}
        />

        {/* Metrics */}
        <div className="mt-8 mb-8">
          <CompanyMetrics
            company={company}
            postCount={postCount}
            jobCount={jobCount}
            engagementRate={engagementRate}
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="employees">People</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <CompanyAbout company={company} />
              </TabsContent>

              <TabsContent value="posts" className="mt-6">
                <CompanyPosts
                  posts={posts || []}
                  isLoading={postsLoading}
                  onLike={(postId) => {
                    toast({
                      title: "Post liked",
                      description: "Your interaction has been recorded",
                    });
                  }}
                  onComment={(postId) => {
                    toast({
                      title: "Comment section",
                      description: "Comment functionality is being prepared",
                    });
                  }}
                  onShare={(postId) => {
                    toast({
                      title: "Share post",
                      description: "Post link copied to clipboard",
                    });
                    navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
                  }}
                />
              </TabsContent>

              <TabsContent value="employees" className="mt-6">
                <CompanyEmployees
                  employees={employees || []}
                  isLoading={employeesLoading}
                  onConnect={(userId) => connectMutation.mutate(userId)}
                />
              </TabsContent>

              <TabsContent value="jobs" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Open Positions ({jobCount})
                      </h3>
                    </div>
                    
                    {jobs && jobs.length > 0 ? (
                      <div className="space-y-4">
                        {jobs.map((job) => (
                          <div
                            key={job.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            data-testid={`card-job-${job.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-lg">{job.title}</h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span>{job.department}</span>
                                  <span>•</span>
                                  <span>{job.location}</span>
                                  <span>•</span>
                                  <span>{job.type}</span>
                                </div>
                                <p className="mt-2 text-sm">{job.description}</p>
                              </div>
                              <Button size="sm">Apply</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No open positions at this time</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Growth Insights */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Growth Insights
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry Rank</span>
                    <span className="font-medium">#12 in {company.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Growth Rate</span>
                    <span className="font-medium text-green-500">+15% YoY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Presence</span>
                    <span className="font-medium">Global</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Companies */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Similar Companies</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">LogiTech Solutions</div>
                      <div className="text-xs text-muted-foreground">Logistics</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">SupplyChain Pro</div>
                      <div className="text-xs text-muted-foreground">Supply Chain</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        {company.isAdmin && (
          <CompanyProfileEditor
            company={company}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={async (data) => {
              await updateCompanyMutation.mutateAsync(data);
            }}
          />
        )}
      </div>
    </div>
  );
}