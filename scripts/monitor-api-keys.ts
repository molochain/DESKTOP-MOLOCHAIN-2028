#!/usr/bin/env npx tsx
/**
 * API Key Monitoring Script
 * 
 * Purpose: Monitor external API key usage, health, and rate limit violations
 * 
 * Usage:
 *   npx tsx scripts/monitor-api-keys.ts           # Run full monitoring report
 *   npx tsx scripts/monitor-api-keys.ts --logs    # Check PM2 logs only
 *   npx tsx scripts/monitor-api-keys.ts --db      # Database stats only
 *   npx tsx scripts/monitor-api-keys.ts --watch   # Continuous monitoring (every 60s)
 * 
 * Requirements:
 *   - SERVER_SSH_PASSWORD environment variable for production access
 *   - SSH access to production server (31.186.24.19)
 */

import { Client } from 'ssh2';

const PRODUCTION_HOST = '31.186.24.19';
const PRODUCTION_USER = 'root';
const SSH_PASSWORD = process.env.SERVER_SSH_PASSWORD;

interface SSHConnection {
  exec: (command: string) => Promise<string>;
  close: () => void;
}

interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  usageLastHour: number;
  usageLastDay: number;
  rateLimitViolations: RateLimitViolation[];
  topEndpoints: EndpointUsage[];
  recentErrors: ErrorLog[];
}

interface RateLimitViolation {
  keyId: number;
  keyName: string;
  count: number;
  lastOccurrence: string;
}

interface EndpointUsage {
  endpoint: string;
  method: string;
  count: number;
  avgResponseTime: number;
}

interface ErrorLog {
  timestamp: string;
  keyId: number;
  endpoint: string;
  statusCode: number;
  message: string;
}

async function createSSHConnection(): Promise<SSHConnection> {
  if (!SSH_PASSWORD) {
    throw new Error('SERVER_SSH_PASSWORD environment variable is required');
  }

  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on('ready', () => {
      const exec = (command: string): Promise<string> => {
        return new Promise((resolveExec, rejectExec) => {
          conn.exec(command, (err, stream) => {
            if (err) {
              rejectExec(err);
              return;
            }

            let output = '';
            let errorOutput = '';

            stream.on('close', (code: number) => {
              if (code !== 0 && errorOutput) {
                rejectExec(new Error(`Command failed: ${errorOutput}`));
              } else {
                resolveExec(output);
              }
            });

            stream.on('data', (data: Buffer) => {
              output += data.toString();
            });

            stream.stderr.on('data', (data: Buffer) => {
              errorOutput += data.toString();
            });
          });
        });
      };

      resolve({
        exec,
        close: () => conn.end(),
      });
    });

    conn.on('error', reject);

    conn.connect({
      host: PRODUCTION_HOST,
      port: 22,
      username: PRODUCTION_USER,
      password: SSH_PASSWORD,
    });
  });
}

async function checkPM2Logs(ssh: SSHConnection): Promise<{
  apiKeyLogs: string[];
  rateLimitLogs: string[];
  errorLogs: string[];
}> {
  console.log('\n📋 Checking PM2 logs for API key activity...\n');

  const apiKeyLogs: string[] = [];
  const rateLimitLogs: string[] = [];
  const errorLogs: string[] = [];

  try {
    const logDir = '/root/.pm2/logs';
    
    const apiKeyOutput = await ssh.exec(
      `grep -i "api.key\\|apikey\\|API key" ${logDir}/*.log 2>/dev/null | tail -50 || echo ""`
    );
    if (apiKeyOutput.trim()) {
      apiKeyLogs.push(...apiKeyOutput.trim().split('\n').filter(Boolean));
    }

    const rateLimitOutput = await ssh.exec(
      `grep -i "rate.limit\\|X-RateLimit\\|429\\|Too Many Requests" ${logDir}/*.log 2>/dev/null | tail -50 || echo ""`
    );
    if (rateLimitOutput.trim()) {
      rateLimitLogs.push(...rateLimitOutput.trim().split('\n').filter(Boolean));
    }

    const errorOutput = await ssh.exec(
      `grep -i "error\\|401\\|403" ${logDir}/*.log 2>/dev/null | grep -i "api" | tail -30 || echo ""`
    );
    if (errorOutput.trim()) {
      errorLogs.push(...errorOutput.trim().split('\n').filter(Boolean));
    }

  } catch (error) {
    console.warn('Warning: Could not read PM2 logs:', (error as Error).message);
  }

  return { apiKeyLogs, rateLimitLogs, errorLogs };
}

