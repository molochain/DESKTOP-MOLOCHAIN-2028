import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function login(email: string, password: string) {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
}

export async function logout() {
  const response = await api.post('/api/auth/logout');
  return response.data;
}

export async function getSystemMetrics() {
  const response = await api.get('/api/admin/microservices/system-metrics');
  return response.data;
}

export async function getContainers() {
  const response = await api.get('/api/admin/microservices/containers');
  return response.data;
}

export async function restartContainer(containerName: string) {
  const response = await api.post(`/api/admin/microservices/restart/${containerName}`);
  return response.data;
}

export async function getContainerLogs(containerName: string, lines = 100) {
  const response = await api.get(`/api/admin/microservices/logs/${containerName}?lines=${lines}`);
  return response.data;
}

export async function getHealth() {
  const response = await api.get('/api/health');
  return response.data;
}

export async function getPrometheusMetrics() {
  const response = await api.get('/api/admin/microservices/prometheus/metrics');
  return response.data;
}

export async function getMetricHistory(metric: string, range: string = '1h') {
  const response = await api.get(`/api/admin/microservices/prometheus/query?metric=${metric}&range=${range}`);
  return response.data;
}

export async function getAvailableMetrics() {
  const response = await api.get('/api/admin/microservices/prometheus/available-metrics');
  return response.data;
}

export async function getAdminUsers() {
  const response = await api.get('/api/admin/users');
  return response.data;
}

export async function createAdminUser(data: { username: string; email: string; password: string; role: string }) {
  const response = await api.post('/api/admin/users', data);
  return response.data;
}

export async function updateAdminUser(id: string, data: { username?: string; email?: string; role?: string }) {
  const response = await api.patch(`/api/admin/users/${id}`, data);
  return response.data;
}

export async function deleteAdminUser(id: string) {
  const response = await api.delete(`/api/admin/users/${id}`);
  return response.data;
}

export async function checkSSLCertificates() {
  const response = await api.get('/api/ssl/check-all');
  return response.data;
}

export async function checkSSLCertificate(domain: string) {
  const response = await api.get(`/api/ssl/check?domain=${encodeURIComponent(domain)}`);
  return response.data;
}

export async function getSettings() {
  const response = await api.get('/api/admin/database/settings');
  return response.data;
}

export async function saveSettings(settings: { alerts?: object; backup?: object; email?: object }) {
  const response = await api.post('/api/admin/database/settings', settings);
  return response.data;
}

export async function getSetting(key: string) {
  const response = await api.get(`/api/admin/database/settings/${key}`);
  return response.data;
}

export async function updateSetting(key: string, value: object) {
  const response = await api.put(`/api/admin/database/settings/${key}`, { value });
  return response.data;
}

export async function getAlertAcknowledgements() {
  const response = await api.get('/api/admin/database/alerts/acknowledgements');
  return response.data;
}

export async function acknowledgeAlert(alertId: string, acknowledgedBy?: string) {
  const response = await api.post('/api/admin/database/alerts/acknowledge', { alertId, acknowledgedBy });
  return response.data;
}

export async function acknowledgeAllAlerts(alertIds: string[], acknowledgedBy?: string) {
  const response = await api.post('/api/admin/database/alerts/acknowledge-all', { alertIds, acknowledgedBy });
  return response.data;
}

export async function removeAlertAcknowledgement(alertId: string) {
  const response = await api.delete(`/api/admin/database/alerts/acknowledgements/${encodeURIComponent(alertId)}`);
  return response.data;
}

// Phase 5: Alert Rules API
export async function getAlertRules() {
  const response = await api.get('/api/admin/database/alert-rules');
  return response.data;
}

export async function getAlertRule(id: number) {
  const response = await api.get(`/api/admin/database/alert-rules/${id}`);
  return response.data;
}

export async function createAlertRule(data: {
  name: string;
  description?: string;
  conditionType: string;
  conditionValue: object;
  actionType: string;
  actionConfig?: object;
  enabled?: boolean;
  requiresApproval?: boolean;
  cooldownSeconds?: number;
}) {
  const response = await api.post('/api/admin/database/alert-rules', data);
  return response.data;
}

export async function updateAlertRule(id: number, data: {
  name?: string;
  description?: string;
  conditionType?: string;
  conditionValue?: object;
  actionType?: string;
  actionConfig?: object;
  enabled?: boolean;
  requiresApproval?: boolean;
  cooldownSeconds?: number;
}) {
  const response = await api.put(`/api/admin/database/alert-rules/${id}`, data);
  return response.data;
}

export async function deleteAlertRule(id: number) {
  const response = await api.delete(`/api/admin/database/alert-rules/${id}`);
  return response.data;
}

// Phase 5: Metrics History API
export async function getMetricsHistory(params?: {
  type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  const response = await api.get(`/api/admin/database/metrics/history?${queryParams}`);
  return response.data;
}

export async function getMetricsTrends(params?: {
  type?: string;
  period?: 'hourly' | 'daily';
  days?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.period) queryParams.append('period', params.period);
  if (params?.days) queryParams.append('days', params.days.toString());
  const response = await api.get(`/api/admin/database/metrics/trends?${queryParams}`);
  return response.data;
}

// Phase 5: Deployments API
export async function getDeployments(params?: {
  service?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.service) queryParams.append('service', params.service);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  const response = await api.get(`/api/admin/database/deployments?${queryParams}`);
  return response.data;
}

export async function getDeployment(id: number) {
  const response = await api.get(`/api/admin/database/deployments/${id}`);
  return response.data;
}

export async function createDeployment(data: {
  serviceName: string;
  version?: string;
  environment?: string;
  deployedBy?: string;
  commitHash?: string;
  commitMessage?: string;
  deploymentType?: string;
  metadata?: object;
}) {
  const response = await api.post('/api/admin/database/deployments', data);
  return response.data;
}

export async function updateDeployment(id: number, data: { status: string; metadata?: object }) {
  const response = await api.put(`/api/admin/database/deployments/${id}`, data);
  return response.data;
}

// Phase 5: Incident Executions API
export async function getIncidents(params?: {
  ruleId?: number;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.ruleId) queryParams.append('ruleId', params.ruleId.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  const response = await api.get(`/api/admin/database/incidents?${queryParams}`);
  return response.data;
}

export async function getIncident(id: number) {
  const response = await api.get(`/api/admin/database/incidents/${id}`);
  return response.data;
}

export async function createIncident(data: {
  ruleId?: number;
  triggerType: string;
  triggerReason?: string;
  actionType: string;
  actionConfig?: object;
}) {
  const response = await api.post('/api/admin/database/incidents', data);
  return response.data;
}

export async function approveIncident(id: number, approvedBy?: string) {
  const response = await api.put(`/api/admin/database/incidents/${id}/approve`, { approvedBy });
  return response.data;
}

export async function rejectIncident(id: number, rejectedBy?: string, reason?: string) {
  const response = await api.put(`/api/admin/database/incidents/${id}/reject`, { rejectedBy, reason });
  return response.data;
}
