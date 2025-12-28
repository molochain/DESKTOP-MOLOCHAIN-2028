export interface PageRoute {
  name: string;
  route: string;
  description: string;
  category: string;
  status?: 'live' | 'beta' | 'development' | 'deprecated';
  health?: 'healthy' | 'degraded' | 'down';
  component?: string;
}

export const pageRoutes: PageRoute[] = [
  // Main Pages
  { name: 'Home', route: '/', description: 'Main landing page with overview of services and features', category: 'Main', status: 'live', health: 'healthy', component: 'Home' },
  { name: 'About', route: '/about', description: 'Company information and background', category: 'Main' },
  { name: 'Services', route: '/services', description: 'Overview of all available logistics services', category: 'Main' },
  { name: 'Projects', route: '/projects', description: 'Showcase of logistics projects', category: 'Main' },
  { name: 'Project Detail', route: '/projects/:id', description: 'Individual project details', category: 'Main' },
  { name: 'Latest Projects', route: '/latest-projects', description: 'Recently completed projects', category: 'Main' },
  { name: 'Commodities', route: '/commodities', description: 'List of commodity categories', category: 'Main' },
  { name: 'Commodity Detail', route: '/commodities/:type', description: 'Specific commodity information', category: 'Main' },
  { name: 'Tracking Dashboard', route: '/tracking', description: 'Shipment tracking interface', category: 'Main' },
  { name: 'Tracking Demo', route: '/tracking/demo', description: 'Demo of tracking capabilities', category: 'Main' },
  { name: 'Quote', route: '/quote', description: 'Request quote form', category: 'Main' },
  { name: 'Tools', route: '/tools', description: 'Logistics calculation tools', category: 'Main' },
  { name: 'Contact', route: '/contact', description: 'Contact information and form', category: 'Main' },
  { name: 'Partners', route: '/partners', description: 'Partner companies list', category: 'Main' },
  { name: 'Partner Detail', route: '/partners/:id', description: 'Individual partner details', category: 'Main' },
  
  // Authentication Pages
  { name: 'Login', route: '/login', description: 'User login page', category: 'Auth' },
  { name: 'Register', route: '/register', description: 'User registration page', category: 'Auth' },
  { name: 'Request Password Reset', route: '/auth/request-password-reset', description: 'Request password reset', category: 'Auth' },
  { name: 'Reset Password', route: '/auth/reset-password', description: 'Complete password reset', category: 'Auth' },
  { name: 'User Profile', route: '/profile', description: 'User profile settings', category: 'Auth' },
  
  // Admin Pages
  { name: 'Admin Hub', route: '/adminhub', description: 'Main admin dashboard', category: 'Admin' },
  { name: 'Admin Dashboard', route: '/admin', description: 'Admin dashboard', category: 'Admin' },
  { name: 'Admin Profile', route: '/admin/profile', description: 'Admin profile settings', category: 'Admin' },
  { name: 'Content Manager', route: '/admin/content', description: 'Content management interface', category: 'Admin' },
  { name: 'Activity', route: '/admin/activity', description: 'Activity logs', category: 'Admin' },
  { name: 'WebSocket Health', route: '/admin/websocket', description: 'WebSocket health monitoring', category: 'Admin' },
  { name: 'Admin Settings', route: '/admin/settings', description: 'Admin settings', category: 'Admin' },
  
  // File Management Pages (Note: Google Drive removed - available in Plesk)
  
  // Notification Pages
  { name: 'Notifications', route: '/notifications', description: 'User notifications', category: 'Notifications' },
  
  // Developer Pages
  { name: 'API Documentation', route: '/api-docs', description: 'API documentation page', category: 'Developer' },
  { name: 'Developer Portal', route: '/developer', description: 'Developer resources and documentation', category: 'Developer' },
  { name: 'Developer Help', route: '/developer/help', description: 'Comprehensive list of all pages and APIs', category: 'Developer' },
  { name: 'WebSocket Guide', route: '/developer/websockets', description: 'Guide to using WebSockets', category: 'Developer' },
  { name: 'Auth Guide', route: '/developer/auth', description: 'Authentication guide', category: 'Developer' },
  { name: 'SDK Libraries', route: '/developer/sdks', description: 'Client libraries for popular languages', category: 'Developer' },
  { name: 'API Policies', route: '/developer/policies', description: 'API rate limits and policies', category: 'Developer' },
  { name: 'Developer Workspace', route: '/developer/workspace', description: 'Real-time collaborative development environment', category: 'Developer' },
  { name: 'Logistics API Guide', route: '/developer/logistics-api', description: 'Guide to using logistics APIs', category: 'Developer' },
  { name: 'Commodities API Guide', route: '/developer/commodities-api', description: 'Guide to using commodities APIs', category: 'Developer' },
  
  // Service Pages
  { name: 'Service Recommender', route: '/services/recommender', description: 'Service recommendation tool', category: 'Services' },
  { name: 'Agency Service', route: '/services/agency', description: 'Agency services', category: 'Services' },
  { name: 'Airfreight Service', route: '/services/airfreight', description: 'Air freight logistics', category: 'Services' },
  { name: 'Auction Service', route: '/services/auction', description: 'Auction services', category: 'Services' },
  { name: 'Technology Service', route: '/services/technology', description: 'Technology integration', category: 'Services' },
  { name: 'Bulk Service', route: '/services/bulk', description: 'Bulk shipping', category: 'Services' },
  { name: 'Business Service', route: '/services/business', description: 'Business logistics', category: 'Services' },
  { name: 'Certificates Service', route: '/services/certificates', description: 'Certification services', category: 'Services' },
  { name: 'Chartering Service', route: '/services/chartering', description: 'Vessel chartering', category: 'Services' },
  { name: 'Companies Service', route: '/services/companies', description: 'Company services', category: 'Services' },
  { name: 'Consultation Service', route: '/services/consultation', description: 'Consultation services', category: 'Services' },
  { name: 'Container Service', route: '/services/container', description: 'Container shipping', category: 'Services' },
  { name: 'Cooperation Service', route: '/services/cooperation', description: 'Business cooperation', category: 'Services' },
  { name: 'Cross-Staffing Service', route: '/services/cross-staffing', description: 'Staff exchange services', category: 'Services' },
  { name: 'Customs Service', route: '/services/customs', description: 'Customs clearance', category: 'Services' },
  { name: 'Distribution Service', route: '/services/distribution', description: 'Distribution services', category: 'Services' },
  { name: 'Documentation Service', route: '/services/documentation', description: 'Documentation services', category: 'Services' },
  { name: 'Drop Shipping Service', route: '/services/drop-shipping', description: 'Drop shipping services', category: 'Services' },
  { name: 'Ecosystem Service', route: '/services/ecosystem', description: 'Ecosystem services', category: 'Services' },
  { name: 'Education Service', route: '/services/education', description: 'Education services', category: 'Services' },
  { name: 'Events Service', route: '/services/events', description: 'Events services', category: 'Services' },
  { name: 'Export Service', route: '/services/export', description: 'Export services', category: 'Services' },
  { name: 'Finance Service', route: '/services/finance', description: 'Finance services', category: 'Services' },
  { name: 'Groupage Service', route: '/services/groupage', description: 'Groupage services', category: 'Services' },
  { name: 'Growth Service', route: '/services/growth', description: 'Growth services', category: 'Services' },
  { name: 'Help Develop Service', route: '/services/help-develop', description: 'Help develop services', category: 'Services' },
  { name: 'Investing Service', route: '/services/investing', description: 'Investing services', category: 'Services' },
  { name: 'Knowledge Service', route: '/services/knowledge', description: 'Knowledge services', category: 'Services' },
  { name: 'Logistics Market Service', route: '/services/logistics-market', description: 'Logistics market', category: 'Services' },
  { name: 'Modernization Service', route: '/services/modernization', description: 'Modernization services', category: 'Services' },
  { name: 'Network Service', route: '/services/network', description: 'Network services', category: 'Services' },
  { name: 'Online Shopping Service', route: '/services/online-shopping', description: 'Online shopping logistics', category: 'Services' },
  { name: 'Organizations Service', route: '/services/organizations', description: 'Organizations services', category: 'Services' },
  { name: 'Partnership Service', route: '/services/partnership', description: 'Partnership services', category: 'Services' },
  { name: 'Port Services', route: '/services/port-services', description: 'Port services', category: 'Services' },
  { name: 'Post Service', route: '/services/post', description: 'Postal services', category: 'Services' },
  { name: 'Project Service', route: '/services/project', description: 'Project logistics', category: 'Services' },
  { name: 'Rail Service', route: '/services/rail', description: 'Rail transportation services', category: 'Services' },
  { name: 'Shopping Service', route: '/services/shopping', description: 'Shopping and retail logistics', category: 'Services' },
  { name: 'Special Transport', route: '/services/special-transport', description: 'Special transportation requirements', category: 'Services' },
  { name: 'Supply Chain', route: '/services/supply-chain', description: 'Supply chain management solutions', category: 'Services' },
  { name: 'Third Party Logistics', route: '/services/third-party', description: '3PL service offerings', category: 'Services' },
  { name: 'Tranship Service', route: '/services/tranship', description: 'Transhipment and cargo handling', category: 'Services' },
  { name: 'Transit Service', route: '/services/transit', description: 'Transit and cross-border logistics', category: 'Services' },
  { name: 'Trading Service', route: '/services/trading', description: 'Trading and import/export services', category: 'Services' },
  { name: 'Trucking Service', route: '/services/trucking', description: 'Trucking and road freight options', category: 'Services' },
  { name: 'Warehousing Service', route: '/services/warehousing', description: 'Warehousing and storage solutions', category: 'Services' },
  
  // System Pages
  { name: 'Not Found (404)', route: '*', description: '404 error page', category: 'System' },
];