async function queryDatabaseStats(ssh: SSHConnection): Promise<ApiKeyStats> {
  console.log('\n📊 Querying database for API key statistics...\n');

  const dbQuery = async (query: string): Promise<string> => {
    const escapedQuery = query.replace(/"/g, '\\"').replace(/\n/g, ' ');
    return ssh.exec(
      `PGPASSWORD='$PGPASSWORD' psql -h localhost -U molochain -d molochain_db -t -c "${escapedQuery}" 2>/dev/null || echo "0"`
    );
  };

  const totalKeysResult = await dbQuery('SELECT COUNT(*) FROM external_api_keys;');
  const totalKeys = parseInt(totalKeysResult.trim()) || 0;

  const activeKeysResult = await dbQuery(
    `SELECT COUNT(*) FROM external_api_keys WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW());`
  );
  const activeKeys = parseInt(activeKeysResult.trim()) || 0;

  const expiredKeysResult = await dbQuery(
    `SELECT COUNT(*) FROM external_api_keys WHERE expires_at IS NOT NULL AND expires_at <= NOW();`
  );
  const expiredKeys = parseInt(expiredKeysResult.trim()) || 0;

  const usageLastHourResult = await dbQuery(
    `SELECT COUNT(*) FROM api_key_usage_logs WHERE created_at > NOW() - INTERVAL '1 hour';`
  );
  const usageLastHour = parseInt(usageLastHourResult.trim()) || 0;

  const usageLastDayResult = await dbQuery(
    `SELECT COUNT(*) FROM api_key_usage_logs WHERE created_at > NOW() - INTERVAL '24 hours';`
  );
  const usageLastDay = parseInt(usageLastDayResult.trim()) || 0;

  const rateLimitViolationsResult = await dbQuery(`
    SELECT 
      l.api_key_id,
      k.name,
      COUNT(*) as violation_count,
      MAX(l.created_at) as last_occurrence
    FROM api_key_usage_logs l
    JOIN external_api_keys k ON l.api_key_id = k.id
    WHERE l.status_code = 429
      AND l.created_at > NOW() - INTERVAL '24 hours'
    GROUP BY l.api_key_id, k.name
    ORDER BY violation_count DESC
    LIMIT 10;
  `);

  const rateLimitViolations: RateLimitViolation[] = [];
  if (rateLimitViolationsResult.trim()) {
    const lines = rateLimitViolationsResult.trim().split('\n');
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 4 && parts[0]) {
        rateLimitViolations.push({
          keyId: parseInt(parts[0]),
          keyName: parts[1],
          count: parseInt(parts[2]),
          lastOccurrence: parts[3],
        });
      }
    }
  }

  const topEndpointsResult = await dbQuery(`
    SELECT 
      endpoint,
      method,
      COUNT(*) as request_count,
      ROUND(AVG(response_time)::numeric, 2) as avg_response_time
    FROM api_key_usage_logs
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY endpoint, method
    ORDER BY request_count DESC
    LIMIT 10;
  `);

  const topEndpoints: EndpointUsage[] = [];
  if (topEndpointsResult.trim()) {
    const lines = topEndpointsResult.trim().split('\n');
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 4 && parts[0]) {
        topEndpoints.push({
          endpoint: parts[0],
          method: parts[1],
          count: parseInt(parts[2]),
          avgResponseTime: parseFloat(parts[3]),
        });
      }
    }
  }

  const recentErrorsResult = await dbQuery(`
    SELECT 
      created_at,
      api_key_id,
      endpoint,
      status_code
    FROM api_key_usage_logs
    WHERE status_code >= 400
      AND created_at > NOW() - INTERVAL '1 hour'
    ORDER BY created_at DESC
    LIMIT 20;
  `);

  const recentErrors: ErrorLog[] = [];
  if (recentErrorsResult.trim()) {
    const lines = recentErrorsResult.trim().split('\n');
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 4 && parts[0]) {
        recentErrors.push({
          timestamp: parts[0],
          keyId: parseInt(parts[1]),
          endpoint: parts[2],
          statusCode: parseInt(parts[3]),
          message: `HTTP ${parts[3]}`,
        });
      }
    }
  }

  return {
    totalKeys,
    activeKeys,
    expiredKeys,
    usageLastHour,
    usageLastDay,
    rateLimitViolations,
    topEndpoints,
    recentErrors,
  };
}

