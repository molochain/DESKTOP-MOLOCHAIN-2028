import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/contexts/WebSocketContext';

// Import security widgets
import {
  SecurityScoreWidget,
  ActiveThreatsWidget,
  AuthenticationStatsWidget,
  ComplianceStatusWidget,
  UserActivityWidget,
  IncidentCounterWidget,
  SystemHealthWidget,
  QuickActionsWidget
} from '@/components/security-widgets';

// Import notification components
import {
  NotificationCenter,
  NotificationBadge,
  NotificationSettings,
  AlertNotifications
} from '@/components/notifications';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart
} from 'recharts';

import {
  Shield,
  Users,
  Lock,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Ban,
  Clock,
  Globe,
  Zap,
  Database,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  MapPin,
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
  LogOut,
  Radio,
  Siren,
  Server,
  Search,
  Filter,
  AlertOctagon,
  UserCog,
  TrendingUp as Trend,
  Cpu,
  Terminal,
  GitBranch,
  Fingerprint,
  ShieldOff,
  BellRing,
  Gauge,
  Grid3x3,
  Maximize2,
  Move,
  Bell,
  ChevronRight,
  Layers,
  Layout,
  Plus
} from 'lucide-react';

interface IdentityStats {
  users: {
    total: number;
    active: number;
    admins: number;
    twoFactorEnabled: number;
  };
  sessions: {
    active: number;
    byRole: Record<string, number>;
  };
  security: {
    lockedAccounts: number;
    recentFailedLogins: number;
    threatsBlocked: number;
    requestsAnalyzed: number;
  };
  policies: {
    configured: number;
    names: string[];
  };
}

interface SecurityMetrics {
  requestsAnalyzed: number;
  threatsDetected: number;
  threatsBlocked: number;
  falsePositives: number;
  averageResponseTime: number;
  ruleEvaluations: number;
}

interface AuditStatistics {
  totalEvents: number;
  eventsByAction: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsByUser: Array<{ userId: number; username: string; count: number }>;
  eventsByResource: Record<string, number>;
  timeDistribution: Array<{ hour: number; count: number }>;
  anomalies: Array<{
    type: string;
    description: string;
    severity: string;
    timestamp: string;
  }>;
}

interface ComplianceReport {
  id: string;
  name: string;
  framework: string;
  overallScore: number;
  status: 'compliant' | 'non-compliant' | 'partial';
  generatedAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  priority: number;
  isSystem: boolean;
  permissions: Array<{
    id: string;
    resource: string;
    actions: string[];
  }>;
}

interface SecurityRule {
  id: string;
  name: string;
  type: string;
  resource: string;
  priority: number;
  enabled: boolean;
  actions: string[];
}

interface AuditLog {
  id: number;
  userId: number;
  username?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  timestamp: string;
  severity: string;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'access_change' | 'policy_violation' | 'threat_detected' | 'permission_change';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  userId?: number;
  username?: string;
  ipAddress?: string;
  timestamp: Date;
  details?: any;
}

interface ActiveThreat {
  id: string;
  type: 'brute_force' | 'unusual_access' | 'privilege_escalation' | 'data_exfiltration' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  status: 'active' | 'mitigated' | 'investigating';
  detectedAt: Date;
  attempts?: number;
  description: string;
}

interface SessionDetail {
  id: string;
  userId: number;
  username: string;
  ipAddress: string;
  location?: string;
  device: string;
  browser: string;
  startTime: Date;
  lastActivity: Date;
  activities: number;
  risk: 'low' | 'medium' | 'high';
}

interface SecurityMetric {
  timestamp: Date;
  successRate: number;
  failureRate: number;
  totalRequests: number;
  threatsBlocked: number;
  uniqueUsers: number;
}

interface GeographicAccess {
  country: string;
  city?: string;
  count: number;
  riskLevel: 'safe' | 'caution' | 'danger';
  coordinates?: [number, number];
}

