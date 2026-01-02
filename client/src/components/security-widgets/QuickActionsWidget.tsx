import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Zap, 
  Lock, 
  LogOut, 
  Shield, 
  Ban,
  RefreshCw,
  Key,
  AlertTriangle,
  FileText,
  Bell,
  UserX,
  Siren
} from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'secondary';
  requireConfirmation: boolean;
  confirmationMessage?: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface QuickActionsWidgetProps {
  className?: string;
  onActionComplete?: (actionId: string) => void;
  fullView?: boolean;
}

const quickActions: QuickAction[] = [
  {
    id: 'emergency-lockdown',
    label: 'Emergency Lockdown',
    description: 'Lock all user accounts except admins',
    icon: <Lock className="h-4 w-4" />,
    variant: 'destructive',
    requireConfirmation: true,
    confirmationMessage: 'This will immediately lock all non-admin user accounts. Are you sure?',
    endpoint: '/api/security/emergency-lockdown',
    method: 'POST',
    severity: 'critical'
  },
  {
    id: 'force-logout',
    label: 'Force Logout All',
    description: 'Terminate all active sessions',
    icon: <LogOut className="h-4 w-4" />,
    variant: 'destructive',
    requireConfirmation: true,
    confirmationMessage: 'This will log out all users immediately. Continue?',
    endpoint: '/api/security/force-logout-all',
    method: 'POST',
    severity: 'high'
  },
  {
    id: 'reset-mfa',
    label: 'Reset All MFA',
    description: 'Force MFA re-enrollment for all users',
    icon: <Key className="h-4 w-4" />,
    variant: 'secondary',
    requireConfirmation: true,
    confirmationMessage: 'All users will need to re-enroll their MFA devices. Proceed?',
    endpoint: '/api/security/reset-mfa-all',
    method: 'POST',
    severity: 'medium'
  },
  {
    id: 'block-suspicious',
    label: 'Block Suspicious IPs',
    description: 'Auto-block detected threat sources',
    icon: <Ban className="h-4 w-4" />,
    variant: 'destructive',
    requireConfirmation: true,
    confirmationMessage: 'Block all IPs flagged as suspicious?',
    endpoint: '/api/security/block-suspicious-ips',
    method: 'POST',
    severity: 'high'
  },
  {
    id: 'rotate-keys',
    label: 'Rotate API Keys',
    description: 'Regenerate all API keys',
    icon: <RefreshCw className="h-4 w-4" />,
    variant: 'secondary',
    requireConfirmation: true,
    confirmationMessage: 'This will invalidate all existing API keys. Continue?',
    endpoint: '/api/security/rotate-api-keys',
    method: 'POST',
    severity: 'medium'
  },
  {
    id: 'generate-report',
    label: 'Security Report',
    description: 'Generate comprehensive security report',
    icon: <FileText className="h-4 w-4" />,
    variant: 'default',
    requireConfirmation: false,
    endpoint: '/api/security/generate-report',
    method: 'POST',
    severity: 'low'
  },
  {
    id: 'test-alerts',
    label: 'Test Alerts',
    description: 'Send test security alerts',
    icon: <Bell className="h-4 w-4" />,
    variant: 'default',
    requireConfirmation: false,
    endpoint: '/api/security/test-alerts',
    method: 'POST',
    severity: 'low'
  },
  {
    id: 'audit-permissions',
    label: 'Audit Permissions',
    description: 'Review all user permissions',
    icon: <Shield className="h-4 w-4" />,
    variant: 'default',
    requireConfirmation: false,
    endpoint: '/api/security/audit-permissions',
    method: 'POST',
    severity: 'low'
  }
];

export default function QuickActionsWidget({
  className,
  onActionComplete,
  fullView = false
}: QuickActionsWidgetProps) {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const actionMutation = useMutation({
    mutationFn: async (action: QuickAction) => {
      return apiRequest(action.endpoint, action.method, {});
    },
    onSuccess: (_, action) => {
      toast({
        title: 'Action Executed',
        description: `${action.label} completed successfully`
      });
      onActionComplete?.(action.id);
    },
    onError: (error: any, action) => {
      toast({
        title: 'Action Failed',
        description: error.message || `Failed to execute ${action.label}`,
        variant: 'destructive'
      });
    }
  });

  const handleActionClick = (action: QuickAction) => {
    if (action.requireConfirmation) {
      setSelectedAction(action);
      setShowConfirmDialog(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = (action: QuickAction) => {
    actionMutation.mutate(action);
    setShowConfirmDialog(false);
    setSelectedAction(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 hover:bg-red-200 text-red-700';
      case 'high': return 'bg-orange-100 hover:bg-orange-200 text-orange-700';
      case 'medium': return 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700';
      case 'low': return 'bg-blue-100 hover:bg-blue-200 text-blue-700';
      default: return '';
    }
  };

  const displayActions = fullView ? quickActions : quickActions.slice(0, 6);

  return (
    <>
      <Card className={cn('h-full', className)} data-testid="widget-quick-actions">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Quick Actions</CardTitle>
          </div>
          <CardDescription>Emergency and administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(
            'grid gap-2',
            fullView ? 'grid-cols-2' : 'grid-cols-1'
          )}>
            {displayActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                className={cn(
                  'justify-start h-auto py-2 px-3',
                  action.severity === 'critical' && 'bg-red-500 hover:bg-red-600',
                  action.severity === 'high' && 'bg-orange-500 hover:bg-orange-600'
                )}
                onClick={() => handleActionClick(action)}
                disabled={actionMutation.isPending}
                data-testid={`button-action-${action.id}`}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="mt-0.5">{action.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs opacity-90 font-normal">
                      {action.description}
                    </div>
                  </div>
                  {action.severity === 'critical' && (
                    <Badge variant="destructive" className="ml-auto">
                      Critical
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {!fullView && quickActions.length > 6 && (
            <Button 
              variant="outline" 
              className="w-full mt-3"
              onClick={() => {}}
              data-testid="button-view-all-actions"
            >
              View All Actions ({quickActions.length})
            </Button>
          )}

          {/* Emergency Notice */}
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-2">
              <Siren className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Emergency Actions
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Use with caution. All actions are logged and audited.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent aria-describedby={undefined}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Action
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction?.confirmationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              {selectedAction?.icon}
              <span className="font-medium">{selectedAction?.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedAction?.description}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                selectedAction?.severity === 'critical' && 'bg-red-500 hover:bg-red-600',
                selectedAction?.severity === 'high' && 'bg-orange-500 hover:bg-orange-600'
              )}
              onClick={() => selectedAction && executeAction(selectedAction)}
            >
              Execute Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}