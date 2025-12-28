import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import SkillsSection from "../components/skills-section";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "../lib/auth";
import { MapPin, Building, Calendar, Users, Eye } from "lucide-react";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const profileId = id || currentUser?.id;

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users", profileId],
    enabled: !!profileId,
  });

  if (!currentUser) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-molochain-bg">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-molochain-blue to-molochain-accent"></div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                <div className="relative -mt-16 mb-4 md:mb-0">
                  <Skeleton className="h-32 w-32 rounded-full border-4 border-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-molochain-bg">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">User not found</h1>
              <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
        <MobileNav />
      </div>
    );
  }

  const isOwnProfile = currentUser.id === user.id;

  return (
    <div className="min-h-screen bg-molochain-bg">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-6" data-testid="profile-header-card">
          <div className="h-32 bg-gradient-to-r from-molochain-blue to-molochain-accent"></div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              <div className="relative -mt-16 mb-4 md:mb-0">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={user.profileImage || undefined} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-2xl">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-molochain-text mb-2" data-testid="text-user-name">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2" data-testid="text-user-title">
                    {user.title} {user.company && `at ${user.company}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {user.location && (
                      <div className="flex items-center gap-1" data-testid="text-user-location">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center gap-1" data-testid="text-user-company">
                        <Building className="h-4 w-4" />
                        {user.company}
                      </div>
                    )}
                    <div className="flex items-center gap-1" data-testid="text-user-connections">
                      <Users className="h-4 w-4" />
                      {user.connections} connections
                    </div>
                  </div>
                </div>
                
                {user.bio && (
                  <p className="text-gray-700 mb-4" data-testid="text-user-bio">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {user.industry && (
                    <Badge variant="secondary" className="bg-molochain-blue/10 text-molochain-blue">
                      {user.industry}
                    </Badge>
                  )}
                  {user.specialization && (
                    <Badge variant="secondary" className="bg-molochain-orange/10 text-molochain-orange">
                      {user.specialization}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-gray-600" data-testid="text-profile-views">
                    <Eye className="h-4 w-4" />
                    {user.profileViews} profile views
                  </div>
                  <div className="flex items-center gap-1 text-gray-600" data-testid="text-post-impressions">
                    <Calendar className="h-4 w-4" />
                    {user.postImpressions} post impressions
                  </div>
                </div>
              </div>
              
              {!isOwnProfile && (
                <div className="flex flex-col gap-2 mt-4 md:mt-0">
                  <Button className="bg-molochain-blue hover:bg-molochain-blue/90" data-testid="button-connect">
                    Connect
                  </Button>
                  <Button variant="outline" data-testid="button-message">
                    Message
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <SkillsSection userId={user.id} isOwnProfile={isOwnProfile} />

        {/* Activity and Posts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card data-testid="activity-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-molochain-text mb-4">Activity</h2>
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity to show</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card data-testid="about-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-molochain-text mb-4">About</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Industry:</span>
                    <span className="ml-2 text-gray-600">{user.industry || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Specialization:</span>
                    <span className="ml-2 text-gray-600">{user.specialization || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-600">{isOwnProfile ? user.email : "Private"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <MobileNav />
      <div className="md:hidden h-20"></div>
    </div>
  );
}
