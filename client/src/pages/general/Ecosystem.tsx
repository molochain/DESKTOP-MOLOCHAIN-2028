import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { DepartmentOverview } from '@/components/dashboard/DepartmentOverview';
import { SystemPerformance } from '@/components/dashboard/SystemPerformance';
import { ComplianceStatus } from '@/components/dashboard/ComplianceStatus';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { GodLayerStatus } from '@/components/dashboard/GodLayerStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building, Users, Boxes, Shield, Brain, Activity, Database, Layers, Sparkles, Globe, TrendingUp, Network } from 'lucide-react';
import { Link } from 'wouter';
import type { MetricCard, EcosystemStatus } from '@/types/dashboard';
import { motion } from 'framer-motion';
import { MoloChainSkeleton, MoloChainLoadingCard } from '@/components/ui/molochain-loader';

export default function EcosystemEnhanced() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const { data: status, isLoading: statusLoading } = useQuery<EcosystemStatus>({
    queryKey: ['/api/ecosystem/status'],
    refetchInterval: 30000,
  });

  const { data: departments } = useQuery({
    queryKey: ['/api/ecosystem/departments'],
  });

  const metricsCards: MetricCard[] = useMemo(() => [
    {
      title: t('ecosystem.stats.countries'),
      value: '180+',
      icon: '🌍',
      color: 'primary',
      trend: { direction: 'up', value: 12 }
    },
    {
      title: t('ecosystem.stats.departments'),
      value: status?.organizational?.departments?.total || 12,
      icon: '🏢',
      color: 'primary',
    },
    {
      title: t('ecosystem.stats.divisions'),
      value: status?.organizational?.divisions?.total || 25,
      icon: '🏗️',
      color: 'secondary',
    },
    {
      title: t('ecosystem.stats.systemHealth'),
      value: `${status?.systemHealth || 100}%`,
      icon: '🛡️',
      color: (status?.systemHealth ?? 100) >= 90 ? 'success' : (status?.systemHealth ?? 100) >= 70 ? 'warning' : 'critical',
    },
    {
      title: t('ecosystem.stats.activeServices'),
      value: `${status?.activeServices || 0}/${status?.totalServices || 0}`,
      icon: '⚡',
      color: 'secondary',
    },
    {
      title: t('ecosystem.stats.activeAlerts'),
      value: status?.organizational?.alerts?.count || 0,
      icon: '🔔',
      color: (status?.organizational?.alerts?.critical ?? 0) > 0 ? 'critical' : 'warning',
    },
  ], [t, status]);

  const departmentLinks = useMemo(() => [
    { name: t('ecosystem.departments.accounting'), icon: '💰', path: '/god-layer/accounting' },
    { name: t('ecosystem.departments.management'), icon: '👔', path: '/god-layer/management' },
    { name: t('ecosystem.departments.technology'), icon: '💻', path: '/god-layer/technology' },
    { name: t('ecosystem.departments.operations'), icon: '⚙️', path: '/departments/operations' },
    { name: t('ecosystem.departments.supplyChain'), icon: '📦', path: '/departments/supply-chain' },
    { name: t('ecosystem.departments.humanResources'), icon: '👥', path: '/departments/hr' },
    { name: t('ecosystem.departments.legalRisk'), icon: '⚖️', path: '/departments/legal' },
    { name: t('ecosystem.departments.marketing'), icon: '📈', path: '/departments/marketing' },
  ], [t]);

  if (isInitialLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <MoloChainSkeleton className="h-16 w-96 mx-auto mb-8" />
        <MoloChainLoadingCard className="max-w-6xl mx-auto h-96" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-800"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}} />
        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center text-white"
          >
            <Badge className="mb-4 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white border-white/30">
              <Globe className="w-4 h-4 mr-1" /> {t('ecosystem.globalControl')}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              {t('ecosystem.title')}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t('ecosystem.subtitle')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <Shield className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{status?.systemHealth || 100}%</p>
                <p className="text-sm opacity-75">{t('ecosystem.stats.systemHealth')}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <Building className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{status?.organizational?.departments?.total || 12}</p>
                <p className="text-sm opacity-75">{t('ecosystem.stats.departments')}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <Network className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{status?.activeServices || 45}</p>
                <p className="text-sm opacity-75">{t('ecosystem.stats.activeServices')}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <Activity className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                <p className="text-2xl font-bold">{t('ecosystem.stats.live')}</p>
                <p className="text-sm opacity-75">{t('ecosystem.stats.realtimeStatus')}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-2 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                {t('ecosystem.overview')}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('ecosystem.overviewDescription')}</p>
            </CardHeader>
            <CardContent className="pt-6">
              <MetricsCards metrics={metricsCards} />
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GodLayerStatus />
        </motion.section>

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-xl border-2 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-500" />
                {t('ecosystem.sections.organizationalStructure')}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('ecosystem.sections.organizationalStructureDesc')}</p>
            </CardHeader>
            <CardContent className="pt-6">
              <DepartmentOverview />
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="shadow-xl border-2 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {t('ecosystem.sections.systemPerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <SystemPerformance />
            </CardContent>
          </Card>
          <Card className="shadow-xl border-2 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                {t('ecosystem.sections.globalCompliance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ComplianceStatus />
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="shadow-xl border-2 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                {t('ecosystem.sections.liveActivityFeed')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RecentActivity />
            </CardContent>
          </Card>
          <Card className="shadow-xl border-2 hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                {t('ecosystem.sections.godLayerActions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <QuickActions />
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-gray-600" />
                {t('ecosystem.sections.departmentDashboards')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {departmentLinks.map((dept, index) => (
                  <motion.div
                    key={dept.path}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    <Link href={dept.path}>
                      <Card className="p-4 hover:shadow-lg hover:border-blue-500/50 transition-all duration-300 cursor-pointer border-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{dept.icon}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{dept.name}</span>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </motion.div>
  );
}
