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
