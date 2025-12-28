import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  BookOpen, 
  Globe, 
  Server, 
  Shield, 
  Wifi, 
  Activity, 
  AlertCircle,
  Users,
  Building2,
  TrendingUp,
  FileText,
  Search,
  Terminal,
  Database,
  Zap,
  Monitor,
  GitBranch,
  Package,
  Settings,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  Play,
  FileJson,
  Network,
  HardDrive,
  Cpu,
  Archive,
  Book,
  Briefcase,
  MapPin,
  BarChart
} from "lucide-react";

// Import existing components
import { ArchitectureDocumentation } from "@/components/developer-portal/ArchitectureDocumentation";
import { SystemHealthMonitor } from "@/components/developer-portal/SystemHealthMonitor";
import { APITestingConsole } from "@/components/developer-portal/APITestingConsole";
import { BrandProtection } from "@/components/developer-portal/BrandProtection";

interface GuideCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
}

interface Guide {
  id: number;
  categoryId: number;
  code: string;
  title: string;
  description: string;
  path: string;
  tags: string[];
  viewCount: number;
}

interface DepartmentSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
  badge?: string;
  features?: string[];
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  services?: Record<string, any>;
  system?: {
    cpu?: {
      usage?: number;
    };
    memory?: {
      used: number;
      total: number;
    };
    memoryUsed?: number;
    uptime?: number;
  };
  database?: {
    status: string;
    latency?: number;
  };
}

interface LiveStats {
  projects?: {
    active: number;
    total: number;
  };
  shipments?: {
    inTransit: number;
    delivered: number;
  };
  system?: {
    memoryUsed: number;
    memoryTotal: number;
  };
}

interface LiveFeed {
  projects?: Array<{
    id: string;
    title: string;
    status: string;
    type: string;
    region: string;
    updatedAt: string;
  }>;
  tracking?: Array<{
    id: string;
    trackingNumber: string;
    status: string;
    origin: string;
    destination: string;
    currentLocation?: string;
  }>;
}

interface RealtimeMetrics {
  database?: {
    active_projects: number;
    shipments_in_transit: number;
    active_services: number;
  };
  system?: {
    uptime: number;
    memoryUsed: number;
    memoryTotal?: number;
  };
  timestamp?: string;
}

