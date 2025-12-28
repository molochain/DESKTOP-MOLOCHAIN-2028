// Dashboard role and permission types

export type DashboardRole = 
  | 'admin'
  | 'user'
  | 'moderator'
  | 'manager'
  | 'analyst'
  | 'developer'
  | 'company'
  | 'department';

export interface DashboardPermissions {
  canViewAnalytics: boolean;
  canViewUsers: boolean;
  canManageContent: boolean;
  canViewReports: boolean;
  canAccessDeveloperTools: boolean;
  canManageDepartments: boolean;
  canViewFinancials: boolean;
  canManageProjects: boolean;
  canAccessGodLayer: boolean;
  canViewSystemHealth: boolean;
  canManageIntegrations: boolean;
  customPermissions?: string[];
}

export interface BaseDashboardData {
  dashboardId: string;
  role: DashboardRole;
  lastAccessed: Date;
  preferences: DashboardPreferences;
  permissions: DashboardPermissions;
}

export interface DashboardPreferences {
  theme?: 'light' | 'dark' | 'auto';
  defaultView?: string;
  widgets: string[];
  layout?: 'grid' | 'list' | 'card';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface UserDashboardData extends BaseDashboardData {
  role: 'user';
  recentActivities: Activity[];
  projects: UserProject[];
  notifications: Notification[];
  quickLinks: QuickLink[];
}

export interface AdminDashboardData extends BaseDashboardData {
  role: 'admin';
  systemMetrics: SystemMetrics;
  userStats: UserStatistics;
  recentLogs: LogEntry[];
  alerts: SystemAlert[];
  departments: DepartmentSummary[];
  complianceStatus: ComplianceStatus[];
}

export interface DeveloperDashboardData extends BaseDashboardData {
  role: 'developer';
  apiUsage: APIUsageMetrics;
  deployments: Deployment[];
  buildStatus: BuildStatus[];
  codeMetrics: CodeMetrics;
  integrations: Integration[];
  documentation: DocLink[];
}

export interface CompanyDashboardData extends BaseDashboardData {
  role: 'company';
  companyMetrics: CompanyMetrics;
  departments: Department[];
  employees: EmployeeSummary;
  financialOverview: FinancialSummary;
  projects: CompanyProject[];
  partnerships: Partnership[];
}

export interface DepartmentDashboardData extends BaseDashboardData {
  role: 'department';
  departmentName: string;
  departmentId: string;
  teamMembers: TeamMember[];
  departmentMetrics: DepartmentMetrics;
  tasks: DepartmentTask[];
  resources: Resource[];
  budget: BudgetInfo;
}

// Supporting types for dashboard data

export interface Activity {
  id: string;
  type: 'login' | 'update' | 'create' | 'delete' | 'view';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserProject {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  progress: number;
  deadline?: Date;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: number;
  uptime: number;
  activeConnections: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  usersByRole: Record<DashboardRole, number>;
}

export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  source?: string;
}

export interface SystemAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  createdAt: Date;
  acknowledged: boolean;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  headCount: number;
  budget: number;
  performance: number;
  status: 'active' | 'inactive';
}

export interface APIUsageMetrics {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  topEndpoints: APIEndpoint[];
  rateLimitStatus: RateLimitInfo;
}

export interface APIEndpoint {
  path: string;
  method: string;
  calls: number;
  avgTime: number;
  errorRate: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface Deployment {
  id: string;
  name: string;
  environment: 'development' | 'staging' | 'production';
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  version: string;
  deployedAt: Date;
  deployedBy: string;
}

export interface BuildStatus {
  id: string;
  project: string;
  branch: string;
  status: 'pending' | 'building' | 'success' | 'failed';
  startedAt: Date;
  duration?: number;
}

export interface CodeMetrics {
  linesOfCode: number;
  coverage: number;
  technicalDebt: number;
  codeQuality: number;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
}

export interface DocLink {
  id: string;
  title: string;
  url: string;
  category: string;
  lastUpdated: Date;
}

export interface CompanyMetrics {
  revenue: number;
  growth: number;
  employeeCount: number;
  customerCount: number;
  projectCount: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headId: string;
  headName: string;
  employeeCount: number;
  budget: number;
  projects: number;
}

export interface EmployeeSummary {
  total: number;
  byDepartment: Record<string, number>;
  byRole: Record<string, number>;
  newHires: number;
  turnoverRate: number;
}

export interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  budget: number;
  forecast: number;
}

export interface CompanyProject {
  id: string;
  name: string;
  department: string;
  status: string;
  budget: number;
  completion: number;
  deadline: Date;
}

export interface Partnership {
  id: string;
  partnerName: string;
  type: string;
  status: 'active' | 'pending' | 'inactive';
  value: number;
  startDate: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  status: 'active' | 'away' | 'offline';
}

export interface DepartmentMetrics {
  productivity: number;
  efficiency: number;
  taskCompletion: number;
  budgetUtilization: number;
}

export interface DepartmentTask {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  dueDate?: Date;
}

export interface Resource {
  id: string;
  name: string;
  type: 'human' | 'material' | 'financial' | 'technical';
  availability: number;
  allocation: number;
}

export interface BudgetInfo {
  total: number;
  allocated: number;
  spent: number;
  remaining: number;
  projectedOverrun?: number;
}

export interface ComplianceStatus {
  region: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  lastAudit: Date;
  nextAudit?: Date;
}

// Dashboard configuration types

export interface DashboardConfig {
  role: DashboardRole;
  path: string;
  component: string;
  title: string;
  description?: string;
  icon?: string;
  requiredPermissions?: string[];
  features?: string[];
}

export interface DashboardRoute {
  path: string;
  exact?: boolean;
  component: React.ComponentType<any>;
  requiredRole?: DashboardRole[];
  requiredPermissions?: string[];
}

// Response types for API

export interface DashboardDataResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface MultipleDashboardsResponse {
  availableDashboards: DashboardConfig[];
  defaultDashboard: DashboardRole;
  currentDashboard?: DashboardRole;
}