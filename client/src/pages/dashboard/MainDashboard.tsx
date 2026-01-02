import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { DepartmentOverview } from '@/components/dashboard/DepartmentOverview';
import { SystemPerformance } from '@/components/dashboard/SystemPerformance';
import { ComplianceStatus } from '@/components/dashboard/ComplianceStatus';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { MoloChainSpinner, MoloChainLogo } from '@/components/ui/molochain-loader';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { QuickActions } from '@/components/dashboard/QuickActions';
import { GodLayerStatus } from '@/components/dashboard/GodLayerStatus';
import { ContextualGuideHelp } from '@/components/guides/ContextualGuideHelp';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Building, Users, Boxes, Shield, Activity, TrendingUp, Globe2, Package2, Zap, BarChart3, PieChart, LineChart } from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';
import type { MetricCard } from '@/types/dashboard';

const getMetricsCards = (t: (key: string) => string, stats: DashboardStats | undefined): MetricCard[] => [
  {
    title: t('dashboard.metrics.countries'),
    value: '180+',
    icon: '🌍',
    color: 'primary',
    trend: { direction: 'up', value: 12 }
  },
  {
    title: t('dashboard.metrics.departments'),
    value: 12,
    icon: '🏢',
    color: 'primary',
  },
  {
    title: t('dashboard.metrics.divisions'),
    value: 25,
    icon: '🏗️',
    color: 'secondary',
  },
  {
    title: t('dashboard.metrics.guides'),
    value: '130+',
    icon: '📚',
    color: 'warning',
    trend: { direction: 'up', value: 5 }
  },
  {
    title: t('dashboard.metrics.systemUptime'),
    value: `${stats?.systemUptime.toFixed(2) || 99.97}%`,
    icon: '🛡️',
    color: 'secondary',
  },
  {
    title: t('dashboard.metrics.activeModules'),
    value: stats?.totalModules || 42,
    icon: '📦',
    color: 'critical',
    trend: { direction: 'stable', value: 0 }
  },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const isConnected = false;

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboards/stats'],
    refetchInterval: 30000,
    retry: false,
  });

  const metricsCards = useMemo(() => getMetricsCards(t, stats), [t, stats]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('dashboard.toast.unauthorized'),
        description: t('dashboard.toast.unauthorizedDescription'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, t]);

  useEffect(() => {
    if (isConnected) {
    }
  }, [isConnected]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <MoloChainLogo animate size="lg" />
          <MoloChainSpinner size="lg" text={t('dashboard.loading')} className="mt-4" />
        </div>
      </div>
    );
  }

  if (statsError && isUnauthorizedError(statsError)) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold mb-2">{t('dashboard.title')}</h1>
            <p className="text-lg opacity-90">{t('dashboard.subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <Globe2 className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-75">{t('dashboard.header.globalReach')}</p>
                  <p className="text-2xl font-bold">{t('dashboard.header.countriesValue')}</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-75">{t('dashboard.header.activeServices')}</p>
                  <p className="text-2xl font-bold">{t('dashboard.header.modulesValue')}</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-75">{t('dashboard.header.systemUptime')}</p>
                  <p className="text-2xl font-bold">{stats?.systemUptime.toFixed(2) || 99.97}%</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-75">{t('dashboard.header.performance')}</p>
                  <p className="text-2xl font-bold">{t('dashboard.header.performanceValue')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.sections.platformAnalytics')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('dashboard.sections.platformAnalyticsDesc')}</p>
        </motion.div>
        <MetricsCards metrics={metricsCards} />
      </section>

      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <GodLayerStatus />
      </motion.section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.sections.organizationalStructure')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.sections.organizationalStructureDesc')}</p>
        </div>
        <DepartmentOverview />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.sections.systemPerformance')}</h3>
          <SystemPerformance />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.sections.globalCompliance')}</h3>
          <ComplianceStatus />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.sections.liveActivityFeed')}</h3>
          <RecentActivity />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.sections.godLayerActions')}</h3>
          <QuickActions />
        </div>
      </section>

      <ContextualGuideHelp variant="floating" />
    </motion.div>
  );
}
