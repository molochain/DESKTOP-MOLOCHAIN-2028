import {
  Shield,
  Users,
  Activity,
  DollarSign,
  Server,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Database,
  Package,
  FileText,
  Bell,
  Clock,
  Zap,
  Target,
  Building,
  Briefcase,
  Code,
  GitBranch,
  Settings,
  Eye,
  Layers,
  Globe,
} from "lucide-react";
import type { DashboardConfig } from "@/components/dashboard/ConfigurableDashboard";

export const adminDashboardConfig: DashboardConfig = {
  role: "admin",
  title: "Admin Dashboard",
  subtitle: "System administration and monitoring",
  queryKey: "/api/admin/dashboard",
  metrics: [
    {
      key: "total-users",
      label: "Total Users",
      icon: Users,
      valueKey: "systemMetrics.totalUsers",
      trendKey: "systemMetrics.usersTrend",
      trendDirection: "up",
      format: "number",
    },
    {
      key: "active-sessions",
      label: "Active Sessions",
      icon: Activity,
      valueKey: "systemMetrics.activeSessions",
      format: "number",
      subtitle: "Currently online",
    },
    {
      key: "system-health",
      label: "System Health",
      icon: Server,
      valueKey: "systemMetrics.healthScore",
      format: "percent",
      subtitle: "Overall status",
    },
    {
      key: "security-alerts",
      label: "Security Alerts",
      icon: AlertTriangle,
      valueKey: "systemMetrics.securityAlerts",
      format: "number",
      subtitle: "Pending review",
    },
  ],
  actions: [
    {
      label: "System Settings",
      icon: Shield,
      variant: "outline",
      testId: "button-system-settings",
    },
    {
      label: "View Reports",
      icon: BarChart3,
      variant: "default",
      testId: "button-view-reports",
    },
  ],
};

export const analystDashboardConfig: DashboardConfig = {
  role: "analyst",
  title: "Analytics Dashboard",
  subtitle: "Data insights and reporting",
  queryKey: "/api/analyst/dashboard",
  metrics: [
    {
      key: "revenue",
      label: "Revenue",
      icon: DollarSign,
      valueKey: "kpis.revenue",
      trendKey: "kpis.revenueTrend",
      trendDirection: "up",
      format: "currency",
    },
    {
      key: "conversion",
      label: "Conversion Rate",
      icon: Target,
      valueKey: "kpis.conversion",
      trendKey: "kpis.conversionTrend",
      trendDirection: "up",
      format: "percent",
    },
    {
      key: "active-users",
      label: "Active Users",
      icon: Users,
      valueKey: "kpis.activeUsers",
      format: "number",
      subtitle: "Last 30 days",
    },
    {
      key: "avg-order",
      label: "Avg Order Value",
      icon: TrendingUp,
      valueKey: "kpis.avgOrderValue",
      format: "currency",
    },
  ],
  actions: [
    {
      label: "Export Data",
      icon: Database,
      variant: "outline",
      testId: "button-export-data",
    },
    {
      label: "Generate Report",
      icon: FileText,
      variant: "default",
      testId: "button-generate-report",
    },
  ],
};

export const userDashboardConfig: DashboardConfig = {
  role: "user",
  title: "My Dashboard",
  subtitle: "Your shipments and activity overview",
  queryKey: "/api/user/dashboard",
  metrics: [
    {
      key: "active-shipments",
      label: "Active Shipments",
      icon: Package,
      valueKey: "metrics.activeShipments",
      format: "number",
    },
    {
      key: "pending-invoices",
      label: "Pending Invoices",
      icon: FileText,
      valueKey: "metrics.pendingInvoices",
      format: "number",
    },
    {
      key: "total-spent",
      label: "Total Spent",
      icon: DollarSign,
      valueKey: "metrics.totalSpent",
      format: "currency",
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: Bell,
      valueKey: "metrics.notifications",
      format: "number",
      subtitle: "Unread",
    },
  ],
  actions: [
    {
      label: "New Shipment",
      icon: Package,
      variant: "default",
      testId: "button-new-shipment",
    },
    {
      label: "Track Order",
      icon: Clock,
      variant: "outline",
      testId: "button-track-order",
    },
  ],
};

export const companyDashboardConfig: DashboardConfig = {
  role: "company",
  title: "Company Dashboard",
  subtitle: "Business performance and operations overview",
  queryKey: "/api/company/dashboard",
  metrics: [
    {
      key: "revenue",
      label: "Revenue",
      icon: DollarSign,
      valueKey: "businessMetrics.revenue",
      trendKey: "businessMetrics.revenueTrend",
      trendDirection: "up",
      format: "currency",
    },
    {
      key: "employees",
      label: "Total Employees",
      icon: Users,
      valueKey: "businessMetrics.employees",
      format: "number",
    },
    {
      key: "departments",
      label: "Departments",
      icon: Building,
      valueKey: "businessMetrics.departments",
      format: "number",
    },
    {
      key: "active-projects",
      label: "Active Projects",
      icon: Briefcase,
      valueKey: "businessMetrics.activeProjects",
      format: "number",
    },
  ],
  actions: [
    {
      label: "Company Settings",
      icon: Settings,
      variant: "outline",
      testId: "button-company-settings",
    },
    {
      label: "View Reports",
      icon: BarChart3,
      variant: "default",
      testId: "button-view-reports",
    },
  ],
};

