export interface ApiRoute {
  name: string;
  route?: string;
  method: string;
  endpoint?: string;
  description: string;
  category: string;
  version?: string;
  status?: 'live' | 'beta' | 'development' | 'deprecated';
  lastUpdated?: string;
  health?: 'healthy' | 'degraded' | 'down';
  relatedServices?: string[];
  requiredServices?: string[];
  deprecated?: boolean;
  deprecationDate?: string;
  replacedBy?: string;
}

export const apiRoutes: ApiRoute[] = [
  // Authentication APIs
  { name: 'Get Current User', route: '/api/auth/me', endpoint: '/api/auth/me', method: 'GET', description: 'Get current user information', category: 'Auth', version: 'v1', status: 'live', lastUpdated: '2025-01-15', health: 'healthy' },
  { name: 'Login', route: '/api/auth/login', endpoint: '/api/auth/login', method: 'POST', description: 'Login endpoint', category: 'Auth', version: 'v1', status: 'live', lastUpdated: '2025-01-15', health: 'healthy' },
  { name: 'Logout', route: '/api/auth/logout', endpoint: '/api/auth/logout', method: 'POST', description: 'Logout endpoint', category: 'Auth', version: 'v1', status: 'live', lastUpdated: '2025-01-15', health: 'healthy' },
  { name: 'Register', route: '/api/auth/register', endpoint: '/api/auth/register', method: 'POST', description: 'Registration endpoint', category: 'Auth', version: 'v1', status: 'live', lastUpdated: '2025-01-15', health: 'healthy' },
  { name: 'Get User Session', route: '/api/auth/session', endpoint: '/api/auth/session', method: 'GET', description: 'Get current session information', category: 'Auth', version: 'v1', status: 'deprecated', lastUpdated: '2024-12-01', health: 'degraded', deprecated: true, deprecationDate: '2025-06-01', replacedBy: 'Get Current User' },
  { name: 'Request Password Reset', route: '/api/auth/request-reset', method: 'POST', description: 'Request password reset email', category: 'Auth' },
  { name: 'Reset Password', route: '/api/auth/reset-password', method: 'POST', description: 'Complete password reset', category: 'Auth' },
  
  // Project APIs
  { name: 'Get Projects', route: '/api/projects', method: 'GET', description: 'List all projects', category: 'Projects' },
  { name: 'Get Project', route: '/api/projects/:id', method: 'GET', description: 'Get project details', category: 'Projects' },
  { name: 'Create Project', route: '/api/projects', method: 'POST', description: 'Create a new project', category: 'Projects' },
  { name: 'Update Project', route: '/api/projects/:id', method: 'PUT', description: 'Update project details', category: 'Projects' },
  { name: 'Delete Project', route: '/api/projects/:id', method: 'DELETE', description: 'Delete a project', category: 'Projects' },
  { name: 'Get Project Milestones', route: '/api/projects/:id/milestones', method: 'GET', description: 'Get project milestones', category: 'Projects' },
  { name: 'Get Project Timeline', route: '/api/projects/:id/timeline', method: 'GET', description: 'Get project timeline', category: 'Projects' },
  { name: 'Get Project Participants', route: '/api/projects/:id/participants', method: 'GET', description: 'Get project participants', category: 'Projects' },
  { name: 'Get Latest Projects', route: '/api/projects/latest', method: 'GET', description: 'Get most recent projects', category: 'Projects' },
  
  // Service APIs
  { name: 'Get Services', route: '/api/services', method: 'GET', description: 'List all services', category: 'Services' },
  { name: 'Get Service', route: '/api/services/:id', method: 'GET', description: 'Get service details', category: 'Services' },
  { name: 'Get Service Availability', route: '/api/services/:id/availability', method: 'GET', description: 'Check service availability', category: 'Services' },
  { name: 'Get Service Pricing', route: '/api/services/:id/pricing', method: 'GET', description: 'Get service pricing information', category: 'Services' },
  { name: 'Get Service Categories', route: '/api/services/categories', method: 'GET', description: 'Get service categories', category: 'Services' },
  { name: 'Book Service', route: '/api/services/:id/book', method: 'POST', description: 'Book a service', category: 'Services' },
  { name: 'Get Service Recommendations', route: '/api/services/recommend', method: 'POST', description: 'Get service recommendations', category: 'Services' },
  
  // Commodity APIs
  { name: 'Get Commodities', route: '/api/commodities', method: 'GET', description: 'List all commodities', category: 'Commodities' },
  { name: 'Get Commodity', route: '/api/commodities/:type', method: 'GET', description: 'Get commodity details', category: 'Commodities' },
  { name: 'Get Commodity Pricing', route: '/api/commodities/:type/pricing', method: 'GET', description: 'Get commodity pricing data', category: 'Commodities' },
  { name: 'Get Commodity Availability', route: '/api/commodities/:type/availability', method: 'GET', description: 'Check commodity availability', category: 'Commodities' },
  { name: 'Get Commodity Categories', route: '/api/commodities/categories', method: 'GET', description: 'Get commodity categories', category: 'Commodities' },
  
  // Quote APIs
  { name: 'Submit Quote', route: '/api/quote', method: 'POST', description: 'Submit quote request', category: 'Quotes' },
  { name: 'Get Quote Status', route: '/api/quote/:id', method: 'GET', description: 'Check quote request status', category: 'Quotes' },
  { name: 'Get Quick Quote', route: '/api/quote/quick', method: 'POST', description: 'Get quick quote estimate', category: 'Quotes' },
  
  // Tracking APIs
  { name: 'Get Tracking', route: '/api/tracking/:trackingId', method: 'GET', description: 'Get tracking information', category: 'Tracking' },
  { name: 'Get Demo Tracking', route: '/api/tracking/demo', method: 'GET', description: 'Get demo tracking data', category: 'Tracking' },
  { name: 'Get Tracking History', route: '/api/tracking/:trackingId/history', method: 'GET', description: 'Get tracking history', category: 'Tracking' },
  { name: 'Get Tracking Events', route: '/api/tracking/:trackingId/events', method: 'GET', description: 'Get tracking events', category: 'Tracking' },
  { name: 'Create Tracking', route: '/api/tracking', method: 'POST', description: 'Create tracking record', category: 'Tracking' },
  { name: 'Update Tracking', route: '/api/tracking/:trackingId', method: 'PUT', description: 'Update tracking information', category: 'Tracking' },
  
  // File APIs
  { name: 'Get Files', route: '/api/files', method: 'GET', description: 'List files', category: 'Files' },
  { name: 'Get File', route: '/api/files/:id', method: 'GET', description: 'Get file details', category: 'Files' },
  { name: 'Upload File', route: '/api/files', method: 'POST', description: 'Upload file', category: 'Files' },
  { name: 'Delete File', route: '/api/files/:id', method: 'DELETE', description: 'Delete file', category: 'Files' },
  { name: 'Update File', route: '/api/files/:id', method: 'PUT', description: 'Update file metadata', category: 'Files' },
  { name: 'Get File Versions', route: '/api/files/:id/versions', method: 'GET', description: 'Get file version history', category: 'Files' },
  { name: 'Download File', route: '/api/files/:id/download', method: 'GET', description: 'Download file', category: 'Files' },
  
  // Google Drive APIs
  { name: 'Connect Google Drive', route: '/api/drive/connect', method: 'POST', description: 'Connect Google Drive', category: 'Drive' },
  { name: 'List Drive Files', route: '/api/drive/files', method: 'GET', description: 'List Google Drive files', category: 'Drive' },
  { name: 'Upload to Drive', route: '/api/drive/upload', method: 'POST', description: 'Upload to Google Drive', category: 'Drive' },
  { name: 'Delete from Drive', route: '/api/drive/files/:id', method: 'DELETE', description: 'Delete file from Google Drive', category: 'Drive' },
  { name: 'Share Drive File', route: '/api/drive/files/:id/share', method: 'POST', description: 'Share Google Drive file', category: 'Drive' },
  { name: 'Get Drive File Details', route: '/api/drive/files/:id', method: 'GET', description: 'Get Google Drive file details', category: 'Drive' },
  
  // Collaboration APIs
  { name: 'Get Collaboration Sessions', route: '/api/collaboration/sessions', method: 'GET', description: 'List collaboration sessions', category: 'Collaboration' },
  { name: 'Get Collaboration Session', route: '/api/collaboration/sessions/:id', method: 'GET', description: 'Get session details', category: 'Collaboration' },
  { name: 'Create Collaboration Session', route: '/api/collaboration/sessions', method: 'POST', description: 'Create new collaboration session', category: 'Collaboration' },
  { name: 'Join Collaboration Session', route: '/api/collaboration/sessions/:id/join', method: 'POST', description: 'Join existing collaboration session', category: 'Collaboration' },
  { name: 'Leave Collaboration Session', route: '/api/collaboration/sessions/:id/leave', method: 'POST', description: 'Leave collaboration session', category: 'Collaboration' },
  { name: 'Get Session Participants', route: '/api/collaboration/sessions/:id/participants', method: 'GET', description: 'Get session participants', category: 'Collaboration' },
  
  // Partner APIs
  { name: 'Get Product Types', route: '/api/product-types', method: 'GET', description: 'Get all product types', category: 'Partners' },
  { name: 'Get Partners', route: '/api/partners', method: 'GET', description: 'Get a list of all business partners', category: 'Partners' },
  { name: 'Get Partner Details', route: '/api/partners/:id', method: 'GET', description: 'Get details of a specific partner', category: 'Partners' },
  { name: 'Get Partner Services', route: '/api/partners/:id/services', method: 'GET', description: 'Get services offered by a partner', category: 'Partners' },
  
  // User APIs
  { name: 'Get User Profile', route: '/api/users/:id', method: 'GET', description: 'Get user profile details', category: 'Users' },
  { name: 'Update User Profile', route: '/api/users/:id', method: 'PUT', description: 'Update user profile', category: 'Users' },
  { name: 'Get User Activity', route: '/api/users/:id/activity', method: 'GET', description: 'Get user activity log', category: 'Users' },
  { name: 'Get User Notifications', route: '/api/users/:id/notifications', method: 'GET', description: 'Get user notifications', category: 'Users' },
  
  // Admin APIs
  { name: 'Get System Status', route: '/api/admin/status', method: 'GET', description: 'Get system status information', category: 'Admin' },
  { name: 'Get System Metrics', route: '/api/admin/metrics', method: 'GET', description: 'Get system performance metrics', category: 'Admin' },
  { name: 'Get All Users', route: '/api/admin/users', method: 'GET', description: 'Get all user accounts', category: 'Admin' },
  { name: 'Get WebSocket Status', route: '/api/admin/websocket/status', method: 'GET', description: 'Get WebSocket connection status', category: 'Admin' },
  { name: 'Manage Content', route: '/api/admin/content', method: 'GET', description: 'Get content management details', category: 'Admin' },
  
  // Tools APIs
  { name: 'Calculate Shipping', route: '/api/tools/calculate-shipping', method: 'POST', description: 'Calculate shipping costs', category: 'Tools' },
  { name: 'Convert Units', route: '/api/tools/convert', method: 'POST', description: 'Convert between measurement units', category: 'Tools' },
  { name: 'Calculate Transit Time', route: '/api/tools/transit-time', method: 'POST', description: 'Calculate estimated transit time', category: 'Tools' }
];