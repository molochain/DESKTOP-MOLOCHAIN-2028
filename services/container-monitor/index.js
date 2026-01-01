const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { execSync, exec } = require('child_process');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const DB_ADMIN_URL = process.env.DB_ADMIN_URL || 'http://molochain-db-admin:7003';
const CHECK_INTERVAL_SECONDS = parseInt(process.env.CHECK_INTERVAL_SECONDS) || 30;
const MAX_RESTART_ATTEMPTS = parseInt(process.env.MAX_RESTART_ATTEMPTS) || 3;
const RESTART_COOLDOWN_MINUTES = parseInt(process.env.RESTART_COOLDOWN_MINUTES) || 5;

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

const restartAttempts = new Map();
const containerStatusHistory = new Map();
let monitoringEnabled = true;

async function logToAudit(action, details, success = true, severity = 'info') {
  try {
    await axios.post(`${DB_ADMIN_URL}/api/audit/log`, {
      action,
      category: 'containers',
      details,
      severity,
      success
    }, {
      headers: { 'X-Internal-Api-Key': INTERNAL_API_KEY }
    });
  } catch (err) {
    console.error('[AUDIT] Failed to log:', err.message);
  }
}

function getContainerStatus() {
  try {
    const output = execSync(
      'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Status}}|{{.State}}"',
      { encoding: 'utf8', timeout: 10000 }
    );
    
    return output.trim().split('\n').filter(Boolean).map(line => {
      const [id, name, status, state] = line.split('|');
      return {
        id: id.trim(),
        name: name.trim(),
        status: status.trim(),
        state: state.trim(),
        healthy: state.trim() === 'running' && !status.includes('unhealthy')
      };
    });
  } catch (err) {
    console.error('[MONITOR] Failed to get container status:', err.message);
    return [];
  }
}

function getContainerHealth(containerId) {
  try {
    const output = execSync(
      `docker inspect --format='{{.State.Health.Status}}' ${containerId} 2>/dev/null || echo "none"`,
      { encoding: 'utf8', timeout: 5000 }
    );
    return output.trim();
  } catch (err) {
    return 'unknown';
  }
}

