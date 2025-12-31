export interface Container {
  name: string;
  status: string;
  health: 'healthy' | 'unhealthy' | 'none';
  ports: string;
  uptime: string;
  category: ContainerCategory;
}

export type ContainerCategory = 
  | 'core'
  | 'user-company'
  | 'rayanava'
  | 'cms'
  | 'infrastructure'
  | 'mololink'
  | 'communications'
  | 'workflow';

export interface SystemMetrics {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percent: number;
  };
  disk: {
    used: number;
    total: number;
    percent: number;
  };
  uptime: string;
  loadAverage: number[];
}

export interface ContainerStats {
  total: number;
  healthy: number;
  unhealthy: number;
  noHealthcheck: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
