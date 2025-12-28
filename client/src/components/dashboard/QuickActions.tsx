import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  BarChart3, 
  Shield, 
  Database, 
  Download, 
  Settings, 
  RefreshCw,
  CheckCircle 
} from 'lucide-react';
import type { QuickAction } from '@/types/dashboard';

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logActivityMutation = useMutation({
    mutationFn: async (activity: { action: string; description: string; severity: string }) => {
      return apiRequest('POST', '/api/activity', activity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
    },
  });

  const handleCreateModule = () => {
    toast({
      title: "Module Creation",
      description: "Module creation wizard would open here",
    });
    
    logActivityMutation.mutate({
      action: 'module_create_initiated',
      description: 'User initiated module creation process',
      severity: 'info',
    });
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReportProgress(0);
    
    // Simulate report generation with progress
    const interval = setInterval(() => {
      setReportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGeneratingReport(false);
          toast({
            title: "Report Generated",
            description: "System performance report has been generated successfully",
          });
          
          logActivityMutation.mutate({
            action: 'report_generated',
            description: 'System performance report generated',
            severity: 'success',
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSecurityAudit = () => {
    toast({
      title: "Security Audit",
      description: "Security audit has been initiated",
    });
    
    logActivityMutation.mutate({
      action: 'security_audit_initiated',
      description: 'Security audit scan started',
      severity: 'info',
    });
  };

  const handleBackupSystem = () => {
    toast({
      title: "System Backup",
      description: "System backup process has been started",
    });
    
    logActivityMutation.mutate({
      action: 'system_backup_initiated',
      description: 'System backup process started',
      severity: 'info',
    });
  };

  const quickActions: QuickAction[] = [
    {
      id: 'create-module',
      title: 'Create Module',
      icon: 'Plus',
      color: 'bg-primary/20 border-primary text-primary',
      onClick: handleCreateModule,
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      icon: 'BarChart3',
      color: 'bg-green-500/20 border-green-500 text-green-500',
      onClick: handleGenerateReport,
    },
    {
      id: 'security-audit',
      title: 'Security Audit',
      icon: 'Shield',
      color: 'bg-yellow-500/20 border-yellow-500 text-yellow-500',
      onClick: handleSecurityAudit,
    },
    {
      id: 'backup-system',
      title: 'Backup System',
      icon: 'Database',
      color: 'bg-red-500/20 border-red-500 text-red-500',
      onClick: handleBackupSystem,
    },
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      Plus: <Plus className="w-5 h-5" />,
      BarChart3: <BarChart3 className="w-5 h-5" />,
      Shield: <Shield className="w-5 h-5" />,
      Database: <Database className="w-5 h-5" />,
      Download: <Download className="w-5 h-5" />,
      Settings: <Settings className="w-5 h-5" />,
      RefreshCw: <RefreshCw className="w-5 h-5" />,
      CheckCircle: <CheckCircle className="w-5 h-5" />,
    };
    return icons[iconName as keyof typeof icons] || <Settings className="w-5 h-5" />;
  };

  return (
    <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto p-4 text-left hover:shadow-md transition-all duration-200 ${action.color}`}
              onClick={action.onClick}
              disabled={isGeneratingReport && action.id === 'generate-report'}
            >
              <div className="flex flex-col items-start space-y-2">
                {getIcon(action.icon)}
                <span className="text-sm font-medium">
                  {action.id === 'generate-report' && isGeneratingReport ? 'Generating...' : action.title}
                </span>
              </div>
            </Button>
          ))}
        </div>

        {/* Report Generation Progress */}
        {isGeneratingReport && (
          <div className="mb-6 p-4 bg-blue-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-400">Generating Report</span>
              <span className="text-sm font-bold text-blue-400">{reportProgress}%</span>
            </div>
            <Progress value={reportProgress} className="h-2" />
          </div>
        )}

        {/* System Health Card */}
        <div className="p-4 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Health</span>
            <span className="text-sm font-bold text-green-500">Excellent</span>
          </div>
          
          <Progress value={96} className="h-2 mb-2" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Overall Performance</span>
            <span className="text-xs font-bold text-green-500">96%</span>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white justify-start"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
