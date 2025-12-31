import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Globe,
  ExternalLink,
  Calendar,
  Clock,
} from 'lucide-react';
import { checkSSLCertificates } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CertificateInfo {
  domain: string;
  label: string;
  status: 'valid' | 'expiring' | 'expired' | 'invalid' | 'error';
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  accessible?: boolean;
  authorized?: boolean;
  authorizationError?: string;
  error?: string;
  lastChecked: string;
}

interface SSLCheckResponse {
  summary: {
    total: number;
    valid: number;
    expiring: number;
    expired: number;
    invalid: number;
    error: number;
    lastChecked: string;
  };
  certificates: CertificateInfo[];
}

function getStatusColor(status: CertificateInfo['status']): string {
  switch (status) {
    case 'valid': return 'text-green-500 bg-green-500/10 border-green-500/30';
    case 'expiring': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    case 'expired': return 'text-red-500 bg-red-500/10 border-red-500/30';
    case 'invalid': return 'text-red-600 bg-red-600/10 border-red-600/30';
    case 'error': return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
  }
}

function getStatusIcon(status: CertificateInfo['status']) {
  switch (status) {
    case 'valid': return CheckCircle;
    case 'expiring': return AlertTriangle;
    case 'expired': return XCircle;
    case 'invalid': return XCircle;
    case 'error': return AlertTriangle;
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDays(days: number | undefined): string {
  if (days === undefined || days === null) return '--';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export function Security() {
  const { data, isLoading, refetch, isFetching } = useQuery<SSLCheckResponse>({
    queryKey: ['/api/ssl/check-all'],
    queryFn: checkSSLCertificates,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  const summary = data?.summary || { total: 0, valid: 0, expiring: 0, expired: 0, invalid: 0, error: 0, lastChecked: '' };
  const certificates = data?.certificates || [];

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security & SSL Monitoring</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            SSL certificate expiration monitoring for all Molochain domains
          </p>
        </div>
        <div className="flex items-center gap-3">
          {summary.lastChecked && (
            <span className="text-sm text-slate-500">
              Last checked: {new Date(summary.lastChecked).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
            data-testid="btn-check-certificates"
          >
            <RefreshCw size={16} className={(isLoading || isFetching) ? 'animate-spin' : ''} />
            Check All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <CheckCircle size={24} className="text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500" data-testid="text-valid-certs">{summary.valid}</p>
            <p className="text-sm text-slate-500">Valid</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <AlertTriangle size={24} className="text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-500" data-testid="text-expiring-certs">{summary.expiring}</p>
            <p className="text-sm text-slate-500">Expiring Soon</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <XCircle size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500" data-testid="text-expired-certs">{summary.expired + summary.invalid}</p>
            <p className="text-sm text-slate-500">Expired/Invalid</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-slate-500/10 rounded-lg">
            <AlertTriangle size={24} className="text-slate-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-500" data-testid="text-error-certs">{summary.error}</p>
            <p className="text-sm text-slate-500">Errors</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Globe size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-500" data-testid="text-total-domains">{summary.total}</p>
            <p className="text-sm text-slate-500">Domains</p>
          </div>
        </div>
      </div>

      {/* Certificate List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">SSL Certificates</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw size={32} className="animate-spin mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">Checking certificates...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-8 text-center">
            <Shield size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">No certificate data available</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {certificates.map((cert, idx) => {
              const StatusIcon = getStatusIcon(cert.status);
              
              return (
                <div
                  key={cert.domain}
                  className="p-4 flex items-center gap-4"
                  data-testid={`ssl-domain-${idx}`}
                >
                  <div className={cn('p-2 rounded-lg border', getStatusColor(cert.status))}>
                    <Lock size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 dark:text-white">{cert.domain}</h3>
                      <span className="text-xs text-slate-500">({cert.label})</span>
                      <a
                        href={`https://${cert.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-primary-500"
                        data-testid={`link-domain-${idx}`}
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    {cert.error ? (
                      <p className="text-sm text-red-500">{cert.error}</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Expires: {formatDate(cert.validTo)}
                          </span>
                          <span className={cn(
                            'flex items-center gap-1 font-medium',
                            cert.daysRemaining !== undefined && cert.daysRemaining <= 14 ? 'text-orange-500' : 
                            cert.daysRemaining !== undefined && cert.daysRemaining <= 0 ? 'text-red-500' : ''
                          )}>
                            <Clock size={12} />
                            {formatDays(cert.daysRemaining)} remaining
                          </span>
                          {cert.issuer && (
                            <span className="flex items-center gap-1">
                              <Shield size={12} />
                              {cert.issuer}
                            </span>
                          )}
                        </div>
                        {cert.authorizationError && (
                          <p className="text-xs text-red-500">Chain error: {cert.authorizationError}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                    getStatusColor(cert.status)
                  )}>
                    <StatusIcon size={12} />
                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Security Recommendations</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Shield size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">SSL Certificate Auto-Renewal</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ensure Certbot auto-renewal is configured via cron or systemd timer. Run <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">certbot renew --dry-run</code> to verify.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Expiring in &lt;14 days = Warning</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Certificates expiring within 14 days are marked as "Expiring Soon" and should be renewed immediately.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Monitoring Active</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This page automatically refreshes every 5 minutes and displays real certificate data from all monitored domains.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Lock size={20} className="text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">TLS Configuration</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Use TLS 1.2+ only, strong cipher suites, and enable HSTS. Test with <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">ssllabs.com/ssltest</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
