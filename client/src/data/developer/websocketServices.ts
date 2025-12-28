export interface WebSocketService {
  name: string;
  path: string;
  description: string;
  category: string;
  status?: 'live' | 'beta' | 'development' | 'deprecated';
  health?: 'healthy' | 'degraded' | 'down';
  clientComponents?: string[];
}

export const websocketServices: WebSocketService[] = [
  // Main WebSockets
  { name: 'Main WebSocket', path: '/ws', description: 'Main WebSocket service for real-time updates', category: 'Main', status: 'live', health: 'healthy' },
  { name: 'Notification WebSocket', path: '/ws/notifications', description: 'Real-time user notifications', category: 'Main', status: 'live', health: 'healthy' },
  
  // Collaboration WebSockets
  { name: 'Collaboration WebSocket', path: '/ws/collaboration', description: 'Real-time document collaboration', category: 'Collaboration' },
  { name: 'Document Editing WebSocket', path: '/ws/documents/edit', description: 'Real-time document editing', category: 'Collaboration' },
  { name: 'Project Collaboration WebSocket', path: '/ws/projects/:id/collaboration', description: 'Project-specific collaboration', category: 'Collaboration' },
  
  // Tracking WebSockets
  { name: 'Tracking WebSocket', path: '/ws/tracking', description: 'Real-time shipment tracking updates', category: 'Tracking' },
  { name: 'Shipment Events WebSocket', path: '/ws/tracking/events', description: 'Real-time shipment events', category: 'Tracking' },
  { name: 'Delivery Updates WebSocket', path: '/ws/tracking/delivery', description: 'Real-time delivery status updates', category: 'Tracking' },
  
  // Communication WebSockets
  { name: 'Contact WebSocket', path: '/ws/contact', description: 'Real-time agent status and chat', category: 'Communication' },
  { name: 'Commodity Chat Service', path: '/ws/commodity-chat', description: 'Commodity-specific chat service', category: 'Communication' },
  { name: 'Customer Support WebSocket', path: '/ws/support', description: 'Real-time customer support chat', category: 'Communication' },
  
  // Admin WebSockets
  { name: 'Admin Activity WebSocket', path: '/ws/admin/activity', description: 'Real-time admin activity monitoring', category: 'Admin' },
  { name: 'System Monitoring WebSocket', path: '/ws/admin/monitoring', description: 'Real-time system monitoring', category: 'Admin' },
  { name: 'WebSocket Health WebSocket', path: '/ws/admin/websocket-health', description: 'WebSocket connection health monitoring', category: 'Admin' }
];