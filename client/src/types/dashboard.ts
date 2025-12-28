// Type definitions for dashboard components

export interface DashboardStats {
  totalDepartments: number;
  totalDivisions: number;
  totalModules: number;
  systemUptime: number;
  activeUsers: number;
  dailyTransactions: number;
}

export interface LatestMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkIO: number;
}

export interface ModuleHealth {
  healthy: number;
  warning: number;
  critical: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  headId?: string;
  employeeCount: number;
  budget?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentWithStats extends Department {
  divisionCount?: number;
  moduleCount?: number;
  staffCount?: number;
  efficiency?: number;
}

export interface WebSocketMessage {
  type: 'connected' | 'metrics_update' | 'activity_update' | 'pong';
  data?: any;
  timestamp: Date;
}

export interface NavigationItem {
  name: string;
  icon: string;
  path: string;
  active?: boolean;
}

export interface MetricCard {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'critical';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
  };
}

export interface ComplianceStatus {
  id: number;
  region: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  lastAudit: string;
}

export interface ComplianceStatusWithIcon extends ComplianceStatus {
  icon: string;
  statusColor: 'green' | 'yellow' | 'red';
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onClick: () => void;
}

export interface EcosystemStatus {
  systemHealth: number;
  activeServices: number;
  totalServices: number;
  activeUsers: number;
  avgResponseTime: number;
  database: {
    connections: number;
    queriesPerSec: number;
    cacheHitRate: number;
    size: string;
  };
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    cpuCores?: number;
    cpuModel?: string;
  };
  organizational: {
    departments: {
      total: number;
      active: number;
    };
    divisions: {
      total: number;
      active: number;
    };
    alerts: {
      count: number;
      critical: number;
      warning: number;
    };
  };
  services: Array<{
    service: string;
    status: string;
    uptime: number;
    responseTime: number;
    lastCheck: string;
  }>;
  security: {
    activeSessions: number;
    apiKeysActive: number;
    failedLogins: number;
    rateLimited: number;
  };
}

export interface GodLayerService {
  name: string;
  status: 'active' | 'degraded' | 'offline';
  health: number;
  lastCheck: string;
  responseTime: number;
}

export interface ComplianceItem {
  region: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  lastAudit: string;
}

export interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'access' | 'system';
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}
