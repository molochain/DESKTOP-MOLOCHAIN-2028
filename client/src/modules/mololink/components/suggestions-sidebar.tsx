import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

const industryNews = [
  {
    title: "Global shipping rates stabilize amid supply chain recovery",
    time: "2 hours ago",
    readers: "1,234 readers",
    color: "border-molochain-orange",
  },
  {
    title: "AI-powered logistics platforms see 40% growth",
    time: "4 hours ago",
    readers: "892 readers",
    color: "border-molochain-blue",
  },
  {
    title: "Sustainable shipping initiatives drive industry transformation",
    time: "6 hours ago",
    readers: "567 readers",
    color: "border-molochain-success",
  },
  {
    title: "Port automation projects accelerate globally",
    time: "8 hours ago",
    readers: "1,156 readers",
    color: "border-molochain-orange",
  },
];

const trendingHashtags = [
  { tag: "#SupplyChainInnovation", posts: "2.3k" },
  { tag: "#LogisticsTech", posts: "1.8k" },
  { tag: "#FreightForwarding", posts: "1.2k" },
  { tag: "#GreenShipping", posts: "956" },
  { tag: "#PortOperations", posts: "743" },
];

export default function SuggestionsSidebar() {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    select: (data) => data?.slice(1, 4) || [], // Get first 3 users excluding current user
  });

  return (
    <div className="space-y-4">
      {/* Add to Feed */}
      <Card data-testid="suggestions-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-molochain-text">Add to your feed</h4>
            <Info className="h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-3">
            {users?.map((user, index) => (
              <div key={user.id} className="flex items-start space-x-3" data-testid={`suggestion-${index}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profileImage || undefined} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm text-molochain-text truncate">
                    {user.firstName} {user.lastName}
                  </h5>
                  <p className="text-xs text-gray-600 truncate">
                    {user.title} {user.company && `at ${user.company}`}
                  </p>
                  <Button variant="link" className="text-molochain-blue text-xs p-0 h-auto mt-1" data-testid={`button-follow-${index}`}>
                    + Follow
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="link" className="text-molochain-blue text-sm p-0 h-auto mt-3" data-testid="button-view-recommendations">
            View all recommendations
          </Button>
        </CardContent>
      </Card>

      {/* Industry News */}
      <Card data-testid="industry-news-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-molochain-text">Today's Industry News</h4>
            <Info className="h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-3">
            {industryNews.map((news, index) => (
              <div key={index} className={`border-l-2 pl-3 ${news.color}`} data-testid={`news-item-${index}`}>
                <p className="text-sm font-medium text-molochain-text">{news.title}</p>
                <p className="text-xs text-gray-500 mt-1">{news.time} • {news.readers}</p>
              </div>
            ))}
          </div>

          <Button variant="link" className="text-molochain-blue text-sm p-0 h-auto mt-3" data-testid="button-show-more-news">
            Show more
          </Button>
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      <Card data-testid="trending-hashtags-card">
        <CardContent className="p-4">
          <h4 className="font-semibold text-molochain-text mb-3">Trending in Logistics</h4>
          <div className="space-y-2">
            {trendingHashtags.map((hashtag, index) => (
              <div key={index} className="flex items-center justify-between text-sm" data-testid={`hashtag-${index}`}>
                <Badge variant="outline" className="text-molochain-blue border-molochain-blue hover:bg-blue-50">
                  {hashtag.tag}
                </Badge>
                <span className="text-gray-500">{hashtag.posts} posts</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