interface ResourceAccess {
  resource: string;
  accessCount: number;
  uniqueUsers: number;
  lastAccessed: Date;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface UserBehavior {
  userId: number;
  username: string;
  normalPattern: string[];
  currentPattern: string[];
  anomalyScore: number;
  riskLevel: 'normal' | 'elevated' | 'high';
  flaggedActivities: string[];
}

interface WidgetConfig {
  id: string;
  type: 'security-score' | 'active-threats' | 'auth-stats' | 'compliance' | 'user-activity' | 'incidents' | 'system-health' | 'quick-actions';
  position: { x: number; y: number; w: number; h: number };
  refreshInterval?: number;
  fullView?: boolean;
  visible: boolean;
}

const defaultWidgetConfigs: WidgetConfig[] = [
  { id: 'security-score', type: 'security-score', position: { x: 0, y: 0, w: 3, h: 2 }, visible: true },
  { id: 'active-threats', type: 'active-threats', position: { x: 3, y: 0, w: 3, h: 2 }, visible: true },
  { id: 'auth-stats', type: 'auth-stats', position: { x: 6, y: 0, w: 3, h: 2 }, visible: true },
  { id: 'quick-actions', type: 'quick-actions', position: { x: 9, y: 0, w: 3, h: 2 }, visible: true },
  { id: 'compliance', type: 'compliance', position: { x: 0, y: 2, w: 4, h: 2 }, visible: true },
  { id: 'user-activity', type: 'user-activity', position: { x: 4, y: 2, w: 4, h: 2 }, visible: true },
  { id: 'incidents', type: 'incidents', position: { x: 8, y: 2, w: 4, h: 2 }, visible: true },
  { id: 'system-health', type: 'system-health', position: { x: 0, y: 4, w: 6, h: 2 }, visible: true },
];

export default function IdentitySecurityDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, subscribe, sendMessage } = useWebSocket();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showComplianceDialog, setShowComplianceDialog] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [dateRange, setDateRange] = useState({ start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() });
  
  // Widget management states
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(defaultWidgetConfigs);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [widgetFullView, setWidgetFullView] = useState<string | null>(null);
  
  // Real-time states
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeThreats, setActiveThreats] = useState<ActiveThreat[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionDetail[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [eventFilter, setEventFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch identity statistics
  const { data: identityStats, refetch: refetchIdentityStats } = useQuery<IdentityStats>({
    queryKey: ['/api/identity/statistics'],
    refetchInterval: 30000
  });

  // Fetch security metrics
  const { data: securityMetricsData } = useQuery<SecurityMetrics>({
    queryKey: ['/api/security/metrics'],
    refetchInterval: 30000
  });

  // Fetch audit statistics
  const { data: auditStats } = useQuery<AuditStatistics>({
    queryKey: ['/api/audit/statistics', dateRange],
  });

  // Fetch compliance reports
  const { data: complianceReports } = useQuery<ComplianceReport[]>({
    queryKey: ['/api/compliance/reports'],
  });

  // Fetch users
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch roles
  const { data: roles } = useQuery<Role[]>({
    queryKey: ['/api/access/roles'],
  });

  // Fetch security rules
  const { data: securityRules } = useQuery<SecurityRule[]>({
    queryKey: ['/api/security/rules'],
  });

  // Fetch recent audit logs
  const { data: recentAuditLogs } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit/logs', { limit: 50 }],
  });

  // User management mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => apiRequest('/api/identity/users', 'POST', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/identity/statistics'] });
      toast({ title: 'User created successfully' });
      setShowUserDialog(false);
    },
    onError: () => {
      toast({ title: 'Failed to create user', variant: 'destructive' });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: any) => 
      apiRequest(`/api/identity/users/${userId}`, 'PATCH', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'User updated successfully' });
    }
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: any) => 
      apiRequest(`/api/identity/users/${userId}/status`, 'PATCH', { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/identity/statistics'] });
      toast({ title: 'User status updated' });
    }
  });

  const enable2FAMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/identity/users/${userId}/2fa/enable`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/identity/statistics'] });
      toast({ title: '2FA enabled successfully' });
    }
  });

  // Role management mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, updates }: any) => 
      apiRequest(`/api/access/roles/${roleId}`, 'PATCH', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access/roles'] });
      toast({ title: 'Role updated successfully' });
    }
  });

  // Security policy mutations
  const updateSecurityRuleMutation = useMutation({
    mutationFn: ({ ruleId, updates }: any) => 
      apiRequest(`/api/security/rules/${ruleId}`, 'PATCH', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/rules'] });
      toast({ title: 'Security rule updated' });
    }
  });

  // Compliance mutations
  const generateComplianceReportMutation = useMutation({
    mutationFn: (reportData: any) => 
      apiRequest('/api/compliance/reports/generate', 'POST', reportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/reports'] });
      toast({ title: 'Compliance report generated' });
      setShowComplianceDialog(false);
    }
  });

  // Widget management functions
  const saveWidgetLayout = () => {
    localStorage.setItem('security-widget-layout', JSON.stringify(widgetConfigs));
    toast({ title: 'Widget layout saved' });
    setIsEditingLayout(false);
  };

  const resetWidgetLayout = () => {
    setWidgetConfigs(defaultWidgetConfigs);
    localStorage.removeItem('security-widget-layout');
    toast({ title: 'Widget layout reset to default' });
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgetConfigs(prev => 
      prev.map(w => w.id === widgetId ? { ...w, visible: !w.visible } : w)
    );
  };

  const exportWidgetData = async (widgetId: string) => {
    try {
      const response = await apiRequest(`/api/widgets/${widgetId}/export`, 'GET');
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${widgetId}-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Widget data exported' });
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  // Load saved widget layout
  useEffect(() => {
    const savedLayout = localStorage.getItem('security-widget-layout');
    if (savedLayout) {
      try {
        setWidgetConfigs(JSON.parse(savedLayout));
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('Failed to load widget layout');
        }
      }
    }
  }, []);

  // WebSocket subscriptions for real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeEvents = subscribe('security-events', (data: SecurityEvent) => {
      setSecurityEvents(prev => [data, ...prev].slice(0, 100));
      
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    });

    const unsubscribeThreats = subscribe('active-threats', (data: ActiveThreat) => {
      setActiveThreats(prev => {
        const updated = prev.filter(t => t.id !== data.id);
        if (data.status === 'active') {
          return [data, ...updated];
        }
        return updated;
      });
    });

    const unsubscribeSessions = subscribe('session-updates', (data: SessionDetail) => {
      setActiveSessions(prev => {
        const updated = prev.filter(s => s.id !== data.id);
        return [data, ...updated];
      });
    });

    const unsubscribeMetrics = subscribe('security-metrics', (data: SecurityMetric) => {
      setSecurityMetrics(prev => [...prev, data].slice(-50));
    });

    return () => {
      unsubscribeEvents();
      unsubscribeThreats();
      unsubscribeSessions();
      unsubscribeMetrics();
    };
  }, [isConnected, subscribe]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': case 'error': return 'text-orange-600 dark:text-orange-400';
      case 'medium': case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': case 'info': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderator': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'analyst': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'user': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const renderWidget = (config: WidgetConfig) => {
    if (!config.visible) return null;

    const commonProps = {
      key: config.id,
      className: `${widgetFullView === config.id ? 'col-span-12' : `col-span-${config.position.w}`}`,
      refreshInterval: config.refreshInterval,
      fullView: widgetFullView === config.id || config.fullView,
    };

    switch (config.type) {
      case 'security-score':
        return <SecurityScoreWidget {...commonProps} onRefresh={refetchIdentityStats} />;
      case 'active-threats':
        return <ActiveThreatsWidget {...commonProps} onThreatClick={(threat) => {
          if (import.meta.env.DEV) {
            console.log('Threat clicked:', threat);
          }
        }} />;
      case 'auth-stats':
        return <AuthenticationStatsWidget {...commonProps} onDetailsClick={() => setSelectedTab('authentication')} />;
      case 'compliance':
        return <ComplianceStatusWidget {...commonProps} onFrameworkClick={(framework) => {
          if (import.meta.env.DEV) {
            console.log('Framework:', framework);
          }
        }} />;
      case 'user-activity':
        return <UserActivityWidget {...commonProps} onUserClick={(user) => {
          if (import.meta.env.DEV) {
            console.log('User:', user);
          }
        }} />;
      case 'incidents':
        return <IncidentCounterWidget {...commonProps} onIncidentClick={(id) => {
          if (import.meta.env.DEV) {
            console.log('Incident:', id);
          }
        }} />;
      case 'system-health':
        return <SystemHealthWidget {...commonProps} onServiceClick={(service) => {
          if (import.meta.env.DEV) {
            console.log('Service:', service);
          }
        }} />;
      case 'quick-actions':
        return <QuickActionsWidget {...commonProps} onActionComplete={(id) => {
          if (import.meta.env.DEV) {
            console.log('Action completed:', id);
          }
        }} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="identity-security-dashboard">
      {/* Header with Notification Center */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            {t('admin.security.identity.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.security.identity.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Center */}
          <NotificationCenter 
            position="dropdown"
            onSettingsClick={() => setShowNotificationSettings(true)}
          />
          
          <Button 
            variant="outline" 
            onClick={() => setIsEditingLayout(!isEditingLayout)}
            data-testid="button-edit-layout"
          >
            {isEditingLayout ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {t('admin.security.identity.buttons.saveLayout')}
              </>
            ) : (
              <>
                <Layout className="w-4 h-4 mr-2" />
                {t('admin.security.identity.buttons.editLayout')}
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={() => refetchIdentityStats()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('admin.security.identity.buttons.refresh')}
          </Button>
          
          <Button onClick={() => setShowComplianceDialog(true)}>
            <FileCheck className="w-4 h-4 mr-2" />
            {t('admin.security.identity.buttons.generateReport')}
          </Button>
        </div>
      </div>

      {/* Alert Notifications */}
      <AlertNotifications />

      {/* Emergency Mode Banner */}
      {isEmergencyMode && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <Siren className="h-4 w-4" />
          <AlertTitle>{t('admin.security.identity.alerts.emergencyModeActive')}</AlertTitle>
          <AlertDescription>
            {t('admin.security.identity.alerts.emergencyModeDesc')}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            {t('admin.security.identity.tabs.dashboard')}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('admin.security.identity.tabs.users')}
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            {t('admin.security.identity.tabs.roles')}
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t('admin.security.identity.tabs.policies')}
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            {t('admin.security.identity.tabs.audit')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t('admin.security.identity.tabs.analytics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Widget Layout Controls */}
          {isEditingLayout && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{t('admin.security.identity.widgetEditor.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('admin.security.identity.widgetEditor.description')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetWidgetLayout}>
                    {t('admin.security.identity.buttons.resetToDefault')}
                  </Button>
                  <Button onClick={saveWidgetLayout}>
                    <Save className="w-4 h-4 mr-2" />
                    {t('admin.security.identity.buttons.saveLayout')}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mt-4">
                {widgetConfigs.map(config => (
                  <div 
                    key={config.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="text-sm capitalize">
                      {config.type.replace('-', ' ')}
                    </span>
                    <Switch
                      checked={config.visible}
                      onCheckedChange={() => toggleWidgetVisibility(config.id)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Widget Grid */}
          <div className="grid grid-cols-12 gap-4">
            {widgetConfigs.map(config => renderWidget(config))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('admin.security.identity.sections.userManagement')}</CardTitle>
                <Button onClick={() => setShowUserDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('admin.security.identity.buttons.addUser')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.security.identity.table.username')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.email')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.role')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.status')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.twoFactor')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.lastLogin')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'success' : 'secondary'}>
                          {user.isActive ? t('admin.security.identity.status.active') : t('admin.security.identity.status.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.twoFactorEnabled ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : t('admin.security.identity.status.never')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleUserStatusMutation.mutate({ 
                              userId: user.id, 
                              isActive: !user.isActive 
                            })}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('admin.security.identity.sections.roleManagement')}</CardTitle>
                <Button onClick={() => setShowRoleDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.security.identity.buttons.addRole')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles?.map(role => (
                  <Card key={role.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                          <CardDescription>{role.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={role.isSystem ? 'secondary' : 'outline'}>
                            {role.isSystem ? t('admin.security.identity.roleTypes.system') : t('admin.security.identity.roleTypes.custom')}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedRole(role)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {t('admin.security.identity.permissionsConfigured', { count: role.permissions.length })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.security.identity.sections.securityPolicies')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.security.identity.table.policyName')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.type')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.resource')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.priority')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.status')}</TableHead>
                    <TableHead>{t('admin.security.identity.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityRules?.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.type}</TableCell>
                      <TableCell>{rule.resource}</TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => 
                            updateSecurityRuleMutation.mutate({
                              ruleId: rule.id,
                              updates: { enabled: checked }
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('admin.security.identity.sections.auditLogs')}</CardTitle>
                <div className="flex gap-2">
                  <Select value={eventFilter} onValueChange={(value: any) => setEventFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.security.identity.filters.all')}</SelectItem>
                      <SelectItem value="info">{t('admin.security.identity.filters.info')}</SelectItem>
                      <SelectItem value="warning">{t('admin.security.identity.filters.warning')}</SelectItem>
                      <SelectItem value="critical">{t('admin.security.identity.filters.critical')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={t('admin.security.identity.filters.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.security.identity.table.timestamp')}</TableHead>
                      <TableHead>{t('admin.security.identity.table.user')}</TableHead>
                      <TableHead>{t('admin.security.identity.table.action')}</TableHead>
                      <TableHead>{t('admin.security.identity.table.resource')}</TableHead>
                      <TableHead>{t('admin.security.identity.table.ipAddress')}</TableHead>
                      <TableHead>{t('admin.security.identity.table.severity')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAuditLogs?.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.username || `User ${log.userId}`}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{`${log.resourceType}/${log.resourceId}`}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.security.identity.sections.authenticationTrends')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={securityMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="successRate" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="failureRate" stackId="1" stroke="#ef4444" fill="#ef4444" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.security.identity.sections.securityEventsByType')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={auditStats?.eventsByAction ? Object.entries(auditStats.eventsByAction).map(([key, value]) => ({ name: key, value })) : []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {auditStats?.eventsByAction && Object.entries(auditStats.eventsByAction).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Notification Settings Dialog */}
      <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <NotificationSettings 
            onSave={() => setShowNotificationSettings(false)}
            onCancel={() => setShowNotificationSettings(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Compliance Report Dialog */}
      <Dialog open={showComplianceDialog} onOpenChange={setShowComplianceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.security.identity.dialogs.generateComplianceReport')}</DialogTitle>
            <DialogDescription>
              {t('admin.security.identity.dialogs.complianceReportDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.security.identity.form.framework')}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.security.identity.form.selectFramework')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soc2">SOC 2</SelectItem>
                  <SelectItem value="iso27001">ISO 27001</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                  <SelectItem value="hipaa">HIPAA</SelectItem>
                  <SelectItem value="pci-dss">PCI-DSS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.security.identity.form.reportPeriod')}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.security.identity.form.selectPeriod')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('admin.security.identity.periods.monthly')}</SelectItem>
                  <SelectItem value="quarterly">{t('admin.security.identity.periods.quarterly')}</SelectItem>
                  <SelectItem value="annual">{t('admin.security.identity.periods.annual')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComplianceDialog(false)}>
              {t('admin.security.identity.buttons.cancel')}
            </Button>
            <Button onClick={() => generateComplianceReportMutation.mutate({})}>
              {t('admin.security.identity.buttons.generateReport')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}