import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Activity, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

// Define ActivityLog type locally
type ActivityLog = {
  id: string | number;
  userId?: string;
  action: string;
  description?: string;
  category: 'success' | 'warning' | 'info' | 'error';
  metadata?: any;
  timestamp: string | Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
};

interface RecentActivityProps {
  className?: string;
}

export function RecentActivity({ className }: RecentActivityProps) {
  const { data: activities, isLoading, error } = useQuery<ActivityLog[]>({
    queryKey: ['/api/activity'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400">Error loading activity data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityDetails = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          color: 'bg-green-500',
          badge: 'success',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
          color: 'bg-yellow-500',
          badge: 'warning',
        };
      case 'error':
        return {
          icon: <XCircle className="w-4 h-4 text-red-500" />,
          color: 'bg-red-500',
          badge: 'error',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-4 h-4 text-blue-500" />,
          color: 'bg-blue-500',
          badge: 'info',
        };
    }
  };

  // Default activity data if none exists
  const defaultActivities: ActivityLog[] = [
    {
      id: 1,
      userId: 'admin',
      action: 'system_backup',
      description: 'System backup completed successfully',
      category: 'success',
      metadata: null,
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    {
      id: 2,
      userId: 'admin',
      action: 'compliance_review',
      description: 'GDPR compliance review scheduled',
      category: 'warning',
      metadata: null,
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
    {
      id: 3,
      userId: 'admin',
      action: 'module_deploy',
      description: 'New module deployed to production',
      category: 'info',
      metadata: null,
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: 4,
      userId: 'admin',
      action: 'performance_optimization',
      description: 'Performance optimization completed',
      category: 'success',
      metadata: null,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      id: 5,
      userId: 'admin',
      action: 'security_scan',
      description: 'Security vulnerability scan completed',
      category: 'info',
      metadata: null,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  ];

  const displayData = activities || defaultActivities;

  return (
    <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
              <CardHeader>
          <Activity className="w-5 h-5" />
          <span>Recent Activity</span>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayData.map((activity) => {
            const severityDetails = getSeverityDetails(activity.category || 'info');
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${severityDetails.color} mt-2`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{activity.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Unknown time'}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {activity.action}
                    </Badge>
                  </div>
                </div>
                {severityDetails.icon}
              </div>
            );
          })}
        </div>

        {displayData.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
