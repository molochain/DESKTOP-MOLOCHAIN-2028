const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

const BACKUP_DIR = '/var/backups/postgres';
const BACKUP_RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS) || 7;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

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
  max: 5,
  idleTimeoutMillis: 30000,
});

async function initAuditTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        action VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        user_id VARCHAR(100),
        user_email VARCHAR(255),
        ip_address VARCHAR(45),
        details JSONB,
        severity VARCHAR(20) DEFAULT 'info',
        success BOOLEAN DEFAULT true
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON admin_audit_logs(timestamp DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs(action)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_category ON admin_audit_logs(category)`);
    console.log('Audit logs table initialized');
  } catch (err) {
    console.error('Failed to initialize audit table:', err.message);
  }
}

async function logAudit(action, category, details = {}, req = null, success = true, severity = 'info') {
  try {
    const userId = req?.headers['x-user-id'] || null;
    const userEmail = req?.headers['x-user-email'] || null;
    const ipAddress = req?.headers['x-real-ip'] || req?.headers['x-forwarded-for'] || req?.ip || null;
    
    await pool.query(`
      INSERT INTO admin_audit_logs (action, category, user_id, user_email, ip_address, details, severity, success)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [action, category, userId, userEmail, ipAddress, JSON.stringify(details), severity, success]);
  } catch (err) {
    console.error('Failed to log audit event:', err.message);
  }
}

initAuditTable();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'database-admin', timestamp: new Date().toISOString() });
});

