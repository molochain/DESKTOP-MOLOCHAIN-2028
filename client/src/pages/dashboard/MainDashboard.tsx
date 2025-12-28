import { useEffect, useState } from 'react';
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

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  // WebSocket status is managed by CollaborationProvider
  const isConnected = false; // Disabled for stability in development

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboards/stats'],
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // WebSocket status is handled by the context provider
  useEffect(() => {
    if (isConnected) {
    }
  }, [isConnected]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <MoloChainLogo animate size="lg" />
          <MoloChainSpinner size="lg" text="Loading dashboard..." className="mt-4" />
        </div>
      </div>
    );
  }

  if (statsError && isUnauthorizedError(statsError)) {
    return null; // Will be handled by useEffect above
  }

  // Prepare metrics cards - aligned with actual ecosystem structure
  const metricsCards: MetricCard[] = [
    {
      title: 'Countries',
      value: '180+',
      icon: '🌍',
      color: 'primary',
      trend: { direction: 'up', value: 12 }
    },
    {
      title: 'Departments',
      value: 12, // Actual number from scripts
      icon: '🏢',
      color: 'primary',
    },
    {
      title: 'Divisions',
      value: 25, // Actual number from scripts
      icon: '🏗️',
      color: 'secondary',
    },
    {
      title: 'GUIDES',
      value: '130+',
      icon: '📚',
      color: 'warning',
      trend: { direction: 'up', value: 5 }
    },
    {
      title: 'System Uptime',
      value: `${stats?.systemUptime.toFixed(2) || 99.97}%`,
      icon: '🛡️',
      color: 'secondary',
    },
    {
      title: 'Active Modules',
      value: stats?.totalModules || 42,
      icon: '📦',
      color: 'critical',
      trend: { direction: 'stable', value: 0 }
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Enhanced Header with Gradient */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold mb-2">Welcome to MoloChain</h1>
            <p className="text-lg opacity-90">Global Logistics Command Center</p>
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
                  <p className="text-sm opacity-75">Global Reach</p>
                  <p className="text-2xl font-bold">180+ Countries</p>
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
                  <p className="text-sm opacity-75">Active Services</p>
                  <p className="text-2xl font-bold">42 Modules</p>
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
                  <p className="text-sm opacity-75">System Uptime</p>
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
                  <p className="text-sm opacity-75">Performance</p>
                  <p className="text-2xl font-bold">Optimal</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Metrics with Animation */}
      <section>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Real-time metrics across all divisions</p>
        </motion.div>
        <MetricsCards metrics={metricsCards} />
      </section>

      {/* GOD Layer Status with Enhanced Design */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <GodLayerStatus />
      </motion.section>

      {/* Department Overview */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Organizational Structure</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Departments, divisions, and operational units</p>
        </div>
        <DepartmentOverview />
      </section>

      {/* System Performance & Compliance */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Performance</h3>
          <SystemPerformance />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Global Compliance Status</h3>
          <ComplianceStatus />
        </div>
      </section>

      {/* Recent Activity & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Activity Feed</h3>
          <RecentActivity />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GOD Layer Actions</h3>
          <QuickActions />
        </div>
      </section>

      {/* Contextual Guide Help */}
      <ContextualGuideHelp variant="floating" />
    </motion.div>
  );
}