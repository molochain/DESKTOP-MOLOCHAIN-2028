import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Instagram, 
  Users, 
  Heart, 
  MessageCircle, 
  Calendar, 
  BarChart3, 
  Camera,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  RefreshCw,
  Link,
  Video,
  Film,
  Sparkles,
  Brain,
  ShoppingBag,
  Trophy,
  TestTube,
  Activity,
  Zap,
  Target,
  Package,
  DollarSign,
  Eye,
  Hash,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  UserCheck,
  Store,
  Megaphone,
  Gift,
  Briefcase,
  Lightbulb,
  Send,
  Image,
  FileText,
  Layers,
  Star,
  Share2
} from "lucide-react";
import { format, formatDistanceToNow, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { InstagramConfig } from "@/components/marketing/InstagramConfig";
import { InstagramScheduler } from "@/components/marketing/InstagramScheduler";
import { InstagramAnalytics } from "@/components/marketing/InstagramAnalytics";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart } from "recharts";

// Interfaces for all Instagram features
interface InstagramAccount {
  id: number;
  accountId: string;
  username: string;
  accountType: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  profilePictureUrl?: string;
  isActive: boolean;
  lastSyncedAt: string;
}

interface InstagramPost {
  id: number;
  postId?: string;
  mediaType: string;
  caption?: string;
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  likesCount: number;
  commentsCount: number;
  engagementRate?: number;
  hashtags?: string;
  mediaUrl?: string;
}

interface InstagramStory {
  id: number;
  accountId: number;
  storyId?: string;
  mediaType: string;
  mediaUrl?: string;
  caption?: string;
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  viewsCount: number;
  repliesCount: number;
  exitsCount: number;
  impressions: number;
  reach: number;
  tapsForward: number;
  tapsBack: number;
}

interface InstagramReel {
  id: number;
  accountId: number;
  reelId?: string;
  title?: string;
  description?: string;
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  playsCount: number;
  audioUrl?: string;
  thumbnailUrl?: string;
}

interface InstagramInfluencer {
  id: number;
  accountId: number;
  username: string;
  fullName?: string;
  category: string;
  followersCount: number;
  engagementRate: number;
  averageLikes: number;
  averageComments: number;
  collaborationStatus: string;
  contactEmail?: string;
  priceRange?: string;
  notes?: string;
  lastCollaborationDate?: string;
}

interface InstagramCompetitor {
  id: number;
  accountId: number;
  username: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  engagementRate: number;
  averageLikes: number;
  averageComments: number;
  postingFrequency: number;
  topHashtags?: string;
  contentThemes?: string;
  lastAnalyzedAt: string;
}

interface InstagramABTest {
  id: number;
  accountId: number;
  testName: string;
  variantA: any;
  variantB: any;
  status: string;
  startDate: string;
  endDate?: string;
  winningVariant?: string;
  impressionsA: number;
  impressionsB: number;
  engagementA: number;
  engagementB: number;
  conversionA: number;
  conversionB: number;
}

interface InstagramShoppingProduct {
  id: number;
  accountId: number;
  productId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  productUrl?: string;
  category?: string;
  inStock: boolean;
  taggedPosts: number;
  clicks: number;
  purchases: number;
  revenue: number;
}

interface Analytics {
  profileViews: number;
  websiteClicks: number;
  totalReach: number;
  totalImpressions: number;
  followerGrowth: number;
  engagementRate: number;
  averageLikes: number;
  averageComments: number;
  topPerformingPost?: any;
  bestPostingTime?: string;
}

interface Template {
  id: number;
  name: string;
  category: string;
  content: string;
  hashtags?: string;
  isActive: boolean;
}

interface Campaign {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  budget?: number;
  targetReach?: number;
  targetEngagement?: number;
  actualReach?: number;
  actualEngagement?: number;
  postsCount: number;
}

// Chart colors
const CHART_COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

