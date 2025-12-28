import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
// Agent Status interface
interface AgentStatus {
  id: string;
  name: string;
  email: string;
  country: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  connectionQuality?: string;
  networkAvailability?: string;
  responseTime?: string;
  lastUpdated?: string;
  region?: string;
  specialty?: string[];
  lastActive: string;
  phone?: string;
  timezone?: string;
  languages?: string[];
  profileImage?: string;
  experience?: number;
  rating?: number;
  projects?: number;
  customFields?: Record<string, any>;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Star,
  FileUp,
  Clock,
  Users,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentPerformanceData } from '@/utils/exportUtils';

interface AgentPerformanceMetricsProps {
  agent: AgentStatus;
  className?: string;
  onExportMetrics?: (agent: AgentStatus, format: 'pdf' | 'csv') => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const mockProjectTypes = [
  { name: 'Container Shipping', value: 45 },
  { name: 'Air Freight', value: 20 },
  { name: 'Customs Clearance', value: 15 },
  { name: 'Warehousing', value: 10 },
  { name: 'Insurance', value: 5 },
  { name: 'Other', value: 5 }
];

const mockMonthlyPerformance = [
  { month: 'Jan', projects: 10, satisfaction: 92, responseTime: 120 },
  { month: 'Feb', projects: 12, satisfaction: 93, responseTime: 115 },
  { month: 'Mar', projects: 15, satisfaction: 95, responseTime: 105 },
  { month: 'Apr', projects: 11, satisfaction: 94, responseTime: 110 },
  { month: 'May', projects: 13, satisfaction: 92, responseTime: 118 },
  { month: 'Jun', projects: 16, satisfaction: 96, responseTime: 95 }
];

const AgentPerformanceMetrics: React.FC<AgentPerformanceMetricsProps> = ({ 
  agent, 
  className,
  onExportMetrics
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // We would normally fetch this data from an API
  // This is just placeholder data based on the agent's status
  const performanceData: AgentPerformanceData = {
    responseTime: agent.responseTime ? Number(agent.responseTime) : 110,
    satisfaction: agent.connectionQuality ? Number(agent.connectionQuality) : 92,
    projectsCompleted: 77,
    avgResponseTime: agent.responseTime ? Number(agent.responseTime) : 110,
    totalProjects: 83,
    rating: 4.7,
    onTimeDelivery: 94,
    clientRetention: 88,
    projectTypes: mockProjectTypes
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{agent.name}'s Performance</h2>
          <p className="text-gray-500">
            Detailed metrics and analytics for the past 6 months
          </p>
        </div>
        
        {onExportMetrics && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onExportMetrics(agent, 'csv')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onExportMetrics(agent, 'pdf')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Projects Completed</p>
                <h3 className="text-2xl font-bold">{performanceData.projectsCompleted}</h3>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {Math.round((performanceData.projectsCompleted / performanceData.totalProjects) * 100)}% Completion Rate
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Response Time</p>
                <h3 className="text-2xl font-bold">{performanceData.avgResponseTime} ms</h3>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant="outline" 
                className={
                  performanceData.avgResponseTime < 150 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : performanceData.avgResponseTime < 250
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {performanceData.avgResponseTime < 150 ? "Excellent" : performanceData.avgResponseTime < 250 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Client Satisfaction</p>
                <h3 className="text-2xl font-bold">{performanceData.satisfaction}%</h3>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant="outline" 
                className={
                  performanceData.satisfaction > 90 
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : performanceData.satisfaction > 80
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                }
              >
                {performanceData.satisfaction > 90 ? "Very High" : performanceData.satisfaction > 80 ? "High" : "Average"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overall Rating</p>
                <h3 className="text-2xl font-bold">{performanceData.rating}/5.0</h3>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <Star className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "h-4 w-4", 
                      i < Math.floor(performanceData.rating) 
                        ? "text-yellow-500 fill-yellow-500" 
                        : i < performanceData.rating 
                          ? "text-yellow-500 fill-yellow-500 opacity-50" 
                          : "text-gray-300"
                    )} 
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChartIcon className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Projects Completed', value: performanceData.projectsCompleted, benchmark: 70 },
                        { name: 'Client Satisfaction', value: performanceData.satisfaction, benchmark: 85 },
                        { name: 'On-Time Delivery', value: performanceData.onTimeDelivery, benchmark: 90 },
                        { name: 'Client Retention', value: performanceData.clientRetention, benchmark: 85 },
                      ]}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Actual" />
                      <Bar dataKey="benchmark" fill="#82ca9d" name="Team Average" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 space-y-4">
                  <h4 className="font-medium">Performance Highlights</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Exceeds benchmark in project completion rate
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Consistently high client satisfaction scores
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Above average response time to inquiries
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Skill Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      cx="50%" 
                      cy="50%" 
                      outerRadius="80%" 
                      data={[
                        { subject: 'Response Time', A: performanceData.responseTime / 2, B: 60, fullMark: 100 },
                        { subject: 'Satisfaction', A: performanceData.satisfaction, B: 85, fullMark: 100 },
                        { subject: 'Project Ratio', A: (performanceData.projectsCompleted / performanceData.totalProjects) * 100, B: 84, fullMark: 100 },
                        { subject: 'Delivery', A: performanceData.onTimeDelivery, B: 90, fullMark: 100 },
                        { subject: 'Retention', A: performanceData.clientRetention, B: 85, fullMark: 100 },
                        { subject: 'Rating', A: (performanceData.rating / 5) * 100, B: 80, fullMark: 100 },
                      ]}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar 
                        name={agent.name} 
                        dataKey="A" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                      />
                      <Radar 
                        name="Team Average" 
                        dataKey="B" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.6} 
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 space-y-4">
                  <h4 className="font-medium">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.specialty?.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={mockMonthlyPerformance}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="projects" stroke="#8884d8" name="Projects Completed" />
                    <Line yAxisId="left" type="monotone" dataKey="satisfaction" stroke="#82ca9d" name="Satisfaction (%)" />
                    <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#ffc658" name="Response Time (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Trend Analysis</h4>
                <p className="text-sm text-gray-600">
                  {agent.name} shows consistent improvement in project completion rates while maintaining 
                  high client satisfaction scores. Response times have improved by 20% over the past 
                  6 months, indicating increased efficiency and better resource management.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData.projectTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceData.projectTypes?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} projects`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Top Project Types</h4>
                  <ul className="space-y-2">
                    {performanceData.projectTypes?.slice(0, 3).map((project, index) => (
                      <li key={index} className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <span 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></span>
                          {project.name}
                        </span>
                        <span className="font-medium">{project.value} projects</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Specialization Score</h4>
                  <p className="text-sm text-gray-600">
                    Based on project history and client feedback, {agent.name} demonstrates 
                    high specialization in {performanceData.projectTypes?.[0].name} and {performanceData.projectTypes?.[1].name}, 
                    making them an ideal agent for these types of logistics operations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentPerformanceMetrics;