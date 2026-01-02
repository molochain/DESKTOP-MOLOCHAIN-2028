import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../lib/auth";
import { apiRequest } from "../lib/queryClient";
import { Image, Video, Calendar, FileText } from "lucide-react";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost, InsertPost } from "../lib/schema";

export default function CreatePost() {
  const { user: authUser } = useAuth();
  const user = authUser as User | null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");

  const createPostMutation = useMutation({
    mutationFn: async (postData: InsertPost) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created!",
        description: "Your post has been shared with your network.",
      });
      setContent("");
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    // Extract hashtags from content
    const hashtags = content.match(/#\w+/g) || [];

    createPostMutation.mutate({
      content: content.trim(),
      hashtags,
    });
  };

  if (!user) return null;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImage || undefined} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full text-left justify-start px-4 py-3 h-auto text-gray-500 hover:bg-gray-50"
                  data-testid="button-create-post"
                >
                  Share your logistics insights...
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Create a post</DialogTitle>
                  <DialogDescription>
                    Share your insights and updates with your professional network
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage || undefined} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.title} at {user.company}</p>
                    </div>
                  </div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What insights would you like to share with your network?"
                    className="min-h-[120px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
                    data-testid="textarea-post-content"
                  />
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button type="button" variant="ghost" size="sm" className="text-molochain-blue" data-testid="button-add-image">
                        <Image className="h-4 w-4 mr-2" />
                        Photo
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-molochain-success" data-testid="button-add-video">
                        <Video className="h-4 w-4 mr-2" />
                        Video
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-molochain-orange" data-testid="button-add-event">
                        <Calendar className="h-4 w-4 mr-2" />
                        Event
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-gray-600" data-testid="button-add-article">
                        <FileText className="h-4 w-4 mr-2" />
                        Article
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      disabled={!content.trim() || createPostMutation.isPending}
                      className="bg-molochain-blue hover:bg-molochain-blue/90"
                      data-testid="button-submit-post"
                    >
                      {createPostMutation.isPending ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600" data-testid="button-photo">
            <Image className="h-4 w-4 text-molochain-blue" />
            <span className="text-sm font-medium">Photo</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600" data-testid="button-video">
            <Video className="h-4 w-4 text-molochain-success" />
            <span className="text-sm font-medium">Video</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600" data-testid="button-event">
            <Calendar className="h-4 w-4 text-molochain-orange" />
            <span className="text-sm font-medium">Event</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600" data-testid="button-article">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Article</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
