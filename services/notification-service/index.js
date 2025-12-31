const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const cron = require('node-cron');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const DB_ADMIN_URL = process.env.DB_ADMIN_URL || 'http://molochain-db-admin:7003';
const SSL_CHECKER_URL = process.env.SSL_CHECKER_URL || 'http://ssl-checker:7002';
const CONTAINER_MONITOR_URL = process.env.CONTAINER_MONITOR_URL || 'http://container-monitor:7004';

if (!INTERNAL_API_KEY) {
  console.error('FATAL: INTERNAL_API_KEY environment variable is required');
  process.exit(1);
}

const authenticateInternal = (req, res, next) => {
  const apiKey = req.headers['x-internal-api-key'];
  if (!apiKey || apiKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Internal access only' });
  }
  next();
};

const pool = new Pool({
  host: process.env.PGHOST || 'molochain-db',
  port: parseInt(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'molochain',
  user: process.env.PGUSER || 'molochain',
  password: process.env.PGPASSWORD || 'molochain_secure_password',
  max: 3,
  idleTimeoutMillis: 30000,
});

async function initPreferencesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_notification_preferences (
        user_id VARCHAR(100) PRIMARY KEY,
        container_alerts BOOLEAN DEFAULT true,
        ssl_alerts BOOLEAN DEFAULT true,
        backup_alerts BOOLEAN DEFAULT true,
        security_alerts BOOLEAN DEFAULT true,
        threshold_cpu FLOAT DEFAULT 90,
        threshold_memory FLOAT DEFAULT 90,
        threshold_disk FLOAT DEFAULT 85,
        ssl_expiry_warning_days INTEGER DEFAULT 30,
        email_enabled BOOLEAN DEFAULT false,
        push_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('[NOTIFY] Notification preferences table initialized');
  } catch (err) {
    console.error('[NOTIFY] Failed to initialize preferences table:', err.message);
  }
}

initPreferencesTable();

const connectedClients = new Map();
const alertHistory = [];
const MAX_ALERT_HISTORY = 100;

function addToHistory(alert) {
  alertHistory.unshift(alert);
  if (alertHistory.length > MAX_ALERT_HISTORY) {
    alertHistory.pop();
  }
}

async function broadcastAlert(alert) {
  const timestamp = new Date().toISOString();
  const fullAlert = { ...alert, timestamp, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
  
  addToHistory(fullAlert);
  
  console.log(`[NOTIFY] Broadcasting alert: ${alert.type} - ${alert.title}`);
  
  for (const [socketId, client] of connectedClients) {
    try {
      const prefs = await getPreferences(client.userId);
      
      if (shouldSendAlert(alert.type, prefs)) {
        io.to(socketId).emit('alert', fullAlert);
      }
    } catch (err) {
      io.to(socketId).emit('alert', fullAlert);
    }
  }
  
  return fullAlert;
}

function shouldSendAlert(alertType, prefs) {
  if (!prefs) return true;
  
  switch (alertType) {
    case 'container_restart':
    case 'container_unhealthy':
    case 'container_down':
      return prefs.container_alerts;
    case 'ssl_expiring':
    case 'ssl_expired':
    case 'ssl_invalid':
      return prefs.ssl_alerts;
    case 'backup_complete':
    case 'backup_failed':
      return prefs.backup_alerts;
    case 'security_alert':
    case 'auth_failure':
      return prefs.security_alerts;
    case 'threshold_cpu':
      return prefs.container_alerts;
    case 'threshold_memory':
      return prefs.container_alerts;
    case 'threshold_disk':
      return prefs.container_alerts;
    default:
      return true;
  }
}

async function getPreferences(userId) {
  if (!userId) return null;
  try {
    const result = await pool.query(
      'SELECT * FROM admin_notification_preferences WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    return null;
  }
}

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;
  
  socket.userId = userId || 'anonymous';
  next();
});

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id} (user: ${socket.userId})`);
  
  connectedClients.set(socket.id, {
    userId: socket.userId,
    connectedAt: new Date()
  });
  
  socket.emit('connected', {
    message: 'Connected to notification service',
    clientId: socket.id,
    recentAlerts: alertHistory.slice(0, 10)
  });
  
  socket.on('subscribe', (preferences) => {
    console.log(`[WS] Client ${socket.id} updated preferences`);
  });
  
  socket.on('acknowledge', (alertId) => {
    console.log(`[WS] Alert ${alertId} acknowledged by ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
    connectedClients.delete(socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'notification-service',
    connectedClients: connectedClients.size,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/notify/broadcast', authenticateInternal, async (req, res) => {
  const { type, title, message, severity, data } = req.body;
  
  if (!type || !title) {
    return res.status(400).json({ error: 'Type and title are required' });
  }
  
  const alert = await broadcastAlert({
    type,
    title,
    message: message || '',
    severity: severity || 'info',
    data: data || {}
  });
  
  res.json({ success: true, alert });
});

app.get('/api/notify/history', authenticateInternal, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  res.json({ alerts: alertHistory.slice(0, limit) });
});

app.get('/api/notify/status', authenticateInternal, (req, res) => {
  res.json({
    connectedClients: connectedClients.size,
    alertHistorySize: alertHistory.length,
    clients: Array.from(connectedClients.entries()).map(([id, client]) => ({
      id,
      userId: client.userId,
      connectedAt: client.connectedAt
    }))
  });
});

