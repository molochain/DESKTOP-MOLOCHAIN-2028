import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  Globe,
  BadgeCheck,
  UserPlus,
  UserMinus,
  Briefcase,
  ArrowLeft,
  Hash,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../lib/auth";
import { queryClient } from "../lib/queryClient";
import { apiRequest } from "../lib/queryClient";
import { format } from "date-fns";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

interface CompanyWithRelations extends Company {
  isFollowing?: boolean;
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

export default function CompanyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery<CompanyWithRelations>({
    queryKey: ["/api/companies/slug", slug],
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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
      }
      
      return companyData;
    },
    enabled: !!slug,
  });

  const { data: employees, isLoading: employeesLoading } = useQuery<CompanyEmployeeWithUser[]>({
    queryKey: ["/api/companies", company?.id, "employees"],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${company?.id}/employees`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
    enabled: !!company?.id,
  });

  const { data: posts, isLoading: postsLoading } = useQuery<CompanyPostWithAuthor[]>({
    queryKey: ["/api/companies", company?.id, "posts"],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${company?.id}/posts`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    enabled: !!company?.id,
  });

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

  if (companyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-48 w-full mb-8" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/companies">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </Link>

        {/* Cover Image */}
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 mb-6 animate-in fade-in duration-500">
          {company.coverImageUrl && (
            <img
              src={company.coverImageUrl}
              alt={`${company.name} cover image showcasing their facilities`}
              className="w-full h-full object-cover"
              data-testid={`img-company-cover-${company.id}`}
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Company Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-20 w-20 rounded-lg object-cover border-4 border-background -mt-12"
                data-testid={`img-company-logo-${company.id}`}
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center border-4 border-background -mt-12">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold" data-testid={`text-company-name-${company.id}`}>
                  {company.name}
                </h1>
                {company.verified && (
                  <BadgeCheck className="h-6 w-6 text-blue-500" />
                )}
              </div>
              {company.industry && (
                <Badge variant="secondary" className="mt-2">
                  {company.industry}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Button
                onClick={() => followMutation.mutate()}
                variant={company.isFollowing ? "outline" : "default"}
                disabled={followMutation.isPending}
                data-testid="button-follow-company"
              >
                {company.isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {company.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {company.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Overview</h3>
                      <p className="text-muted-foreground">{company.description}</p>
                    </div>
                  )}

                  {company.specialties && company.specialties.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {company.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {company.locations && company.locations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Locations</h3>
                      <div className="grid gap-2">
                        {company.locations.map((location, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{location}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              {postsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.author?.profileImage || undefined} />
                            <AvatarFallback>
                              {post.author?.firstName?.charAt(0)}
                              {post.author?.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {post.author?.firstName} {post.author?.lastName}
                              </span>
                              {post.postType && (
                                <Badge variant="outline" className="text-xs">
                                  {post.postType}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {post.author?.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {post.createdAt && format(new Date(post.createdAt), "PPP")}
                            </p>
                          </div>
                        </div>

                        <p className="mb-4 whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
                          {post.content}
                        </p>

                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.hashtags.map((tag, idx) => (
                              <span key={idx} className="text-sm text-blue-600 flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {tag.replace("#", "")}
                              </span>
                            ))}
                          </div>
                        )}

                        <Separator className="my-4" />

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <button className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <Share2 className="h-4 w-4" />
                            <span>{post.shares || 0}</span>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      This company hasn't shared any posts.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="employees" className="mt-6">
              {employeesLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ) : employees && employees.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Employees ({employees.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {employees.map((employee) => (
                        <Link
                          key={employee.id}
                          href={`/profile/${employee.user?.id}`}
                          data-testid={`link-employee-${employee.id}`}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={employee.user?.profileImage || undefined} />
                              <AvatarFallback>
                                {employee.user?.firstName?.charAt(0)}
                                {employee.user?.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">
                                {employee.user?.firstName} {employee.user?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {employee.title || employee.user?.title}
                              </p>
                              {employee.department && (
                                <p className="text-xs text-muted-foreground">
                                  {employee.department}
                                </p>
                              )}
                            </div>
                            {employee.isPrimary && (
                              <Badge variant="secondary" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No employees listed</h3>
                    <p className="text-muted-foreground">
                      No employees have been added to this company yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.type && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Company Type</p>
                    <p className="text-sm text-muted-foreground">{company.type}</p>
                  </div>
                </div>
              )}

              {company.size && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Company Size</p>
                    <p className="text-sm text-muted-foreground">{company.size} employees</p>
                  </div>
                </div>
              )}

              {company.founded && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Founded</p>
                    <p className="text-sm text-muted-foreground">{company.founded}</p>
                  </div>
                </div>
              )}

              {company.headquarters && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Headquarters</p>
                    <p className="text-sm text-muted-foreground">{company.headquarters}</p>
                  </div>
                </div>
              )}

              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                      data-testid="link-company-website"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold" data-testid={`text-follower-count-${company.id}`}>
                    {company.followerCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" data-testid={`text-employee-count-${company.id}`}>
                    {company.employeeCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}