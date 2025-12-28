import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { ThumbsUp, MessageCircle, Share, Send, MoreHorizontal, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
// LoadingSpinner removed - component not available

interface PostWithUser {
  id: string;
  content: string;
  imageUrl?: string;
  hashtags?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    company?: string;
    profileImage?: string;
  } | null;
}

interface PostCardProps {
  post: PostWithUser;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  // Check if user has liked this post
  useQuery({
    queryKey: ["/api/posts", post.id, "like", user?.id],
    queryFn: async () => {
      if (!user) return { liked: false };
      const response = await fetch(`/api/posts/${post.id}/like/${user.id}`);
      const data = await response.json();
      setIsLiked(data.liked);
      return data;
    },
    enabled: !!user,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const response = await apiRequest("POST", `/api/posts/${post.id}/like`, { userId: user.id });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: data.liked ? "Post liked!" : "Post unliked",
        description: data.liked ? "You liked this post" : "You removed your like",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Action failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like posts",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card className="mb-4" data-testid={`post-card-${post.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.user?.profileImage || undefined} alt={`${post.user?.firstName} ${post.user?.lastName}`} />
            <AvatarFallback>
              {post.user?.firstName?.charAt(0)}{post.user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-sm" data-testid={`text-author-${post.id}`}>
                {post.user?.firstName} {post.user?.lastName}
              </h4>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-500 text-sm">3rd+</span>
            </div>
            <p className="text-sm text-gray-600" data-testid={`text-title-${post.id}`}>
              {post.user?.title} {post.user?.company && `at ${post.user.company}`}
            </p>
            <p className="text-xs text-gray-500 flex items-center">
              {formatTime(post.createdAt)} • <Globe className="h-3 w-3 ml-1" />
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600" data-testid={`button-more-${post.id}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-sm mb-3 whitespace-pre-wrap" data-testid={`text-content-${post.id}`}>
            {post.content}
          </p>
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((hashtag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-molochain-blue hover:bg-blue-200">
                  {hashtag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full rounded-lg mb-4"
            data-testid={`img-post-${post.id}`}
          />
        )}

        <div className="flex items-center justify-between pt-2 mb-3">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1" data-testid={`text-likes-${post.id}`}>
              <ThumbsUp className="h-4 w-4 text-molochain-blue" />
              <span>{post.likes}</span>
            </span>
            <span data-testid={`text-comments-${post.id}`}>{post.comments} comments</span>
            <span data-testid={`text-shares-${post.id}`}>{post.shares} shares</span>
          </div>
        </div>

        <div className="flex justify-between pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center space-x-2 flex-1 justify-center transition-colors ${
              isLiked ? "text-molochain-blue bg-blue-50" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={handleLike}
            disabled={likeMutation.isPending}
            data-testid={`button-like-${post.id}`}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">Like</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 flex-1 justify-center" data-testid={`button-comment-${post.id}`}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Comment</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 flex-1 justify-center" data-testid={`button-share-${post.id}`}>
            <Share className="h-4 w-4" />
            <span className="text-sm font-medium">Share</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 flex-1 justify-center" data-testid={`button-send-${post.id}`}>
            <Send className="h-4 w-4" />
            <span className="text-sm font-medium">Send</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}