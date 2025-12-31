import { useState, useEffect, useRef } from 'react';
import { 
  FileCode, 
  Server, 
  Database as DatabaseIcon,
  Shield,
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCircle,
  Download,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    SwaggerUIBundle: (config: Record<string, unknown>) => void;
  }
}

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: { type: string; example: string };
  response?: { type: string; example: string };
}

interface ApiSection {
  name: string;
  icon: typeof Server;
  description: string;
  baseUrl: string;
  endpoints: Endpoint[];
}

const apiSections: ApiSection[] = [
  {
    name: 'Microservices Management',
    icon: Server,
    description: 'Container and microservice monitoring endpoints',
    baseUrl: '/api/admin/microservices',
    endpoints: [
      {
        method: 'GET',
        path: '/containers',
        description: 'List all Docker containers with status, health, and resource usage',
        response: {
          type: 'Container[]',
          example: '[\n  {\n    "name": "molochain-admin",\n    "status": "running",\n    "health": "healthy",\n    "image": "molochain-admin:latest",\n    "ports": "7000/tcp"\n  }\n]',
        },
      },
      {
        method: 'POST',
        path: '/containers/:name/restart',
        description: 'Restart a container by name',
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'Container name' },
        ],
        response: {
          type: '{ success: boolean, message: string }',
          example: '{ "success": true, "message": "Container restarted" }',
        },
      },
      {
        method: 'GET',
        path: '/containers/:name/logs',
        description: 'Get container logs',
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'Container name' },
          { name: 'lines', type: 'number', required: false, description: 'Number of log lines (default: 100)' },
        ],
        response: {
          type: '{ logs: string[] }',
          example: '{ "logs": ["2025-01-01 12:00:00 INFO Server started..."] }',
        },
      },
      {
        method: 'GET',
        path: '/metrics',
        description: 'Get system metrics (CPU, memory, disk, network)',
        response: {
          type: 'SystemMetrics',
          example: '{\n  "cpu": { "usage": 25.5, "cores": 8 },\n  "memory": { "used": 4096, "total": 16384 },\n  "disk": { "used": 50000, "total": 500000 }\n}',
        },
      },
    ],
  },
  {
    name: 'SSL Certificate Monitoring',
    icon: Shield,
    description: 'SSL/TLS certificate status and expiration monitoring',
    baseUrl: '/api/ssl',
    endpoints: [
      {
        method: 'GET',
        path: '/check-all',
        description: 'Check SSL certificates for all monitored domains',
        response: {
          type: '{ summary: SSLSummary, certificates: SSLCertificate[] }',
          example: '{\n  "summary": {\n    "total": 10,\n    "valid": 8,\n    "expiring": 1,\n    "expired": 0,\n    "invalid": 1\n  },\n  "certificates": [\n    {\n      "domain": "molochain.com",\n      "status": "valid",\n      "issuer": "Let\'s Encrypt",\n      "daysRemaining": 81\n    }\n  ]\n}',
        },
      },
      {
        method: 'GET',
        path: '/check',
        description: 'Check SSL certificate for a specific domain',
        parameters: [
          { name: 'domain', type: 'string', required: true, description: 'Domain to check' },
        ],
        response: {
          type: 'SSLCertificate',
          example: '{\n  "domain": "molochain.com",\n  "status": "valid",\n  "issuer": "Let\'s Encrypt",\n  "validTo": "2026-03-23T17:23:11.000Z",\n  "daysRemaining": 81,\n  "authorized": true\n}',
        },
      },
    ],
  },
  {
    name: 'Database Management',
    icon: DatabaseIcon,
    description: 'PostgreSQL database administration endpoints',
    baseUrl: '/api/database',
    endpoints: [
      {
        method: 'GET',
        path: '/stats',
        description: 'Get database statistics',
        response: {
          type: 'DatabaseStats',
          example: '{\n  "databaseName": "molochaindb",\n  "size": "27 MB",\n  "tableCount": 104,\n  "activeConnections": 5,\n  "version": "PostgreSQL 13.22"\n}',
        },
      },
      {
        method: 'GET',
        path: '/tables',
        description: 'List all database tables with sizes and row counts',
        response: {
          type: 'TableInfo[]',
          example: '[\n  {\n    "table_name": "users",\n    "table_type": "BASE TABLE",\n    "size": "128 kB",\n    "column_count": 12,\n    "row_count": 500\n  }\n]',
        },
      },
      {
        method: 'GET',
        path: '/tables/:name',
        description: 'Get table schema and data with pagination',
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'Table name' },
          { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'number', required: false, description: 'Rows per page (max: 100)' },
        ],
        response: {
          type: '{ table: string, columns: ColumnInfo[], rows: Record[], pagination: Pagination }',
          example: '{\n  "table": "users",\n  "columns": [{ "column_name": "id", "data_type": "integer" }],\n  "rows": [{ "id": 1, "email": "user@example.com" }],\n  "pagination": { "page": 1, "total": 500 }\n}',
        },
      },
      {
        method: 'POST',
        path: '/query',
        description: 'Execute a read-only SQL query (SELECT, EXPLAIN, SHOW only)',
        requestBody: {
          type: '{ query: string }',
          example: '{ "query": "SELECT * FROM users LIMIT 10" }',
        },
        response: {
          type: '{ columns: string[], rows: Record[], rowCount: number, duration: number }',
          example: '{\n  "columns": ["id", "email"],\n  "rows": [{ "id": 1, "email": "user@example.com" }],\n  "rowCount": 1,\n  "duration": 25\n}',
        },
      },
      {
        method: 'GET',
        path: '/backups',
        description: 'List available database backups',
        response: {
          type: 'Backup[]',
          example: '[\n  {\n    "name": "molochain_2025-01-01.sql.gz",\n    "size": 5242880,\n    "sizeFormatted": "5 MB",\n    "created": "2025-01-01T00:00:00.000Z"\n  }\n]',
        },
      },
      {
        method: 'POST',
        path: '/backup',
        description: 'Create a new database backup',
        response: {
          type: '{ success: boolean, backup: Backup }',
          example: '{ "success": true, "backup": { "name": "molochain_2025-01-01.sql.gz", "size": 5242880 } }',
        },
      },
      {
        method: 'POST',
        path: '/restore',
        description: 'Restore database from a backup (requires confirmation)',
        requestBody: {
          type: '{ filename: string, confirm: "RESTORE" }',
          example: '{ "filename": "molochain_2025-01-01.sql.gz", "confirm": "RESTORE" }',
        },
        response: {
          type: '{ success: boolean, message: string }',
          example: '{ "success": true, "message": "Database restored from molochain_2025-01-01.sql.gz" }',
        },
      },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-600 border-green-500/30',
  POST: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  PUT: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
  DELETE: 'bg-red-500/20 text-red-600 border-red-500/30',
  PATCH: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        data-testid="button-copy-code"
      >
        {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} className="text-slate-300" />}
      </button>
    </div>
  );
}