export default function InstagramDashboard() {
  const [selectedAccount, setSelectedAccount] = useState<InstagramAccount | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all Instagram data
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<InstagramAccount[]>({
    queryKey: ["/api/instagram/accounts"],
    retry: 1,
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<InstagramPost[]>({
    queryKey: ["/api/instagram/posts", selectedAccount?.id],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/posts?accountId=${selectedAccount?.id}`);
      return response as InstagramPost[];
    }
  });

  const { data: stories = [], isLoading: storiesLoading } = useQuery<InstagramStory[]>({
    queryKey: ["/api/instagram/stories", selectedAccount?.id],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/stories/${selectedAccount?.id}`);
      return response as InstagramStory[];
    }
  });

  const { data: reels = [], isLoading: reelsLoading } = useQuery<InstagramReel[]>({
    queryKey: ["/api/instagram/reels", selectedAccount?.id],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/reels/${selectedAccount?.id}`);
      return response as InstagramReel[];
    }
  });

  const { data: influencers = [] } = useQuery<InstagramInfluencer[]>({
    queryKey: ["/api/instagram/influencers", selectedAccount?.id],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/influencers/${selectedAccount?.id}`);
      return response as InstagramInfluencer[];
    }
  });

  const { data: competitors = [] } = useQuery<InstagramCompetitor[]>({
    queryKey: ["/api/instagram/competitors", selectedAccount?.id],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/competitors/${selectedAccount?.id}`);
      return response as InstagramCompetitor[];
    }
  });

  const { data: abTests = [] } = useQuery<InstagramABTest[]>({
    queryKey: ["/api/instagram/ab-tests", selectedAccount?.id],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/ab-tests/${selectedAccount?.id}`);
      return response as InstagramABTest[];
    }
  });

  const { data: shoppingProducts = [] } = useQuery<InstagramShoppingProduct[]>({
    queryKey: ["/api/instagram/shopping", selectedAccount?.id],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/shopping/${selectedAccount?.id}`);
      return response as InstagramShoppingProduct[];
    }
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/instagram/analytics", selectedAccount?.id],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/accounts/${selectedAccount?.id}/analytics`);
      return response as Analytics;
    }
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/instagram/templates"],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/templates/${selectedAccount?.id}`);
      return response as Template[];
    }
  });

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/instagram/campaigns", selectedAccount?.id],
    enabled: !!selectedAccount,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/instagram/campaigns/${selectedAccount?.id}`);
      return response as Campaign[];
    }
  });

  // AI Content Generation
  const generateAIContent = useMutation({
    mutationFn: async (prompt: string) => {
      return await apiRequest('POST', `/api/instagram/ai/generate`, { 
        accountId: selectedAccount?.id,
        prompt 
      });
    },
    onSuccess: (data) => {
      toast({
        title: "AI Content Generated",
        description: "Your content has been generated successfully"
      });
      setShowAIDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/posts"] });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI content",
        variant: "destructive"
      });
    }
  });

  // Connect Instagram account
  const connectAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', "/api/instagram/auth");
      return response as { authUrl?: string };
    },
    onSuccess: (data) => {
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    },
    onError: () => {
      toast({
        title: "Connection Error",
        description: "Failed to connect Instagram account",
        variant: "destructive"
      });
    }
  });

  // Refresh account data
  const refreshAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      return await apiRequest('POST', `/api/instagram/accounts/${accountId}/refresh`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instagram"] });
      toast({
        title: "Data Refreshed",
        description: "All Instagram data has been refreshed"
      });
    },
    onError: () => {
      toast({
        title: "Refresh Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    }
  });

  // Auto-select first account
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts]);

  // Check for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      toast({
        title: "Account Connected!",
        description: "Instagram account connected successfully"
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/accounts"] });
    }
  }, []);

  // Calculate metrics
  const calculateEngagementRate = (likes: number, comments: number, followers: number) => {
    if (!followers) return 0;
    return ((likes + comments) / followers * 100).toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
      case "active":
      case "completed":
        return "default" as const;
      case "scheduled":
      case "pending":
      case "running":
        return "secondary" as const;
      case "draft":
        return "outline" as const;
      case "failed":
      case "paused":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  // Prepare chart data
  const weeklyEngagementData = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  }).map(day => ({
    day: format(day, 'EEE'),
    posts: posts.filter(p => p.publishedAt && format(new Date(p.publishedAt), 'EEE') === format(day, 'EEE')).length,
    stories: stories.filter(s => s.publishedAt && format(new Date(s.publishedAt), 'EEE') === format(day, 'EEE')).length,
    reels: reels.filter(r => r.publishedAt && format(new Date(r.publishedAt), 'EEE') === format(day, 'EEE')).length
  }));

  const contentTypeDistribution = [
    { name: 'Posts', value: posts.filter(p => p.status === 'published').length, color: '#8B5CF6' },
    { name: 'Stories', value: stories.filter(s => s.status === 'published').length, color: '#EC4899' },
    { name: 'Reels', value: reels.filter(r => r.status === 'published').length, color: '#10B981' }
  ];

  const competitorComparison = competitors.slice(0, 5).map(c => ({
    name: c.username,
    followers: c.followersCount,
    engagement: c.engagementRate,
    posts: c.mediaCount
  }));

  if (accountsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Instagram className="h-8 w-8 text-pink-600" />
            Instagram Marketing Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete Instagram management with AI-powered automation
          </p>
        </div>
        <div className="flex gap-2">
          {!accounts || accounts.length === 0 ? (
            <Button 
              onClick={() => connectAccountMutation.mutate()}
              disabled={connectAccountMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Link className="h-4 w-4 mr-2" />
              Connect Instagram
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => selectedAccount && refreshAccountMutation.mutate(selectedAccount.id)}
                disabled={refreshAccountMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshAccountMutation.isPending ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI Content Generator</DialogTitle>
                    <DialogDescription>
                      Describe what you want to post and AI will generate content for you
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Content Prompt</Label>
                      <Textarea 
                        placeholder="E.g., Create an engaging post about our new logistics solution..."
                        value={aiPrompt}
                        onChange={(e) => setAIPrompt(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label>Template (Optional)</Label>
                      <Select onValueChange={(value) => setSelectedTemplate(templates.find(t => t.id === parseInt(value)) || null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={() => generateAIContent.mutate(aiPrompt)}
                      disabled={!aiPrompt || generateAIContent.isPending}
                      className="w-full"
                    >
                      {generateAIContent.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </>
          )}
        </div>
      </div>

      {!accounts || accounts.length === 0 ? (
        <Alert>
          <Instagram className="h-4 w-4" />
          <AlertDescription>
            Connect your Instagram Business account to start managing your social media presence
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Account Selector */}
          {accounts.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {accounts.map((account: InstagramAccount) => (
                <Button
                  key={account.id}
                  variant={selectedAccount?.id === account.id ? "default" : "outline"}
                  onClick={() => setSelectedAccount(account)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  {account.profilePictureUrl && (
                    <img 
                      src={account.profilePictureUrl} 
                      alt={account.username}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  @{account.username}
                  <Badge variant="secondary">{account.followersCount.toLocaleString()}</Badge>
                </Button>
              ))}
            </div>
          )}

          {selectedAccount && (
            <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Followers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedAccount.followersCount.toLocaleString()}
                    </div>
                    {analytics?.followerGrowth && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {analytics.followerGrowth > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        {Math.abs(analytics.followerGrowth)} this week
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.engagementRate?.toFixed(2) || '0'}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg across all content
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.totalReach?.toLocaleString() || '0'}
                    </div>
                    <Progress value={75} className="h-1 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Stories</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stories.filter(s => s.status === 'published').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stories.filter(s => s.status === 'scheduled').length} scheduled
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reels</CardTitle>
                    <Film className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reels.filter(r => r.status === 'published').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reels.reduce((acc, r) => acc + r.viewsCount, 0).toLocaleString()} views
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${shoppingProducts.reduce((acc, p) => acc + p.revenue, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {shoppingProducts.filter(p => p.inStock).length} products
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="stories">Stories</TabsTrigger>
                  <TabsTrigger value="reels">Reels</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="influencers">Influencers</TabsTrigger>
                  <TabsTrigger value="competitors">Competitors</TabsTrigger>
                  <TabsTrigger value="shopping">Shopping</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Activity Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Weekly Content Activity</CardTitle>
                        <CardDescription>Posts, Stories, and Reels published this week</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={weeklyEngagementData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="posts" fill="#8B5CF6" name="Posts" />
                            <Bar dataKey="stories" fill="#EC4899" name="Stories" />
                            <Bar dataKey="reels" fill="#10B981" name="Reels" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Content Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Distribution</CardTitle>
                        <CardDescription>Breakdown of published content types</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={contentTypeDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {contentTypeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Active Campaigns */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Campaigns</CardTitle>
                      <CardDescription>Currently running marketing campaigns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {campaigns.filter(c => c.status === 'active').slice(0, 5).map(campaign => (
                          <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Megaphone className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="font-medium">{campaign.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {campaign.postsCount} posts • Started {format(new Date(campaign.startDate), 'MMM d')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {campaign.actualReach?.toLocaleString() || '0'} / {campaign.targetReach?.toLocaleString() || '0'}
                              </div>
                              <Progress 
                                value={(campaign.actualReach || 0) / (campaign.targetReach || 1) * 100} 
                                className="h-1 w-24"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* A/B Tests */}
                  {abTests.filter(t => t.status === 'running').length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Running A/B Tests</CardTitle>
                        <CardDescription>Active content experiments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {abTests.filter(t => t.status === 'running').map(test => (
                            <div key={test.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <TestTube className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">{test.testName}</span>
                                </div>
                                <Badge variant="secondary">Running</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-2 bg-muted rounded">
                                  <div className="font-medium">Variant A</div>
                                  <div className="text-xs text-muted-foreground">
                                    {test.impressionsA.toLocaleString()} impressions
                                  </div>
                                  <Progress value={test.engagementA} className="h-1 mt-1" />
                                </div>
                                <div className="p-2 bg-muted rounded">
                                  <div className="font-medium">Variant B</div>
                                  <div className="text-xs text-muted-foreground">
                                    {test.impressionsB.toLocaleString()} impressions
                                  </div>
                                  <Progress value={test.engagementB} className="h-1 mt-1" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Management</CardTitle>
                      <CardDescription>All your Instagram posts and scheduled content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                          {posts.map(post => (
                            <div key={post.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                              {post.mediaUrl && (
                                <img src={post.mediaUrl} alt="" className="w-20 h-20 object-cover rounded" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant={getStatusColor(post.status)}>{post.status}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, h:mm a') : 
                                     post.scheduledAt ? `Scheduled: ${format(new Date(post.scheduledAt), 'MMM d, h:mm a')}` : ''}
                                  </span>
                                </div>
                                <p className="text-sm line-clamp-2">{post.caption}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" /> {post.likesCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" /> {post.commentsCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" /> {post.engagementRate?.toFixed(2)}%
                                  </span>
                                  {post.hashtags && (
                                    <span className="flex items-center gap-1">
                                      <Hash className="h-3 w-3" /> {post.hashtags.split(' ').length} tags
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Stories Tab */}
                <TabsContent value="stories" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Stories Performance</CardTitle>
                        <CardDescription>Track your Instagram Stories metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[500px]">
                          <div className="space-y-3">
                            {stories.map(story => (
                              <div key={story.id} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium">
                                      {story.publishedAt ? format(new Date(story.publishedAt), 'MMM d, h:mm a') : 'Scheduled'}
                                    </span>
                                  </div>
                                  <Badge variant={getStatusColor(story.status)}>{story.status}</Badge>
                                </div>
                                {story.caption && (
                                  <p className="text-sm text-muted-foreground mb-2">{story.caption}</p>
                                )}
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Views</span>
                                    <p className="font-medium">{story.viewsCount}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Reach</span>
                                    <p className="font-medium">{story.reach}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Replies</span>
                                    <p className="font-medium">{story.repliesCount}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Exits</span>
                                    <p className="font-medium">{story.exitsCount}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Story Insights</CardTitle>
                        <CardDescription>Key metrics and trends</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">Completion Rate</span>
                              <span className="text-sm font-medium">78%</span>
                            </div>
                            <Progress value={78} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">Avg. Watch Time</span>
                              <span className="text-sm font-medium">4.2s</span>
                            </div>
                            <Progress value={42} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">Link Clicks</span>
                              <span className="text-sm font-medium">234</span>
                            </div>
                            <Progress value={65} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Reels Tab */}
                <TabsContent value="reels" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reels Performance</CardTitle>
                      <CardDescription>Video content analytics and metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reels.map(reel => (
                          <div key={reel.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Film className="h-5 w-5 text-pink-600" />
                              <Badge variant={getStatusColor(reel.status)}>{reel.status}</Badge>
                            </div>
                            {reel.title && (
                              <h4 className="font-medium line-clamp-1">{reel.title}</h4>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {reel.description || 'No description'}
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <PlayCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="font-medium">{reel.playsCount.toLocaleString()}</p>
                                <p className="text-muted-foreground">Plays</p>
                              </div>
                              <div className="text-center">
                                <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="font-medium">{reel.likesCount.toLocaleString()}</p>
                                <p className="text-muted-foreground">Likes</p>
                              </div>
                              <div className="text-center">
                                <Share2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                <p className="font-medium">{reel.sharesCount.toLocaleString()}</p>
                                <p className="text-muted-foreground">Shares</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                  <InstagramAnalytics />
                </TabsContent>

                {/* Influencers Tab */}
                <TabsContent value="influencers" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Influencer Partnerships</CardTitle>
                      <CardDescription>Manage your influencer collaborations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {influencers.map(influencer => (
                          <div key={influencer.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <UserCheck className="h-5 w-5 text-indigo-600" />
                              <div>
                                <p className="font-medium">@{influencer.username}</p>
                                <p className="text-sm text-muted-foreground">
                                  {influencer.category} • {influencer.followersCount.toLocaleString()} followers
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium">{influencer.engagementRate.toFixed(2)}% ER</p>
                                <p className="text-xs text-muted-foreground">{influencer.priceRange}</p>
                              </div>
                              <Badge variant={
                                influencer.collaborationStatus === 'active' ? 'default' :
                                influencer.collaborationStatus === 'pending' ? 'secondary' :
                                'outline'
                              }>
                                {influencer.collaborationStatus}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Competitors Tab */}
                <TabsContent value="competitors" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Competitor Analysis</CardTitle>
                      <CardDescription>Track and compare with your competitors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={competitorComparison}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="followers" fill="#8B5CF6" name="Followers" />
                          <Bar yAxisId="right" dataKey="engagement" fill="#10B981" name="Engagement %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {competitors.map(competitor => (
                      <Card key={competitor.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">@{competitor.username}</CardTitle>
                          <CardDescription>
                            Last analyzed {formatDistanceToNow(new Date(competitor.lastAnalyzedAt))} ago
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Followers</span>
                              <span className="font-medium">{competitor.followersCount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Engagement</span>
                              <span className="font-medium">{competitor.engagementRate.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Posts/Week</span>
                              <span className="font-medium">{competitor.postingFrequency}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Shopping Tab */}
                <TabsContent value="shopping" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${shoppingProducts.reduce((acc, p) => acc + p.revenue, 0).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {shoppingProducts.length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {shoppingProducts.reduce((acc, p) => acc + p.clicks, 0).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {((shoppingProducts.reduce((acc, p) => acc + p.purchases, 0) / 
                            shoppingProducts.reduce((acc, p) => acc + p.clicks, 0)) * 100).toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Product Performance</CardTitle>
                      <CardDescription>Your Instagram Shopping catalog</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {shoppingProducts.map(product => (
                          <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {product.imageUrl && (
                                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                              )}
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {product.category} • ${product.price}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-sm font-medium">{product.clicks} clicks</p>
                                <p className="text-xs text-muted-foreground">{product.purchases} sales</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">${product.revenue.toLocaleString()}</p>
                                <Badge variant={product.inStock ? 'default' : 'destructive'}>
                                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
}