import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/auth";
import { Ship, Warehouse, Truck } from "lucide-react";

const industryGroups = [
  { name: "Global Shipping Alliance", icon: Ship },
  { name: "Supply Chain Professionals", icon: Warehouse },
  { name: "Logistics Leaders Network", icon: Truck },
];

export default function ProfileSidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* User Profile Card */}
      <Card className="overflow-hidden" data-testid="profile-sidebar-card">
        <div className="relative">
          <div className="h-20 bg-gradient-to-r from-molochain-blue to-molochain-accent"></div>
          <div className="absolute -bottom-8 left-4">
            <Avatar className="h-16 w-16 border-4 border-white">
              <AvatarImage src={user.profileImage || undefined} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="text-lg">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-10 pb-4 px-4">
          <h3 className="font-semibold text-molochain-text" data-testid="text-user-name">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-gray-600 mb-2" data-testid="text-user-title">
            {user.title} {user.company && `at ${user.company}`}
          </p>
          <p className="text-xs text-gray-500 mb-3" data-testid="text-user-location">
            {user.location} • {user.connections}+ connections
          </p>

          <div className="border-t pt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Profile views</span>
              <span className="text-molochain-blue font-medium" data-testid="text-profile-views">
                {user.profileViews}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Post impressions</span>
              <span className="text-molochain-blue font-medium" data-testid="text-post-impressions">
                {user.postImpressions}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Groups */}
      <Card data-testid="industry-groups-card">
        <CardContent className="p-4">
          <h4 className="font-semibold text-molochain-text mb-3">Industry Groups</h4>
          <div className="space-y-2">
            {industryGroups.map((group, index) => {
              const IconComponent = group.icon;
              return (
                <div key={index} className="flex items-center space-x-2 text-sm" data-testid={`industry-group-${index}`}>
                  <IconComponent className="h-4 w-4 text-molochain-orange" />
                  <span>{group.name}</span>
                </div>
              );
            })}
          </div>
          <Button variant="link" className="text-molochain-blue text-sm p-0 h-auto mt-3" data-testid="button-view-all-groups">
            View all groups (12)
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card data-testid="recent-activity-card">
        <CardContent className="p-4">
          <h4 className="font-semibold text-molochain-text mb-3">Recent Activity</h4>
          <p className="text-sm text-gray-600 mb-2">
            You shared a post about sustainable shipping practices
          </p>
          <p className="text-xs text-gray-500">2 hours ago • 15 reactions</p>
        </CardContent>
      </Card>
    </div>
  );
}
