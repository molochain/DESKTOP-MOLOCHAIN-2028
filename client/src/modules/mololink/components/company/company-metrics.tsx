import { TrendingUp, TrendingDown, Users, Eye, Building2, Activity, Briefcase, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

interface CompanyMetricsProps {
  company: Company;
  postCount?: number;
  jobCount?: number;
  engagementRate?: number;
}

export function CompanyMetrics({ 
  company, 
  postCount = 0,
  jobCount = 0,
  engagementRate = 0
}: CompanyMetricsProps) {
  const growthRate = 15; // Example growth rate
  const industryAvgSize = 500; // Example industry average
  const sizeComparison = company.employeeCount ? (company.employeeCount / industryAvgSize) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Employee Growth */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employee Growth</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{company.employeeCount || 0}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {growthRate > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+{growthRate}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-red-500">{growthRate}%</span>
              </>
            )}
            <span className="ml-1">from last year</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-molochain-primary transition-all"
              style={{ width: `${Math.min(sizeComparison, 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {sizeComparison > 100 ? 'Above' : 'Below'} industry average
          </div>
        </CardContent>
      </Card>

      {/* Follower Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Followers</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{company.followerCount || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Active community members
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Activity className="h-3 w-3 text-molochain-primary" />
            <span className="text-xs">High engagement</span>
          </div>
        </CardContent>
      </Card>

      {/* Content Published */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Content Published</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{postCount}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Posts & updates
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-molochain-primary font-medium">
              {engagementRate.toFixed(1)}% engagement rate
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{jobCount}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Active job openings
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-green-500 font-medium">
              Actively hiring
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}