app.get('/api/notify/preferences/:userId', authenticateInternal, async (req, res) => {
  const { userId } = req.params;
  const prefs = await getPreferences(userId);
  
  if (!prefs) {
    return res.json({
      user_id: userId,
      container_alerts: true,
      ssl_alerts: true,
      backup_alerts: true,
      security_alerts: true,
      threshold_cpu: 90,
      threshold_memory: 90,
      threshold_disk: 85,
      ssl_expiry_warning_days: 30,
      email_enabled: false,
      push_enabled: true
    });
  }
  
  res.json(prefs);
});

app.put('/api/notify/preferences/:userId', authenticateInternal, async (req, res) => {
  const { userId } = req.params;
  const {
    container_alerts,
    ssl_alerts,
    backup_alerts,
    security_alerts,
    threshold_cpu,
    threshold_memory,
    threshold_disk,
    ssl_expiry_warning_days,
    email_enabled,
    push_enabled
  } = req.body;
  
  try {
    await pool.query(`
      INSERT INTO admin_notification_preferences (
        user_id, container_alerts, ssl_alerts, backup_alerts, security_alerts,
        threshold_cpu, threshold_memory, threshold_disk, ssl_expiry_warning_days,
        email_enabled, push_enabled, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        container_alerts = EXCLUDED.container_alerts,
        ssl_alerts = EXCLUDED.ssl_alerts,
        backup_alerts = EXCLUDED.backup_alerts,
        security_alerts = EXCLUDED.security_alerts,
        threshold_cpu = EXCLUDED.threshold_cpu,
        threshold_memory = EXCLUDED.threshold_memory,
        threshold_disk = EXCLUDED.threshold_disk,
        ssl_expiry_warning_days = EXCLUDED.ssl_expiry_warning_days,
        email_enabled = EXCLUDED.email_enabled,
        push_enabled = EXCLUDED.push_enabled,
        updated_at = NOW()
    `, [
      userId,
      container_alerts ?? true,
      ssl_alerts ?? true,
      backup_alerts ?? true,
      security_alerts ?? true,
      threshold_cpu ?? 90,
      threshold_memory ?? 90,
      threshold_disk ?? 85,
      ssl_expiry_warning_days ?? 30,
      email_enabled ?? false,
      push_enabled ?? true
    ]);
    
    const prefs = await getPreferences(userId);
    res.json({ success: true, preferences: prefs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function checkSSLCertificates() {
  console.log('[MONITOR] Checking SSL certificates...');
  try {
    const response = await axios.get(`${SSL_CHECKER_URL}/api/ssl/domains`, {
      headers: { 'X-Internal-Api-Key': INTERNAL_API_KEY }
    });
    
    const domains = response.data?.domains || [];
    
    for (const domain of domains) {
      if (domain.status === 'expired') {
        await broadcastAlert({
          type: 'ssl_expired',
          title: 'SSL Certificate Expired',
          message: `SSL certificate for ${domain.domain} has expired`,
          severity: 'error',
          data: { domain: domain.domain, expiry: domain.validTo }
        });
      } else if (domain.status === 'expiring_soon' || domain.daysUntilExpiry < 30) {
        await broadcastAlert({
          type: 'ssl_expiring',
          title: 'SSL Certificate Expiring Soon',
          message: `SSL certificate for ${domain.domain} expires in ${domain.daysUntilExpiry} days`,
          severity: 'warning',
          data: { domain: domain.domain, daysRemaining: domain.daysUntilExpiry }
        });
      } else if (domain.status === 'invalid' || domain.status === 'error') {
        await broadcastAlert({
          type: 'ssl_invalid',
          title: 'SSL Certificate Invalid',
          message: `SSL certificate for ${domain.domain} is invalid: ${domain.error || 'Unknown error'}`,
          severity: 'error',
          data: { domain: domain.domain, error: domain.error }
        });
      }
    }
  } catch (err) {
    console.error('[MONITOR] SSL check failed:', err.message);
  }
}

async function checkContainerHealth() {
  console.log('[MONITOR] Checking container health...');
  try {
    const response = await axios.get(`${CONTAINER_MONITOR_URL}/api/monitor/containers`, {
      headers: { 'X-Internal-Api-Key': INTERNAL_API_KEY }
    });
    
    const containers = response.data?.containers || [];
    
    for (const container of containers) {
      if (container.state === 'exited' || container.state === 'dead') {
        await broadcastAlert({
          type: 'container_down',
          title: 'Container Down',
          message: `Container ${container.name} is ${container.state}`,
          severity: 'error',
          data: { containerId: container.id, containerName: container.name, state: container.state }
        });
      }
    }
  } catch (err) {
    console.error('[MONITOR] Container check failed:', err.message);
  }
}

cron.schedule('0 */6 * * *', checkSSLCertificates, { timezone: 'UTC' });
cron.schedule('*/5 * * * *', checkContainerHealth, { timezone: 'UTC' });

console.log('[NOTIFY] SSL check scheduled: every 6 hours');
console.log('[NOTIFY] Container health check scheduled: every 5 minutes');

const PORT = process.env.PORT || 7005;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Notification Service running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
