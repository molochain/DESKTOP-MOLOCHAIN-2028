import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Users, Heart, MessageCircle, Share2, 
  BarChart3, PieChart, Activity, Target, Hash, Globe, Clock, Calendar
} from 'lucide-react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  followerGrowth: number[];
  engagementRate: number[];
  reach: number[];
  impressions: number[];
  demographics: {
    age: { [key: string]: number };
    gender: { male: number; female: number; other: number };
    locations: { [key: string]: number };
  };
  contentPerformance: {
    type: string;
    engagement: number;
    reach: number;
  }[];
  hashtagPerformance: {
    tag: string;
    reach: number;
    engagement: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  competitorAnalysis: {
    name: string;
    followers: number;
    engagement: number;
    growth: number;
  }[];
}

export function InstagramAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [metric, setMetric] = useState('engagement');

  // Sample analytics data
  const analyticsData: AnalyticsData = {
    followerGrowth: [15420, 15445, 15512, 15589, 15645, 15702, 15798],
    engagementRate: [4.2, 4.5, 5.1, 4.8, 5.3, 5.6, 5.2],
    reach: [12500, 13200, 14800, 13900, 15200, 16100, 15800],
    impressions: [18500, 19200, 21500, 20100, 22800, 24200, 23500],
    demographics: {
      age: {
        '18-24': 15,
        '25-34': 45,
        '35-44': 25,
        '45-54': 10,
        '55+': 5
      },
      gender: {
        male: 65,
        female: 32,
        other: 3
      },
      locations: {
        'Dubai': 25,
        'USA': 20,
        'UK': 15,
        'Singapore': 10,
        'Hong Kong': 8,
        'Others': 22
      }
    },
    contentPerformance: [
      { type: 'Carousel', engagement: 5.8, reach: 18500 },
      { type: 'Video', engagement: 6.2, reach: 22000 },
      { type: 'Image', engagement: 4.5, reach: 15000 },
      { type: 'Reels', engagement: 7.1, reach: 28000 }
    ],
    hashtagPerformance: [
      { tag: '#blockchain', reach: 8500, engagement: 520, trend: 'up' },
      { tag: '#logistics', reach: 6200, engagement: 380, trend: 'up' },
      { tag: '#NFT', reach: 5800, engagement: 410, trend: 'stable' },
      { tag: '#supplychain', reach: 4100, engagement: 290, trend: 'down' },
      { tag: '#MoloChain', reach: 3500, engagement: 450, trend: 'up' }
    ],
    competitorAnalysis: [
      { name: 'MoloChain', followers: 15798, engagement: 5.2, growth: 2.8 },
      { name: 'Competitor A', followers: 28500, engagement: 3.1, growth: 1.2 },
      { name: 'Competitor B', followers: 42000, engagement: 2.8, growth: 0.8 },
      { name: 'Competitor C', followers: 19200, engagement: 4.5, growth: 2.1 }
    ]
  };

  // Chart configurations
  const followerGrowthChart = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Followers',
        data: analyticsData.followerGrowth,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const engagementChart = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Engagement Rate (%)',
        data: analyticsData.engagementRate,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const contentTypeChart = {
    labels: analyticsData.contentPerformance.map(c => c.type),
    datasets: [
      {
        label: 'Engagement Rate',
        data: analyticsData.contentPerformance.map(c => c.engagement),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ]
      }
    ]
  };

  const demographicsChart = {
    labels: Object.keys(analyticsData.demographics.age),
    datasets: [
      {
        label: 'Age Distribution',
        data: Object.values(analyticsData.demographics.age),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }
    ]
  };

  const locationChart = {
    labels: Object.keys(analyticsData.demographics.locations),
    datasets: [
      {
        label: 'Audience by Location',
        data: Object.values(analyticsData.demographics.locations),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ]
      }
    ]
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Instagram Analytics</h2>
          <p className="text-muted-foreground">Deep insights into your Instagram performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold">103.5K</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last period
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold">5.2%</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.8% from last period
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile Visits</p>
                <p className="text-2xl font-bold">8,245</p>
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5.2% from last period
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Link Clicks</p>
                <p className="text-2xl font-bold">1,842</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +24.3% from last period
                </p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Follower Growth</CardTitle>
                <CardDescription>Track your audience growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Line data={followerGrowthChart} options={{ 
                  responsive: true,
                  plugins: { legend: { display: false } }
                }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Milestones</CardTitle>
                <CardDescription>Key achievements and targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>10K Followers</span>
                    <span className="text-green-500">✓ Achieved</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>15K Followers</span>
                    <span className="text-green-500">✓ Achieved</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>20K Followers</span>
                    <span className="text-muted-foreground">79% Complete</span>
                  </div>
                  <Progress value={79} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>25K Followers</span>
                    <span className="text-muted-foreground">63% Complete</span>
                  </div>
                  <Progress value={63} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate Trend</CardTitle>
                <CardDescription>Daily engagement rate performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Line data={engagementChart} options={{ 
                  responsive: true,
                  plugins: { legend: { display: false } }
                }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Type Performance</CardTitle>
                <CardDescription>Engagement by content format</CardDescription>
              </CardHeader>
              <CardContent>
                <Bar data={contentTypeChart} options={{ 
                  responsive: true,
                  plugins: { legend: { display: false } }
                }} />
              </CardContent>
            </Card>
          </div>

          {/* Best Performing Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Your most engaging content this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { caption: 'NFT Marketplace Launch Announcement', engagement: 8.2, likes: 1243, comments: 89 },
                  { caption: 'Supply Chain Innovation with Blockchain', engagement: 6.5, likes: 856, comments: 72 },
                  { caption: 'Weekly Logistics Performance Report', engagement: 5.8, likes: 692, comments: 45 }
                ].map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{post.caption}</p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {post.comments}
                        </span>
                      </div>
                    </div>
                    <Badge variant="default">{post.engagement}% ER</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
                <CardDescription>Audience distribution by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut data={demographicsChart} options={{ 
                  responsive: true,
                  plugins: { legend: { position: 'bottom' } }
                }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Where your audience is located</CardDescription>
              </CardHeader>
              <CardContent>
                <Pie data={locationChart} options={{ 
                  responsive: true,
                  plugins: { legend: { position: 'bottom' } }
                }} />
              </CardContent>
            </Card>
          </div>

          {/* Active Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Active Hours</CardTitle>
              <CardDescription>When your followers are most active</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="space-y-2">
                    <p className="text-xs text-center font-medium">{day}</p>
                    <div className="space-y-1">
                      {[9, 12, 17, 20].map(hour => (
                        <div 
                          key={hour} 
                          className={`h-4 rounded ${
                            hour === 12 || hour === 17 ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                          title={`${hour}:00`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  High Activity
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-200 rounded" />
                  Low Activity
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {/* Hashtag Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Hashtag Performance</CardTitle>
              <CardDescription>Track the effectiveness of your hashtags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.hashtagPerformance.map((tag, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{tag.tag}</p>
                        <p className="text-xs text-muted-foreground">
                          {tag.reach.toLocaleString()} reach · {tag.engagement} engagements
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      tag.trend === 'up' ? 'default' : 
                      tag.trend === 'down' ? 'destructive' : 'secondary'
                    }>
                      {tag.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                       tag.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : '−'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Calendar Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar Performance</CardTitle>
              <CardDescription>Posts scheduled vs published this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Posts Scheduled</p>
                  <p className="text-3xl font-bold">24</p>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">75% of monthly goal</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Posts Published</p>
                  <p className="text-3xl font-bold">18</p>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-muted-foreground">On track for the month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Comparison</CardTitle>
              <CardDescription>How you stack up against similar accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.competitorAnalysis.map((competitor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{competitor.name}</p>
                      {competitor.name === 'MoloChain' && (
                        <Badge variant="default">You</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Followers</p>
                        <p className="font-medium">{competitor.followers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-medium">{competitor.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Growth</p>
                        <p className={`font-medium ${competitor.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {competitor.growth > 0 ? '+' : ''}{competitor.growth}%
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={competitor.name === 'MoloChain' ? 100 : (competitor.engagement / 5.2) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitive Advantages */}
          <Card>
            <CardHeader>
              <CardTitle>Competitive Advantages</CardTitle>
              <CardDescription>Your strengths compared to competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Engagement Rate</span>
                  <Badge variant="default">+68% vs avg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Growth Rate</span>
                  <Badge variant="default">+133% vs avg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content Frequency</span>
                  <Badge variant="secondary">-12% vs avg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <Badge variant="default">+45% faster</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}