function printReport(stats: ApiKeyStats, logs: {
  apiKeyLogs: string[];
  rateLimitLogs: string[];
  errorLogs: string[];
}): void {
  console.log('\n' + '='.repeat(60));
  console.log('       🔑 EXTERNAL API KEY MONITORING REPORT');
  console.log('='.repeat(60));
  console.log(`Report Generated: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  console.log('\n📈 KEY STATISTICS');
  console.log('-'.repeat(40));
  console.log(`Total API Keys:     ${stats.totalKeys}`);
  console.log(`Active Keys:        ${stats.activeKeys}`);
  console.log(`Expired Keys:       ${stats.expiredKeys}`);
  console.log(`Usage (Last Hour):  ${stats.usageLastHour} requests`);
  console.log(`Usage (Last 24h):   ${stats.usageLastDay} requests`);

  console.log('\n🚀 TOP ENDPOINTS (Last 24 hours)');
  console.log('-'.repeat(40));
  if (stats.topEndpoints.length > 0) {
    for (const ep of stats.topEndpoints) {
      console.log(`  ${ep.method.padEnd(6)} ${ep.endpoint.padEnd(30)} ${ep.count.toString().padStart(6)} reqs  (${ep.avgResponseTime}ms avg)`);
    }
  } else {
    console.log('  No endpoint usage data available');
  }

  console.log('\n⚠️  RATE LIMIT VIOLATIONS (Last 24 hours)');
  console.log('-'.repeat(40));
  if (stats.rateLimitViolations.length > 0) {
    for (const v of stats.rateLimitViolations) {
      console.log(`  Key #${v.keyId} (${v.keyName}): ${v.count} violations`);
      console.log(`    Last occurrence: ${v.lastOccurrence}`);
    }
  } else {
    console.log('  ✅ No rate limit violations detected');
  }

  console.log('\n❌ RECENT ERRORS (Last hour)');
  console.log('-'.repeat(40));
  if (stats.recentErrors.length > 0) {
    for (const err of stats.recentErrors.slice(0, 10)) {
      console.log(`  [${err.timestamp}] Key #${err.keyId}: ${err.statusCode} on ${err.endpoint}`);
    }
    if (stats.recentErrors.length > 10) {
      console.log(`  ... and ${stats.recentErrors.length - 10} more errors`);
    }
  } else {
    console.log('  ✅ No errors in the last hour');
  }

  console.log('\n📋 PM2 LOG SUMMARY');
  console.log('-'.repeat(40));
  console.log(`  API Key related logs:   ${logs.apiKeyLogs.length} entries`);
  console.log(`  Rate limit logs:        ${logs.rateLimitLogs.length} entries`);
  console.log(`  Error logs:             ${logs.errorLogs.length} entries`);

  if (logs.rateLimitLogs.length > 0) {
    console.log('\n  Recent rate limit log entries:');
    for (const log of logs.rateLimitLogs.slice(-5)) {
      console.log(`    ${log.substring(0, 120)}...`);
    }
  }

  console.log('\n' + '='.repeat(60));

  const hasIssues = 
    stats.rateLimitViolations.length > 0 ||
    stats.recentErrors.length > 10 ||
    logs.errorLogs.length > 20;

  if (hasIssues) {
    console.log('⚠️  STATUS: ATTENTION REQUIRED');
    console.log('   Review rate limit violations and errors above');
  } else {
    console.log('✅ STATUS: HEALTHY');
    console.log('   All API key metrics within normal parameters');
  }
  console.log('='.repeat(60) + '\n');
}

async function runMonitoring(options: { logsOnly?: boolean; dbOnly?: boolean }): Promise<void> {
  let ssh: SSHConnection | null = null;

  try {
    console.log('🔌 Connecting to production server...');
    ssh = await createSSHConnection();
    console.log('✅ Connected successfully\n');

    let stats: ApiKeyStats = {
      totalKeys: 0,
      activeKeys: 0,
      expiredKeys: 0,
      usageLastHour: 0,
      usageLastDay: 0,
      rateLimitViolations: [],
      topEndpoints: [],
      recentErrors: [],
    };

    let logs = {
      apiKeyLogs: [] as string[],
      rateLimitLogs: [] as string[],
      errorLogs: [] as string[],
    };

    if (!options.dbOnly) {
      logs = await checkPM2Logs(ssh);
    }

    if (!options.logsOnly) {
      stats = await queryDatabaseStats(ssh);
    }

    printReport(stats, logs);

  } catch (error) {
    console.error('❌ Monitoring failed:', (error as Error).message);
    process.exit(1);
  } finally {
    if (ssh) {
      ssh.close();
      console.log('🔌 Disconnected from production server');
    }
  }
}

async function watchMode(intervalSeconds: number = 60): Promise<void> {
  console.log(`👁️  Starting watch mode (interval: ${intervalSeconds}s)`);
  console.log('Press Ctrl+C to stop\n');

  const run = async () => {
    console.clear();
    await runMonitoring({});
  };

  await run();
  setInterval(run, intervalSeconds * 1000);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
API Key Monitoring Script
=========================

Usage:
  npx tsx scripts/monitor-api-keys.ts [options]

Options:
  --logs    Check PM2 logs only (skip database queries)
  --db      Database statistics only (skip PM2 logs)
  --watch   Continuous monitoring mode (every 60 seconds)
  --help    Show this help message

Environment Variables:
  SERVER_SSH_PASSWORD   Required. SSH password for production server.

Examples:
  # Full monitoring report
  npx tsx scripts/monitor-api-keys.ts

  # Check PM2 logs only
  npx tsx scripts/monitor-api-keys.ts --logs

  # Continuous monitoring
  npx tsx scripts/monitor-api-keys.ts --watch
    `);
    return;
  }

  if (args.includes('--watch')) {
    await watchMode();
  } else {
    await runMonitoring({
      logsOnly: args.includes('--logs'),
      dbOnly: args.includes('--db'),
    });
  }
}

main().catch(console.error);
