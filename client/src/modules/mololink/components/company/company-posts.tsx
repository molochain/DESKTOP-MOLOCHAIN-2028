import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

interface CompanyPostWithAuthor extends CompanyPost {
  author: {
    id: string;
    firstName: string;
    lastName: string;
    title: string | null;
    profileImage: string | null;
  } | null;
  company?: {
    name: string;
    logoUrl: string | null;
  };
}

interface CompanyPostsProps {
  posts: CompanyPostWithAuthor[];
  isLoading?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export function CompanyPosts({ 
  posts, 
  isLoading,
  onLike,
  onComment,
  onShare
}: CompanyPostsProps) {
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  const handleSave = (postId: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full mt-4 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground">
            This company hasn't shared any updates yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author?.profileImage || undefined} />
                  <AvatarFallback>
                    {post.author?.firstName?.charAt(0)}
                    {post.author?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {post.author?.firstName} {post.author?.lastName}
                    </span>
                    {post.postType && (
                      <Badge variant="secondary" className="text-xs">
                        {post.postType}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {post.author?.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSave(post.id)}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    {savedPosts.has(post.id) ? 'Unsave' : 'Save'} post
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Report post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
              
              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.hashtags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="text-sm text-blue-600 hover:underline cursor-pointer flex items-center"
                      data-testid={`hashtag-${tag}`}
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="w-full h-auto object-cover"
                  data-testid={`img-post-${post.id}`}
                />
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center gap-6 pb-3 border-b text-sm text-muted-foreground">
              <span>{post.likes || 0} likes</span>
              <span>{post.comments || 0} comments</span>
              <span>{post.shares || 0} shares</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike?.(post.id)}
                className="flex-1"
                data-testid={`button-like-${post.id}`}
              >
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onComment?.(post.id)}
                className="flex-1"
                data-testid={`button-comment-${post.id}`}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare?.(post.id)}
                className="flex-1"
                data-testid={`button-share-${post.id}`}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}