app.get('/api/database/tables', authenticateInternal, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.table_name,
        t.table_type,
        pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name))) as size,
        (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
        COALESCE(s.n_live_tup, 0) as row_count
      FROM information_schema.tables t
      LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name
    `);
    res.json({ tables: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/database/tables/:name', authenticateInternal, async (req, res) => {
  try {
    const { name } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;

    const safeName = name.replace(/[^a-zA-Z0-9_]/g, '');

    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [safeName]);

    const countResult = await pool.query(`SELECT count(*) as total FROM "${safeName}"`);
    const total = parseInt(countResult.rows[0]?.total || 0);

    const dataResult = await pool.query(`SELECT * FROM "${safeName}" LIMIT $1 OFFSET $2`, [limit, offset]);

    res.json({
      table: safeName,
      columns: columnsResult.rows,
      rows: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/database/query', authenticateInternal, async (req, res) => {
  const { query } = req.body;
  try {
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const upperQuery = query.trim().toUpperCase();
    if (!upperQuery.startsWith('SELECT') && !upperQuery.startsWith('EXPLAIN') && !upperQuery.startsWith('SHOW')) {
      return res.status(403).json({ error: 'Only SELECT, EXPLAIN, and SHOW queries are allowed for safety' });
    }

    const forbidden = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE'];
    for (const word of forbidden) {
      if (upperQuery.includes(word)) {
        return res.status(403).json({ error: `Query contains forbidden keyword: ${word}` });
      }
    }

    const startTime = Date.now();
    const result = await pool.query(query);
    const duration = Date.now() - startTime;

    await logAudit('sql_query', 'database', { query: query.substring(0, 500), rowCount: result.rowCount, duration }, req, true, 'info');

    res.json({
      columns: result.fields.map(f => f.name),
      rows: result.rows,
      rowCount: result.rowCount,
      duration,
    });
  } catch (err) {
    await logAudit('sql_query', 'database', { query: (query || '').substring(0, 500), error: err.message }, req, false, 'warning');
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/database/stats', authenticateInternal, async (req, res) => {
  try {
    const sizeResult = await pool.query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
    const tablesResult = await pool.query(`SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public'`);
    const connectionsResult = await pool.query(`SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()`);
    const versionResult = await pool.query(`SELECT version()`);

    res.json({
      databaseName: process.env.PGDATABASE || 'molochain',
      size: sizeResult.rows[0]?.size || 'N/A',
      tableCount: parseInt(tablesResult.rows[0]?.count || 0),
      activeConnections: parseInt(connectionsResult.rows[0]?.count || 0),
      version: versionResult.rows[0]?.version?.split(' ').slice(0, 2).join(' ') || 'Unknown',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/database/backups', authenticateInternal, async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({ backups: [] });
    }
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql') || f.endsWith('.sql.gz'))
      .map(f => {
        const stat = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          name: f,
          size: stat.size,
          sizeFormatted: formatBytes(stat.size),
          created: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    res.json({ backups: files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/database/backup', authenticateInternal, async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `molochain_${timestamp}.sql.gz`;
    const filepath = path.join(BACKUP_DIR, filename);

    const env = {
      ...process.env,
      PGHOST: process.env.PGHOST || 'molochain-db',
      PGPORT: process.env.PGPORT || '5432',
      PGDATABASE: process.env.PGDATABASE || 'molochain',
      PGUSER: process.env.PGUSER || 'molochain',
      PGPASSWORD: process.env.PGPASSWORD,
    };

    execSync(`pg_dump | gzip > "${filepath}"`, { env, shell: '/bin/sh' });

    const stat = fs.statSync(filepath);
    const backup = {
      name: filename,
      size: stat.size,
      sizeFormatted: formatBytes(stat.size),
      created: stat.mtime.toISOString(),
    };
    
    await logAudit('database_backup', 'database', { filename, size: backup.sizeFormatted }, req, true, 'info');
    
    res.json({ success: true, backup });
  } catch (err) {
    await logAudit('database_backup', 'database', { error: err.message }, req, false, 'error');
    res.status(500).json({ error: `Backup failed: ${err.message}` });
  }
});

app.post('/api/database/restore', authenticateInternal, async (req, res) => {
  try {
    const { filename, confirm } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    if (confirm !== 'RESTORE') {
      return res.status(400).json({ error: 'Confirmation required. Send confirm: "RESTORE"' });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filepath = path.join(BACKUP_DIR, safeFilename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    const env = {
      ...process.env,
      PGHOST: process.env.PGHOST || 'molochain-db',
      PGPORT: process.env.PGPORT || '5432',
      PGDATABASE: process.env.PGDATABASE || 'molochain',
      PGUSER: process.env.PGUSER || 'molochain',
      PGPASSWORD: process.env.PGPASSWORD,
    };

    const isGzipped = safeFilename.endsWith('.gz');
    const restoreCmd = isGzipped
      ? `gunzip -c "${filepath}" | psql`
      : `psql < "${filepath}"`;

    execSync(restoreCmd, { env, shell: '/bin/sh' });

    await logAudit('database_restore', 'database', { filename: safeFilename }, req, true, 'warning');
    
    res.json({ success: true, message: `Database restored from ${safeFilename}` });
  } catch (err) {
    await logAudit('database_restore', 'database', { filename: safeFilename, error: err.message }, req, false, 'error');
    res.status(500).json({ error: `Restore failed: ${err.message}` });
  }
});

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

app.get('/api/audit/logs', authenticateInternal, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const action = req.query.action;
    const severity = req.query.severity;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const search = req.query.search;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (action) {
      whereClause += ` AND action ILIKE $${paramIndex++}`;
      params.push(`%${action}%`);
    }
    if (severity) {
      whereClause += ` AND severity = $${paramIndex++}`;
      params.push(severity);
    }
    if (startDate) {
      whereClause += ` AND timestamp >= $${paramIndex++}`;
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND timestamp <= $${paramIndex++}`;
      params.push(endDate);
    }
    if (search) {
      whereClause += ` AND (action ILIKE $${paramIndex} OR user_email ILIKE $${paramIndex} OR details::text ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT count(*) as total FROM admin_audit_logs ${whereClause}`, params);
    const total = parseInt(countResult.rows[0]?.total || 0);

    const logsResult = await pool.query(
      `SELECT * FROM admin_audit_logs ${whereClause} ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      logs: logsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/audit/stats', authenticateInternal, async (req, res) => {
  try {
    const totalResult = await pool.query(`SELECT count(*) as total FROM admin_audit_logs`);
    const todayResult = await pool.query(`SELECT count(*) as today FROM admin_audit_logs WHERE timestamp >= CURRENT_DATE`);
    const failedResult = await pool.query(`SELECT count(*) as failed FROM admin_audit_logs WHERE success = false`);
    const categoriesResult = await pool.query(`
      SELECT category, count(*) as count 
      FROM admin_audit_logs 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const recentResult = await pool.query(`
      SELECT action, category, timestamp, user_email, success 
      FROM admin_audit_logs 
      ORDER BY timestamp DESC 
      LIMIT 5
    `);

    res.json({
      total: parseInt(totalResult.rows[0]?.total || 0),
      today: parseInt(todayResult.rows[0]?.today || 0),
      failed: parseInt(failedResult.rows[0]?.failed || 0),
      byCategory: categoriesResult.rows,
      recent: recentResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit/log', authenticateInternal, async (req, res) => {
  try {
    const { action, category, details, severity, success } = req.body;
    if (!action || !category) {
      return res.status(400).json({ error: 'Action and category are required' });
    }
    await logAudit(action, category, details || {}, req, success !== false, severity || 'info');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function performAutomatedBackup() {
  console.log('[AUTO-BACKUP] Starting scheduled backup...');
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `molochain_auto_${timestamp}.sql.gz`;
    const filepath = path.join(BACKUP_DIR, filename);

    const env = {
      ...process.env,
      PGHOST: process.env.PGHOST || 'molochain-db',
      PGPORT: process.env.PGPORT || '5432',
      PGDATABASE: process.env.PGDATABASE || 'molochain',
      PGUSER: process.env.PGUSER || 'molochain',
      PGPASSWORD: process.env.PGPASSWORD,
    };

    execSync(`pg_dump | gzip > "${filepath}"`, { env, shell: '/bin/sh' });

    const stat = fs.statSync(filepath);
    console.log(`[AUTO-BACKUP] Backup created: ${filename} (${formatBytes(stat.size)})`);
    
    await logAudit('automated_backup', 'database', { 
      filename, 
      size: formatBytes(stat.size),
      type: 'scheduled'
    }, null, true, 'info');
    
    await cleanupOldBackups();
    return { success: true, filename };
  } catch (err) {
    console.error('[AUTO-BACKUP] Backup failed:', err.message);
    await logAudit('automated_backup', 'database', { error: err.message }, null, false, 'error');
    return { success: false, error: err.message };
  }
}

async function cleanupOldBackups() {
  console.log(`[AUTO-BACKUP] Cleaning up backups older than ${BACKUP_RETENTION_DAYS} days...`);
  try {
    if (!fs.existsSync(BACKUP_DIR)) return;
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('molochain_') && (f.endsWith('.sql') || f.endsWith('.sql.gz')));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - BACKUP_RETENTION_DAYS);
    
    let deletedCount = 0;
    for (const file of files) {
      const filepath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(filepath);
      if (stat.mtime < cutoffDate) {
        fs.unlinkSync(filepath);
        deletedCount++;
        console.log(`[AUTO-BACKUP] Deleted old backup: ${file}`);
      }
    }
    
    if (deletedCount > 0) {
      await logAudit('backup_cleanup', 'database', { 
        deletedCount, 
        retentionDays: BACKUP_RETENTION_DAYS 
      }, null, true, 'info');
    }
    console.log(`[AUTO-BACKUP] Cleanup complete. Removed ${deletedCount} old backup(s).`);
  } catch (err) {
    console.error('[AUTO-BACKUP] Cleanup failed:', err.message);
  }
}

app.get('/api/database/backup/schedule', authenticateInternal, async (req, res) => {
  res.json({
    enabled: true,
    schedule: '0 2 * * *',
    scheduleDescription: 'Daily at 2:00 AM',
    retentionDays: BACKUP_RETENTION_DAYS,
    nextRun: getNextCronRun('0 2 * * *'),
  });
});

app.post('/api/database/backup/trigger', authenticateInternal, async (req, res) => {
  const result = await performAutomatedBackup();
  if (result.success) {
    res.json({ success: true, message: 'Backup completed', filename: result.filename });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

function getNextCronRun(cronExpression) {
  const now = new Date();
  const [minute, hour] = cronExpression.split(' ');
  const nextRun = new Date();
  nextRun.setHours(parseInt(hour), parseInt(minute), 0, 0);
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  return nextRun.toISOString();
}

cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Triggering scheduled database backup');
  await performAutomatedBackup();
}, {
  scheduled: true,
  timezone: 'UTC'
});

console.log(`[AUTO-BACKUP] Scheduler initialized: Daily at 2:00 AM UTC, retention: ${BACKUP_RETENTION_DAYS} days`);

const PORT = process.env.PORT || 7003;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Database Admin service running on port ${PORT}`);
});
