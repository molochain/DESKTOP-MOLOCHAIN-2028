const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const BACKUP_DIR = '/var/backups/postgres';

const pool = new Pool({
  host: process.env.PGHOST || 'molochain-db',
  port: parseInt(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'molochain',
  user: process.env.PGUSER || 'molochain',
  password: process.env.PGPASSWORD || 'molochain_secure_password',
  max: 5,
  idleTimeoutMillis: 30000,
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'database-admin', timestamp: new Date().toISOString() });
});

app.get('/api/database/tables', async (req, res) => {
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

app.get('/api/database/tables/:name', async (req, res) => {
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

app.post('/api/database/query', async (req, res) => {
  try {
    const { query } = req.body;
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

    res.json({
      columns: result.fields.map(f => f.name),
      rows: result.rows,
      rowCount: result.rowCount,
      duration,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/database/stats', async (req, res) => {
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

app.get('/api/database/backups', async (req, res) => {
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

app.post('/api/database/backup', async (req, res) => {
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
    res.json({
      success: true,
      backup: {
        name: filename,
        size: stat.size,
        sizeFormatted: formatBytes(stat.size),
        created: stat.mtime.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: `Backup failed: ${err.message}` });
  }
});

app.post('/api/database/restore', async (req, res) => {
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

    res.json({ success: true, message: `Database restored from ${safeFilename}` });
  } catch (err) {
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

const PORT = process.env.PORT || 7003;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Database Admin service running on port ${PORT}`);
});
