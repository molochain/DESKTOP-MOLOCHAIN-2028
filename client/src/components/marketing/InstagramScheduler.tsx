import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, Send, Image, Hash, MapPin, Users, Eye, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrl?: string;
  scheduledDate: Date;
  status: 'scheduled' | 'published' | 'failed';
  hashtags: string[];
  location?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
}

export function InstagramScheduler() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [postContent, setPostContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [template, setTemplate] = useState('');
  
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      content: '🚀 Exciting news! MoloChain NFT Marketplace is now live! Trade tokenized logistics assets on blockchain.',
      scheduledDate: new Date(Date.now() + 86400000),
      status: 'scheduled',
      hashtags: ['#NFT', '#blockchain', '#logistics', '#MoloChain'],
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0
      }
    },
    {
      id: '2',
      content: '📦 Real-time tracking update: 5,000+ shipments delivered this week across 50 countries!',
      scheduledDate: new Date(Date.now() - 86400000),
      status: 'published',
      hashtags: ['#supplychain', '#logistics', '#tracking'],
      location: 'Global',
      engagement: {
        likes: 342,
        comments: 28,
        shares: 15,
        reach: 4520
      }
    }
  ]);

  const templates = [
    { id: '1', name: 'Shipment Update', category: 'logistics_update' },
    { id: '2', name: 'Blockchain Milestone', category: 'blockchain_feature' },
    { id: '3', name: 'NFT Drop Announcement', category: 'promotion' },
    { id: '4', name: 'Supply Chain Analytics', category: 'analytics' },
    { id: '5', name: 'Partner Spotlight', category: 'milestone' }
  ];

  const handleSchedulePost = () => {
    if (!postContent || !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please provide post content and schedule date",
        variant: "destructive"
      });
      return;
    }

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      content: postContent,
      scheduledDate: selectedDate,
      status: 'scheduled',
      hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
      location: location || undefined
    };

    setScheduledPosts([...scheduledPosts, newPost]);
    
    toast({
      title: "Post Scheduled",
      description: `Your post will be published on ${format(selectedDate, 'PPP')} at ${selectedTime}`,
    });

    // Reset form
    setPostContent('');
    setHashtags('');
    setLocation('');
    setMediaFile(null);
  };

  const optimalPostingTimes = [
    { time: '09:00', engagement: 'High' },
    { time: '12:00', engagement: 'Very High' },
    { time: '17:00', engagement: 'High' },
    { time: '20:00', engagement: 'Medium' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post Scheduler</CardTitle>
          <CardDescription>
            Schedule and manage your Instagram posts for optimal engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Post</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select value={template} onValueChange={setTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Post Content</Label>
                    <Textarea
                      id="content"
                      placeholder="What's happening in your supply chain today?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={6}
                    />
                    <div className="text-sm text-muted-foreground">
                      {postContent.length}/2200 characters
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hashtags">
                      <Hash className="inline h-4 w-4 mr-1" />
                      Hashtags
                    </Label>
                    <Input
                      id="hashtags"
                      placeholder="#logistics #blockchain #supplychain"
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="Add location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="media">
                      <Image className="inline h-4 w-4 mr-1" />
                      Media
                    </Label>
                    <Input
                      id="media"
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Schedule Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time
                    </Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {optimalPostingTimes.map(t => (
                          <SelectItem key={t.time} value={t.time}>
                            <div className="flex items-center justify-between w-full">
                              <span>{t.time}</span>
                              <Badge variant={t.engagement === 'Very High' ? 'default' : 'secondary'}>
                                {t.engagement}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSchedulePost} className="w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Schedule Post
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="scheduled" className="space-y-4">
              <div className="space-y-4">
                {scheduledPosts.map(post => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              post.status === 'published' ? 'default' : 
                              post.status === 'scheduled' ? 'secondary' : 'destructive'
                            }>
                              {post.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(post.scheduledDate, 'PPP p')}
                            </span>
                          </div>
                          <p className="text-sm">{post.content}</p>
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {post.engagement && post.status === 'published' && (
                            <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                              <span>❤️ {post.engagement.likes}</span>
                              <span>💬 {post.engagement.comments}</span>
                              <span>🔄 {post.engagement.shares}</span>
                              <span>👁️ {post.engagement.reach}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {post.status === 'scheduled' && (
                            <>
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="destructive">Cancel</Button>
                            </>
                          )}
                          {post.status === 'published' && (
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Best Posting Times</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {optimalPostingTimes.map(time => (
                        <div key={time.time} className="flex justify-between items-center">
                          <span>{time.time}</span>
                          <Badge variant={time.engagement === 'Very High' ? 'default' : 'secondary'}>
                            {time.engagement}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Blockchain Updates</span>
                        <span className="text-green-500">+45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipment Tracking</span>
                        <span className="text-green-500">+38%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NFT Announcements</span>
                        <span className="text-green-500">+52%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Hashtag Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">#blockchain (8.5K reach)</Badge>
                    <Badge variant="default">#logistics (6.2K reach)</Badge>
                    <Badge variant="secondary">#supplychain (4.1K reach)</Badge>
                    <Badge variant="secondary">#NFT (3.8K reach)</Badge>
                    <Badge variant="outline">#MoloChain (2.5K reach)</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}