function EndpointCard({ endpoint, baseUrl }: { endpoint: Endpoint; baseUrl: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        data-testid={`endpoint-${endpoint.method}-${endpoint.path.replace(/[/:]/g, '-')}`}
      >
        <span className={cn('px-2 py-0.5 text-xs font-bold rounded border', methodColors[endpoint.method])}>
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{baseUrl}{endpoint.path}</code>
        <span className="flex-1 text-sm text-slate-500 truncate">{endpoint.description}</span>
        {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">{endpoint.description}</p>

          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Parameters</h4>
              <div className="space-y-1">
                {endpoint.parameters.map((param) => (
                  <div key={param.name} className="flex items-center gap-2 text-sm">
                    <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">{param.name}</code>
                    <span className="text-slate-400 text-xs">{param.type}</span>
                    {param.required && <span className="text-xs text-red-500">required</span>}
                    <span className="text-slate-500 text-xs">{param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.requestBody && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Request Body</h4>
              <p className="text-xs text-slate-500 mb-1">{endpoint.requestBody.type}</p>
              <CodeBlock code={endpoint.requestBody.example} />
            </div>
          )}

          {endpoint.response && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Response</h4>
              <p className="text-xs text-slate-500 mb-1">{endpoint.response.type}</p>
              <CodeBlock code={endpoint.response.example} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ApiDocs() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Microservices Management']));
  const [activeView, setActiveView] = useState<'quick' | 'swagger'>('quick');
  const swaggerRef = useRef<HTMLDivElement>(null);

  const toggleSection = (name: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  useEffect(() => {
    if (activeView === 'swagger' && swaggerRef.current) {
      const loadSwaggerUI = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (win.SwaggerUIBundle) {
          win.SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui-container',
            layout: 'BaseLayout',
            deepLinking: true,
          });
        }
      };

      if (!document.getElementById('swagger-ui-css')) {
        const link = document.createElement('link');
        link.id = 'swagger-ui-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css';
        document.head.appendChild(link);
      }

      if (!document.getElementById('swagger-ui-bundle')) {
        const script1 = document.createElement('script');
        script1.id = 'swagger-ui-bundle';
        script1.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js';
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js';
          script2.onload = loadSwaggerUI;
          document.body.appendChild(script2);
        };
        document.body.appendChild(script1);
      } else {
        loadSwaggerUI();
      }
    }
  }, [activeView]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-api-docs-title">API Documentation</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            REST API endpoints for the Molochain Admin System
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/openapi.json"
            download="molochain-admin-openapi.json"
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
            data-testid="link-download-openapi"
          >
            <Download size={16} />
            OpenAPI Spec
          </a>
          <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono">v1.0.0</code>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveView('quick')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeView === 'quick'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
          data-testid="tab-quick-reference"
        >
          Quick Reference
        </button>
        <button
          onClick={() => setActiveView('swagger')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
            activeView === 'swagger'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
          data-testid="tab-swagger-ui"
        >
          <ExternalLink size={14} />
          Swagger UI
        </button>
      </div>

      {activeView === 'swagger' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div id="swagger-ui-container" ref={swaggerRef} className="min-h-[600px]" />
        </div>
      )}

      {activeView === 'quick' && (
        <>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <FileCode size={20} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-slate-900 dark:text-white">Authentication Required</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            All API endpoints require authentication. Include your session cookie or use the login endpoint to authenticate first.
            Admin-only endpoints require appropriate permissions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {apiSections.map((section) => (
          <div key={section.name} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={() => toggleSection(section.name)}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              data-testid={`section-${section.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <section.icon size={20} className="text-primary-500" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="font-semibold text-slate-900 dark:text-white">{section.name}</h2>
                <p className="text-sm text-slate-500">{section.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {section.endpoints.length} endpoints
                </span>
                {expandedSections.has(section.name) ? (
                  <ChevronDown size={20} className="text-slate-400" />
                ) : (
                  <ChevronRight size={20} className="text-slate-400" />
                )}
              </div>
            </button>

            {expandedSections.has(section.name) && (
              <div className="px-4 pb-4 space-y-2">
                {section.endpoints.map((endpoint) => (
                  <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} baseUrl={section.baseUrl} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">API Types Reference</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Container</h3>
            <CodeBlock code={`interface Container {
  name: string;
  status: 'running' | 'stopped' | 'exited';
  health: 'healthy' | 'unhealthy' | 'starting' | null;
  image: string;
  ports: string;
  created: string;
}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SSLCertificate</h3>
            <CodeBlock code={`interface SSLCertificate {
  domain: string;
  label: string;
  status: 'valid' | 'expiring' | 'expired' | 'invalid' | 'error';
  issuer: string | null;
  validTo: string | null;
  daysRemaining: number | null;
  authorized: boolean;
  authorizationError: string | null;
}`} />
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

export default ApiDocs;
