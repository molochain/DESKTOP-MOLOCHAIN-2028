import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Package, 
  Star,
  Calendar,
  Eye,
  MessageSquare,
  ShoppingCart,
  Activity,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ServiceAnalyticsDashboardProps {
  serviceId: string;
  serviceName: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

export function ServiceAnalyticsDashboard({ 
  serviceId, 
  serviceName 
}: ServiceAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: [`/api/services/${serviceId}/analytics`, timeRange],
    enabled: !!serviceId,
  });

  const { data: metricsData } = useQuery({
    queryKey: [`/api/services/${serviceId}/metrics`],
    enabled: !!serviceId,
  });

  // Mock data for demonstration (replace with actual data from API)
  const mockAnalytics = {
    totalBookings: 245,
    totalRevenue: 125600,
    averageRating: 4.6,
    totalViews: 3456,
    conversionRate: 7.2,
    totalInquiries: 89,
    completionRate: 94.5,
    repeatCustomers: 67,
  };

  const mockTrends = [
    { date: 'Jan 1', bookings: 12, revenue: 5400, views: 234 },
    { date: 'Jan 7', bookings: 15, revenue: 6750, views: 298 },
    { date: 'Jan 14', bookings: 18, revenue: 8100, views: 345 },
    { date: 'Jan 21', bookings: 22, revenue: 9900, views: 412 },
    { date: 'Jan 28', bookings: 19, revenue: 8550, views: 378 },
    { date: 'Feb 4', bookings: 25, revenue: 11250, views: 456 },
    { date: 'Feb 11', bookings: 28, revenue: 12600, views: 523 },
  ];

  const mockDistribution = [
    { name: 'Standard', value: 45, color: '#3b82f6' },
    { name: 'Express', value: 30, color: '#10b981' },
    { name: 'Premium', value: 20, color: '#f59e0b' },
    { name: 'Custom', value: 5, color: '#8b5cf6' },
  ];

  const mockPerformance = [
    { metric: 'On-Time Delivery', value: 96, target: 95 },
    { metric: 'Customer Satisfaction', value: 92, target: 90 },
    { metric: 'Service Quality', value: 94, target: 90 },
    { metric: 'Response Time', value: 88, target: 85 },
    { metric: 'Issue Resolution', value: 90, target: 88 },
  ];

  const metricCards: MetricCard[] = [
    {
      title: 'Total Bookings',
      value: mockAnalytics.totalBookings,
      change: 12.5,
      changeType: 'positive',
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      title: 'Total Revenue',
      value: `$${mockAnalytics.totalRevenue.toLocaleString()}`,
      change: 8.3,
      changeType: 'positive',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      title: 'Average Rating',
      value: mockAnalytics.averageRating,
      change: 0.2,
      changeType: 'positive',
      icon: <Star className="w-4 h-4" />,
    },
    {
      title: 'Total Views',
      value: mockAnalytics.totalViews.toLocaleString(),
      change: -5.1,
      changeType: 'negative',
      icon: <Eye className="w-4 h-4" />,
    },
    {
      title: 'Conversion Rate',
      value: `${mockAnalytics.conversionRate}%`,
      change: 1.8,
      changeType: 'positive',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      title: 'Inquiries',
      value: mockAnalytics.totalInquiries,
      change: 15.2,
      changeType: 'positive',
      icon: <MessageSquare className="w-4 h-4" />,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Service Analytics</h2>
          <p className="text-muted-foreground">{serviceName}</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {metric.value}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {metric.changeType === 'positive' ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : metric.changeType === 'negative' ? (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                ) : (
                  <Activity className="w-3 h-3 text-gray-600" />
                )}
                <span className={`text-xs ${
                  metric.changeType === 'positive' ? 'text-green-600' : 
                  metric.changeType === 'negative' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Service Trends</CardTitle>
              <CardDescription>
                Bookings, revenue, and views over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#3b82f6" 
                    name="Bookings"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    name="Revenue ($)"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="views" 
                    stroke="#f59e0b" 
                    name="Views"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Tier Distribution</CardTitle>
                <CardDescription>
                  Breakdown by service tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Regions</CardTitle>
                <CardDescription>
                  Service usage by region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { region: 'North America', percentage: 35 },
                    { region: 'Europe', percentage: 28 },
                    { region: 'Asia Pacific', percentage: 22 },
                    { region: 'Latin America', percentage: 10 },
                    { region: 'Others', percentage: 5 },
                  ].map((item) => (
                    <div key={item.region}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.region}</span>
                        <span className="font-medium">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators vs targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Actual" />
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
                <CardDescription>
                  Customer behavior and retention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Repeat Customers</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{mockAnalytics.repeatCustomers}</span>
                    <Badge variant="secondary">27.3%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{mockAnalytics.completionRate}%</span>
                    <Badge variant="outline" className="text-green-600">
                      Above Target
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Order Value</span>
                  <span className="font-semibold">$512</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Customer Lifetime Value</span>
                  <span className="font-semibold">$3,245</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest service interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'New Booking', time: '2 hours ago', user: 'John D.' },
                    { action: 'Service Inquiry', time: '3 hours ago', user: 'Sarah M.' },
                    { action: 'Review Posted', time: '5 hours ago', user: 'Mike R.' },
                    { action: 'Price Quote', time: '8 hours ago', user: 'Lisa K.' },
                    { action: 'Booking Completed', time: '12 hours ago', user: 'Tom S.' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>{activity.action}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {activity.user} • {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}