async function restartContainer(containerId, containerName) {
  const now = Date.now();
  const attempts = restartAttempts.get(containerId) || { count: 0, lastAttempt: 0 };
  
  const cooldownMs = RESTART_COOLDOWN_MINUTES * 60 * 1000;
  if (now - attempts.lastAttempt < cooldownMs && attempts.count >= MAX_RESTART_ATTEMPTS) {
    console.log(`[RECOVERY] Skipping ${containerName}: max attempts reached, waiting for cooldown`);
    return { success: false, reason: 'max_attempts_reached' };
  }
  
  if (now - attempts.lastAttempt >= cooldownMs) {
    attempts.count = 0;
  }
  
  console.log(`[RECOVERY] Attempting to restart container: ${containerName} (attempt ${attempts.count + 1}/${MAX_RESTART_ATTEMPTS})`);
  
  try {
    execSync(`docker restart ${containerId}`, { timeout: 60000 });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const newStatus = getContainerStatus().find(c => c.id === containerId);
    const success = newStatus?.state === 'running';
    
    attempts.count++;
    attempts.lastAttempt = now;
    restartAttempts.set(containerId, attempts);
    
    await logToAudit('container_auto_restart', {
      containerId,
      containerName,
      attempt: attempts.count,
      success,
      newState: newStatus?.state
    }, success, success ? 'warning' : 'error');
    
    console.log(`[RECOVERY] Restart ${success ? 'successful' : 'failed'} for ${containerName}`);
    return { success, state: newStatus?.state };
  } catch (err) {
    attempts.count++;
    attempts.lastAttempt = now;
    restartAttempts.set(containerId, attempts);
    
    await logToAudit('container_auto_restart', {
      containerId,
      containerName,
      attempt: attempts.count,
      error: err.message
    }, false, 'error');
    
    console.error(`[RECOVERY] Failed to restart ${containerName}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function performHealthCheck() {
  if (!monitoringEnabled) return;
  
  console.log('[MONITOR] Running health check...');
  const containers = getContainerStatus();
  const unhealthyContainers = [];
  
  for (const container of containers) {
    const previousState = containerStatusHistory.get(container.id);
    containerStatusHistory.set(container.id, container.state);
    
    if (container.state === 'exited' || container.state === 'dead') {
      unhealthyContainers.push(container);
      
      if (previousState === 'running') {
        console.log(`[MONITOR] Container ${container.name} went from running to ${container.state}`);
        await logToAudit('container_unhealthy_detected', {
          containerId: container.id,
          containerName: container.name,
          state: container.state,
          status: container.status,
          previousState
        }, true, 'warning');
        
        await restartContainer(container.id, container.name);
      }
    }
    
    if (container.status.includes('unhealthy')) {
      console.log(`[MONITOR] Container ${container.name} is unhealthy`);
      await logToAudit('container_unhealthy_detected', {
        containerId: container.id,
        containerName: container.name,
        healthStatus: 'unhealthy'
      }, true, 'warning');
      
      await restartContainer(container.id, container.name);
    }
  }
  
  console.log(`[MONITOR] Health check complete. ${unhealthyContainers.length} unhealthy containers found.`);
  return { checked: containers.length, unhealthy: unhealthyContainers.length };
}

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'container-monitor',
    monitoringEnabled,
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/monitor/status', authenticateInternal, (req, res) => {
  const containers = getContainerStatus();
  res.json({
    monitoringEnabled,
    checkIntervalSeconds: CHECK_INTERVAL_SECONDS,
    maxRestartAttempts: MAX_RESTART_ATTEMPTS,
    restartCooldownMinutes: RESTART_COOLDOWN_MINUTES,
    containers: containers.length,
    unhealthyContainers: containers.filter(c => !c.healthy).length,
    restartAttempts: Object.fromEntries(restartAttempts)
  });
});

app.get('/api/monitor/containers', authenticateInternal, (req, res) => {
  const containers = getContainerStatus();
  res.json({ containers });
});

app.post('/api/monitor/toggle', authenticateInternal, async (req, res) => {
  monitoringEnabled = !monitoringEnabled;
  await logToAudit('monitoring_toggled', { enabled: monitoringEnabled }, true, 'info');
  res.json({ monitoringEnabled });
});

app.post('/api/monitor/restart/:containerId', authenticateInternal, async (req, res) => {
  const { containerId } = req.params;
  const containers = getContainerStatus();
  const container = containers.find(c => c.id === containerId || c.name === containerId);
  
  if (!container) {
    return res.status(404).json({ error: 'Container not found' });
  }
  
  const result = await restartContainer(container.id, container.name);
  res.json(result);
});

app.post('/api/monitor/check', authenticateInternal, async (req, res) => {
  const result = await performHealthCheck();
  res.json(result);
});

app.post('/api/monitor/clear-attempts', authenticateInternal, async (req, res) => {
  const { containerId } = req.body;
  if (containerId) {
    restartAttempts.delete(containerId);
  } else {
    restartAttempts.clear();
  }
  await logToAudit('restart_attempts_cleared', { containerId: containerId || 'all' }, true, 'info');
  res.json({ success: true, message: 'Restart attempt counters cleared successfully' });
});

app.post('/api/runbooks/flush-redis', authenticateInternal, async (req, res) => {
  try {
    const redisContainers = getContainerStatus().filter(c => 
      c.name.includes('redis') || c.name.includes('cache')
    );
    
    let flushed = 0;
    for (const container of redisContainers) {
      try {
        execSync(`docker exec ${container.id} redis-cli FLUSHALL`, { timeout: 10000 });
        flushed++;
      } catch (err) {
        console.log(`[RUNBOOK] Could not flush ${container.name}: ${err.message}`);
      }
    }
    
    await logToAudit('runbook_flush_redis', { flushed, total: redisContainers.length }, true, 'warning');
    res.json({ 
      success: true, 
      message: `Flushed ${flushed} Redis cache(s)`,
      flushed,
      total: redisContainers.length
    });
  } catch (err) {
    await logToAudit('runbook_flush_redis', { error: err.message }, false, 'error');
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/runbooks/cleanup-backups', authenticateInternal, async (req, res) => {
  try {
    const retentionDays = 7;
    const result = execSync(
      `find /var/backups/postgres -name "*.sql" -mtime +${retentionDays} -delete 2>/dev/null; echo "Cleanup complete"`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    await logToAudit('runbook_cleanup_backups', { retentionDays }, true, 'info');
    res.json({ 
      success: true, 
      message: `Cleaned up backups older than ${retentionDays} days`,
      retentionDays
    });
  } catch (err) {
    await logToAudit('runbook_cleanup_backups', { error: err.message }, false, 'error');
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/runbooks/restart-core', authenticateInternal, async (req, res) => {
  try {
    const coreServices = [
      'molochain-admin',
      'molochain-admin-service',
      'molochain-app',
      'auth-service'
    ];
    
    const containers = getContainerStatus();
    const toRestart = containers.filter(c => 
      coreServices.some(name => c.name.includes(name))
    );
    
    const results = [];
    for (const container of toRestart) {
      try {
        execSync(`docker restart ${container.id}`, { timeout: 60000 });
        results.push({ name: container.name, success: true });
      } catch (err) {
        results.push({ name: container.name, success: false, error: err.message });
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    await logToAudit('runbook_restart_core', { results }, true, 'warning');
    res.json({ 
      success: true, 
      message: `Restarted ${results.filter(r => r.success).length}/${toRestart.length} core services`,
      results
    });
  } catch (err) {
    await logToAudit('runbook_restart_core', { error: err.message }, false, 'error');
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/runbooks/rotate-logs', authenticateInternal, async (req, res) => {
  try {
    const containers = getContainerStatus().filter(c => c.state === 'running');
    let rotated = 0;
    
    for (const container of containers.slice(0, 20)) {
      try {
        execSync(`truncate -s 0 $(docker inspect --format='{{.LogPath}}' ${container.id}) 2>/dev/null || true`, { timeout: 5000 });
        rotated++;
      } catch (err) {
        // Ignore errors for individual containers
      }
    }
    
    await logToAudit('runbook_rotate_logs', { rotated, total: containers.length }, true, 'info');
    res.json({ 
      success: true, 
      message: `Rotated logs for ${rotated} containers`,
      rotated
    });
  } catch (err) {
    await logToAudit('runbook_rotate_logs', { error: err.message }, false, 'error');
    res.status(500).json({ success: false, message: err.message });
  }
});

setInterval(performHealthCheck, CHECK_INTERVAL_SECONDS * 1000);

console.log(`[MONITOR] Container monitor initialized. Check interval: ${CHECK_INTERVAL_SECONDS}s`);
console.log(`[MONITOR] Auto-recovery: max ${MAX_RESTART_ATTEMPTS} attempts, ${RESTART_COOLDOWN_MINUTES}min cooldown`);

const PORT = process.env.PORT || 7004;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Container Monitor service running on port ${PORT}`);
});