export const departmentDashboardConfig: DashboardConfig = {
  role: "department",
  title: "Department Dashboard",
  subtitle: "Department performance and team management",
  queryKey: "/api/department/dashboard",
  metrics: [
    {
      key: "team-members",
      label: "Team Members",
      icon: Users,
      valueKey: "departmentMetrics.teamMembers",
      format: "number",
    },
    {
      key: "active-tasks",
      label: "Active Tasks",
      icon: Activity,
      valueKey: "departmentMetrics.activeTasks",
      format: "number",
    },
    {
      key: "budget-used",
      label: "Budget Used",
      icon: DollarSign,
      valueKey: "departmentMetrics.budgetUsed",
      format: "percent",
    },
    {
      key: "projects",
      label: "Projects",
      icon: Layers,
      valueKey: "departmentMetrics.projects",
      format: "number",
    },
  ],
  actions: [
    {
      label: "Manage Team",
      icon: Users,
      variant: "outline",
      testId: "button-manage-team",
    },
    {
      label: "View Tasks",
      icon: FileText,
      variant: "default",
      testId: "button-view-tasks",
    },
  ],
};

export const developerDashboardConfig: DashboardConfig = {
  role: "developer",
  title: "Developer Dashboard",
  subtitle: "API metrics and development tools",
  queryKey: "/api/developer/dashboard",
  metrics: [
    {
      key: "api-calls",
      label: "API Calls",
      icon: Zap,
      valueKey: "apiMetrics.totalCalls",
      trendKey: "apiMetrics.callsTrend",
      trendDirection: "up",
      format: "number",
    },
    {
      key: "response-time",
      label: "Avg Response",
      icon: Clock,
      valueKey: "apiMetrics.avgResponseTime",
      format: "number",
      subtitle: "ms",
    },
    {
      key: "deployments",
      label: "Deployments",
      icon: GitBranch,
      valueKey: "apiMetrics.deployments",
      format: "number",
      subtitle: "This week",
    },
    {
      key: "uptime",
      label: "Uptime",
      icon: Server,
      valueKey: "apiMetrics.uptime",
      format: "percent",
    },
  ],
  actions: [
    {
      label: "API Docs",
      icon: Code,
      variant: "outline",
      testId: "button-api-docs",
    },
    {
      label: "Deploy",
      icon: GitBranch,
      variant: "default",
      testId: "button-deploy",
    },
  ],
};

export const managerDashboardConfig: DashboardConfig = {
  role: "manager",
  title: "Manager Dashboard",
  subtitle: "Team performance and resource management",
  queryKey: "/api/manager/dashboard",
  metrics: [
    {
      key: "team-size",
      label: "Team Size",
      icon: Users,
      valueKey: "managerMetrics.teamSize",
      format: "number",
    },
    {
      key: "projects-on-track",
      label: "On Track",
      icon: Target,
      valueKey: "managerMetrics.projectsOnTrack",
      format: "percent",
    },
    {
      key: "pending-approvals",
      label: "Pending Approvals",
      icon: Clock,
      valueKey: "managerMetrics.pendingApprovals",
      format: "number",
    },
    {
      key: "budget-remaining",
      label: "Budget Left",
      icon: DollarSign,
      valueKey: "managerMetrics.budgetRemaining",
      format: "currency",
    },
  ],
  actions: [
    {
      label: "Team View",
      icon: Users,
      variant: "outline",
      testId: "button-team-view",
    },
    {
      label: "Approvals",
      icon: FileText,
      variant: "default",
      testId: "button-approvals",
    },
  ],
};

export const moderatorDashboardConfig: DashboardConfig = {
  role: "moderator",
  title: "Moderator Dashboard",
  subtitle: "Content moderation and community management",
  queryKey: "/api/moderator/dashboard",
  metrics: [
    {
      key: "pending-reviews",
      label: "Pending Reviews",
      icon: Eye,
      valueKey: "moderatorMetrics.pendingReviews",
      format: "number",
    },
    {
      key: "flagged-content",
      label: "Flagged Content",
      icon: AlertTriangle,
      valueKey: "moderatorMetrics.flaggedContent",
      format: "number",
    },
    {
      key: "resolved-today",
      label: "Resolved Today",
      icon: Activity,
      valueKey: "moderatorMetrics.resolvedToday",
      format: "number",
    },
    {
      key: "community-health",
      label: "Community Health",
      icon: Globe,
      valueKey: "moderatorMetrics.communityHealth",
      format: "percent",
    },
  ],
  actions: [
    {
      label: "Review Queue",
      icon: Eye,
      variant: "outline",
      testId: "button-review-queue",
    },
    {
      label: "Reports",
      icon: FileText,
      variant: "default",
      testId: "button-reports",
    },
  ],
};

export const dashboardConfigs = {
  admin: adminDashboardConfig,
  analyst: analystDashboardConfig,
  user: userDashboardConfig,
  company: companyDashboardConfig,
  department: departmentDashboardConfig,
  developer: developerDashboardConfig,
  manager: managerDashboardConfig,
  moderator: moderatorDashboardConfig,
} as const;

export type DashboardRole = keyof typeof dashboardConfigs;