export default function DeveloperDepartment() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResourceType, setSelectedResourceType] = useState("all");
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch system health data
  const { data: systemHealth, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/health/system'],
    refetchInterval: 30000,
  });

  // Fetch live statistics with project data
  const { data: liveStats } = useQuery<LiveStats>({
    queryKey: ['/api/developer/stats'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch live project feed
  const { data: liveFeed } = useQuery<LiveFeed>({
    queryKey: ['/api/developer/live-feed'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch real-time metrics
  const { data: realtimeMetrics } = useQuery<RealtimeMetrics>({
    queryKey: ['/api/developer/metrics/realtime'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch guide categories
  const { data: guideCategories } = useQuery<GuideCategory[]>({
    queryKey: ['/api/guides/categories'],
  });

  // Fetch popular guides
  const { data: popularGuides } = useQuery<Guide[]>({
    queryKey: ['/api/guides/all'],
    queryFn: async () => {
      const response = await fetch('/api/guides/all');
      if (!response.ok) {
        throw new Error(`Failed to fetch guides: ${response.status}`);
      }
      return await response.json();
    },
    retry: 1,
    staleTime: 60000
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/developer-workspace`;
    
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          // Subscribe to project and tracking updates
          ws.send(JSON.stringify({
            type: 'subscribe',
            channels: ['projects', 'tracking', 'metrics']
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle different message types
            switch(data.type) {
              case 'project_update':
                // Invalidate project queries to refetch
                queryClient.invalidateQueries({ queryKey: ['/api/developer/live-feed'] });
                queryClient.invalidateQueries({ queryKey: ['/api/developer/stats'] });
                break;
              
              case 'tracking_update':
                // Invalidate tracking queries
                queryClient.invalidateQueries({ queryKey: ['/api/developer/live-feed'] });
                break;
              
              case 'metrics_update':
                // Invalidate metrics queries
                queryClient.invalidateQueries({ queryKey: ['/api/developer/metrics/realtime'] });
                break;
              
              case 'system_update':
                // Invalidate system health queries
                queryClient.invalidateQueries({ queryKey: ['/api/health/system'] });
                break;
            }
          } catch (error) {
            // Handle error silently
          }
        };

        ws.onerror = () => {
          setWsConnected(false);
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Search functionality
  const { data: searchResults } = useQuery({
    queryKey: ['/api/developer/search', searchQuery, selectedResourceType],
    enabled: searchQuery.length > 2,
    queryFn: async () => {
      // Search across both technical docs and guides
      const params = new URLSearchParams({ 
        q: searchQuery,
        type: selectedResourceType 
      });
      
      const [guidesRes, docsRes] = await Promise.all([
        fetch(`/api/guides/search?${params}`),
        fetch(`/api/developer/docs/search?${params}`)
      ]);
      
      const guides = guidesRes.ok ? await guidesRes.json() : [];
      const docs = docsRes.ok ? await docsRes.json() : [];
      
      return { guides, docs };
    }
  });

  const technicalSections: DepartmentSection[] = [
    {
      id: "api-testing",
      title: "API Testing Console",
      description: "Interactive console for testing API endpoints with real-time responses",
      icon: <Terminal className="h-5 w-5" />,
      link: "#",
      badge: "126 endpoints",
      features: ["Real-time testing", "Request builder", "Response viewer", "Authentication support"]
    },
    {
      id: "system-health",
      title: "System Health Monitor",
      description: "Real-time monitoring of system performance and service status",
      icon: <Activity className="h-5 w-5" />,
      link: "#",
      badge: systemHealth?.status || "healthy",
      features: ["Service monitoring", "Performance metrics", "Alert system", "Health recommendations"]
    },
    {
      id: "architecture",
      title: "Architecture Documentation",
      description: "Comprehensive system architecture and technical specifications",
      icon: <Network className="h-5 w-5" />,
      link: "#",
      features: ["Module diagrams", "Data flow", "API structure", "Database schema"]
    },
    {
      id: "workspace",
      title: "Developer Workspace",
      description: "Real-time collaborative development environment",
      icon: <Code className="h-5 w-5" />,
      link: "/developer/workspace",
      badge: "Live collaboration",
      features: ["Code editor", "Real-time sync", "Chat integration", "Project management"]
    }
  ];

  const integrationSections: DepartmentSection[] = [
    {
      id: "websockets",
      title: "WebSocket Integration",
      description: "Real-time communication implementation guide",
      icon: <Wifi className="h-5 w-5" />,
      link: "/developer/websockets",
      features: ["Event handling", "Connection management", "Real-time updates"]
    },
    {
      id: "authentication",
      title: "Authentication Guide",
      description: "Secure authentication implementation patterns",
      icon: <Shield className="h-5 w-5" />,
      link: "/developer/auth",
      features: ["OAuth integration", "Session management", "Security best practices"]
    },
    {
      id: "sdks",
      title: "SDK Libraries",
      description: "Client libraries for popular programming languages",
      icon: <Package className="h-5 w-5" />,
      link: "/developer/sdks",
      features: ["JavaScript/TypeScript", "Python", "Java", "Go"]
    },
    {
      id: "database",
      title: "Database Schema Explorer",
      description: "Interactive database schema documentation",
      icon: <Database className="h-5 w-5" />,
      link: "/database-schema",
      features: ["Table relationships", "Query builder", "Migration guides"]
    }
  ];

  const getGuideIcon = (code: string) => {
    const icons: Record<string, React.ReactNode> = {
      ORG: <Users className="h-5 w-5" />,
      OPR: <Building2 className="h-5 w-5" />,
      GEO: <Globe className="h-5 w-5" />,
      BUS: <TrendingUp className="h-5 w-5" />
    };
    return icons[code] || <BookOpen className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container py-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              MOLOCHAIN Developer Department
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Unified hub for technical resources, API documentation, and business process guides
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Activity className="h-3 w-3 mr-1" />
              System: {systemHealth?.status || 'Loading'}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Globe className="h-3 w-3 mr-1" />
              126 API Endpoints
            </Badge>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search across all documentation, APIs, and guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-6 text-lg"
          />
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="technical">Technical Resources</TabsTrigger>
          <TabsTrigger value="guides">Process Guides</TabsTrigger>
          <TabsTrigger value="api">API Explorer</TabsTrigger>
          <TabsTrigger value="tools">Tools & Testing</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="space-y-8">
            {/* Quick Stats - Live Data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {liveStats?.projects?.active || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {liveStats?.projects?.total || 0} total projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shipments</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {liveStats?.shipments?.inTransit || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {liveStats?.shipments?.delivered || 0} delivered today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getStatusColor(systemHealth?.status || '')}`}>
                    {systemHealth?.status ? 
                      systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1) : 
                      'Loading'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {systemHealth?.services ? 
                      `${Object.values(systemHealth.services).filter((s: any) => s.status === 'available').length}/${Object.keys(systemHealth.services).length} services online` : 
                      'Checking services...'
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Memory</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {realtimeMetrics?.system?.memoryUsed || 0} MB
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of {realtimeMetrics?.system?.memoryTotal || 0} MB total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Endpoints</CardTitle>
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Active tools & utilities</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Technical Resources
                  </CardTitle>
                  <CardDescription>
                    API documentation, system architecture, and developer tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {technicalSections.slice(0, 3).map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {section.icon}
                        <div>
                          <p className="font-medium">{section.title}</p>
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                      {section.link ? (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={section.link}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("technical")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button className="w-full" onClick={() => setActiveTab("technical")}>
                    View All Technical Resources
                  </Button>
                </CardContent>
              </Card>

              {/* Process Guides */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Process Guides
                  </CardTitle>
                  <CardDescription>
                    Business processes, organizational guides, and best practices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {guideCategories?.slice(0, 3).map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getGuideIcon(category.code)}
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/guides/category/${category.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  <Button className="w-full" asChild>
                    <Link href="/guides">View All Guides</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Updates & Popular Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {popularGuides?.slice(0, 6).map((guide) => (
                    <Link key={guide.id} href={`/guides/${guide.id}`}>
                      <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary" className="text-xs">
                            {guide.viewCount} views
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{guide.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {guide.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Resources Tab */}
        <TabsContent value="technical">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technicalSections.map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {section.icon}
                        {section.title}
                      </CardTitle>
                      {section.badge && (
                        <Badge variant="outline">{section.badge}</Badge>
                      )}
                    </div>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {section.features && (
                      <ul className="space-y-2 mb-4">
                        {section.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.id === "api-testing" && (
                      <Button className="w-full" onClick={() => setActiveTab("api")}>
                        Open API Console
                      </Button>
                    )}
                    {section.id === "system-health" && (
                      <Button className="w-full" onClick={() => setActiveTab("monitoring")}>
                        View System Monitor
                      </Button>
                    )}
                    {section.id === "architecture" && (
                      <Button className="w-full" onClick={() => setActiveTab("api")}>
                        View Architecture
                      </Button>
                    )}
                    {section.link && section.id === "workspace" && (
                      <Button className="w-full" asChild>
                        <Link href={section.link}>
                          Open Workspace
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Integration Guides */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Integration Guides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrationSections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {section.icon}
                        {section.title}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {section.features && (
                        <ul className="space-y-2 mb-4">
                          {section.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      {section.link && (
                        <Button className="w-full" variant="outline" asChild>
                          <Link href={section.link}>
                            View Guide
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Process Guides Tab */}
        <TabsContent value="guides">
          <div className="space-y-6">
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {guideCategories?.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <Link href={`/guides/category/${category.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        {getGuideIcon(category.code)}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Browse Guides
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Popular Guides */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Popular Guides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularGuides?.slice(0, 9).map((guide) => (
                  <Card key={guide.id} className="hover:shadow-md transition-shadow">
                    <Link href={`/guides/${guide.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <FileText className="h-5 w-5 text-primary" />
                          <Badge variant="secondary" className="text-xs">
                            {guide.viewCount} views
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{guide.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {guide.description}
                        </CardDescription>
                      </CardHeader>
                      {guide.tags && guide.tags.length > 0 && (
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {guide.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Link>
                  </Card>
                ))}
              </div>
            </div>

            {/* Browse All Button */}
            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/guides">
                  Browse All Guides
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* API Explorer Tab */}
        <TabsContent value="api">
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Live API Environment</AlertTitle>
              <AlertDescription>
                You are connected to the production API environment. Test endpoints directly with real-time responses.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="console" className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="console">API Console</TabsTrigger>
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
                <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                <TabsTrigger value="swagger">Swagger Docs</TabsTrigger>
              </TabsList>

              <TabsContent value="console">
                <APITestingConsole />
              </TabsContent>

              <TabsContent value="architecture">
                <ArchitectureDocumentation />
              </TabsContent>

              <TabsContent value="endpoints">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">API Endpoints Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Authentication</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">5</p>
                        <p className="text-sm text-muted-foreground">endpoints</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Services</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">8</p>
                        <p className="text-sm text-muted-foreground">endpoints</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Tracking</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">6</p>
                        <p className="text-sm text-muted-foreground">endpoints</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/developer/help">
                      View Full API Documentation
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="swagger">
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive API Documentation</CardTitle>
                    <CardDescription>
                      Access the Swagger UI for comprehensive API documentation with live testing capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <a href="/api/docs" target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Swagger UI
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Tools & Testing Tab */}
        <TabsContent value="tools">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    API Testing Console
                  </CardTitle>
                  <CardDescription>
                    Test API endpoints directly with authentication support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setActiveTab("api")}>
                    Open Console
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Developer Workspace
                  </CardTitle>
                  <CardDescription>
                    Collaborative code editor with real-time sync
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/developer/workspace">
                      Open Workspace
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Schema Explorer
                  </CardTitle>
                  <CardDescription>
                    Interactive database documentation and query builder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/database-schema">
                      Explore Schema
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Brand Protection
                  </CardTitle>
                  <CardDescription>
                    Brand guidelines and asset protection tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    View Guidelines
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Live Project Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Live Project Activity
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                      <span className="text-xs font-normal text-muted-foreground">
                        {wsConnected ? 'Live' : 'Connecting...'}
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Real-time updates from active projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {liveFeed?.projects?.map((project: any) => (
                        <div key={project.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Briefcase className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{project.title}</p>
                              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Type: {project.type} • Region: {project.region}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Updated {new Date(project.updatedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(!liveFeed?.projects || liveFeed.projects.length === 0) && (
                        <p className="text-center text-muted-foreground">No recent project activity</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Live Shipment Tracking
                  </CardTitle>
                  <CardDescription>
                    Real-time shipment status updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {liveFeed?.tracking?.map((shipment: any) => (
                        <div key={shipment.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{shipment.trackingNumber}</p>
                              <Badge variant={shipment.status === 'in_transit' ? 'default' : 'secondary'}>
                                {shipment.status?.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {shipment.origin} → {shipment.destination}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Current: {shipment.currentLocation || 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(!liveFeed?.tracking || liveFeed.tracking.length === 0) && (
                        <p className="text-center text-muted-foreground">No active shipments</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Real-time System Metrics */}
            {realtimeMetrics && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Real-time System Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                      <p className="text-2xl font-bold">
                        {realtimeMetrics.database?.active_projects || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Shipments in Transit</p>
                      <p className="text-2xl font-bold">
                        {realtimeMetrics.database?.shipments_in_transit || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                      <p className="text-2xl font-bold">
                        {realtimeMetrics.database?.active_services || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                      <p className="text-2xl font-bold">
                        {Math.floor((realtimeMetrics.system?.uptime || 0) / 3600)}h
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Last updated: {new Date(realtimeMetrics.timestamp || Date.now()).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Access Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/developer/websockets">
                      <Wifi className="h-4 w-4 mr-2" />
                      WebSockets
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/developer/auth">
                      <Shield className="h-4 w-4 mr-2" />
                      Auth Guide
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/developer/sdks">
                      <Package className="h-4 w-4 mr-2" />
                      SDKs
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/developer/policies">
                      <FileText className="h-4 w-4 mr-2" />
                      API Policies
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring">
          <SystemHealthMonitor />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">API Response Time</span>
                      <span className="text-sm text-muted-foreground">
                        {systemHealth?.services ? 
                          `${Math.round(Object.values(systemHealth.services).reduce((acc: number, s: any) => acc + (s.responseTime || 0), 0) / Object.keys(systemHealth.services).length)}ms` : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {systemHealth?.system?.cpu?.usage?.toFixed(1) || '0'}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${systemHealth?.system?.cpu?.usage || 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {systemHealth?.system?.memory ? 
                          `${((systemHealth.system.memory.used / systemHealth.system.memory.total) * 100).toFixed(1)}%` : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" 
                        style={{ width: systemHealth?.system?.memory ? `${((systemHealth.system.memory.used / systemHealth.system.memory.total) * 100)}%` : '0%' }} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemHealth?.services && Object.entries(systemHealth.services).slice(0, 6).map(([service, data]: [string, any]) => (
                    <div key={service} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          data.status === 'available' ? 'bg-green-500' : 
                          data.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium">{service}</span>
                      </div>
                      <Badge variant={data.status === 'available' ? 'default' : 'secondary'}>
                        {data.responseTime ? `${data.responseTime}ms` : data.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Search Results Overlay */}
      {searchQuery.length > 2 && searchResults && (
        <div className="fixed inset-x-0 top-32 z-50 mx-auto max-w-3xl">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">
                Search Results for "{searchQuery}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {searchResults.guides?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Guides
                    </h4>
                    <div className="space-y-2">
                      {searchResults.guides.slice(0, 5).map((guide: Guide) => (
                        <Link key={guide.id} href={`/guides/${guide.id}`}>
                          <div className="p-2 rounded hover:bg-muted/50 transition-colors">
                            <p className="font-medium text-sm">{guide.title}</p>
                            <p className="text-xs text-muted-foreground">{guide.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.docs?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Technical Documentation
                    </h4>
                    <div className="space-y-2">
                      {searchResults.docs.map((doc: any) => (
                        <Link key={doc.id} href={doc.link}>
                          <div className="p-2 rounded hover:bg-muted/50 transition-colors">
                            <p className="font-medium text-sm">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{doc.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}