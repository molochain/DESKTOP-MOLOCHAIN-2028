// RAYANAVABRAIN API Service Functions

interface SyncRequest {
  projectId: string;
  syncType: 'manual' | 'automatic' | 'full' | 'partial';
  timestamp: string;
  data?: any;
}

interface SyncResponse {
  success: boolean;
  message: string;
  timestamp: string;
  syncedItems?: number;
}

// Base API configuration
const RAYANAVABRAIN_API_BASE = '/api';

// Helper function to get API headers with authentication
export const getAuthHeaders = (apiKey?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  return headers;
};

// Test connection to RAYANAVABRAIN
export const testConnection = async (apiKey: string) => {
  const response = await fetch(`${RAYANAVABRAIN_API_BASE}/sync/status`, {
    headers: getAuthHeaders(apiKey),
  });
  
  if (!response.ok) {
    throw new Error('Connection failed');
  }
  
  return response.json();
};

// Request manual sync
export const requestSync = async (apiKey: string, request: SyncRequest): Promise<SyncResponse> => {
  const response = await fetch(`${RAYANAVABRAIN_API_BASE}/sync/request`, {
    method: 'POST',
    headers: getAuthHeaders(apiKey),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Sync request failed');
  }
  
  return response.json();
};

// Get dashboard statistics
export const getDashboardStats = async (apiKey: string) => {
  const response = await fetch(`${RAYANAVABRAIN_API_BASE}/public/dashboard/stats`, {
    headers: getAuthHeaders(apiKey),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  
  return response.json();
};

// Get departments data
export const getDepartments = async (apiKey: string) => {
  const response = await fetch(`${RAYANAVABRAIN_API_BASE}/public/departments`, {
    headers: getAuthHeaders(apiKey),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }
  
  return response.json();
};

// Subscribe to webhook events
export const subscribeToWebhook = async (apiKey: string, url: string, events: string[]) => {
  const response = await fetch(`${RAYANAVABRAIN_API_BASE}/webhooks/subscribe`, {
    method: 'POST',
    headers: getAuthHeaders(apiKey),
    body: JSON.stringify({
      url,
      events,
      headers: {},
    }),
  });
  
  if (!response.ok) {
    throw new Error('Webhook subscription failed');
  }
  
  return response.json();
};

// Unsubscribe from webhook
export const unsubscribeFromWebhook = async (apiKey: string, subscriptionId: string) => {
  const response = await fetch(`${RAYANAVABRAIN_API_BASE}/webhooks/unsubscribe`, {
    method: 'POST',
    headers: getAuthHeaders(apiKey),
    body: JSON.stringify({
      subscriptionId,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Webhook unsubscription failed');
  }
  
  return response.json();
};