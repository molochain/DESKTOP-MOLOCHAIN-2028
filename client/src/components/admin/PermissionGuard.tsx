import { ReactNode, ComponentType } from 'react';
import { useLocation } from 'wouter';
import { ShieldX } from 'lucide-react';
import { usePermission, Permission } from '@/hooks/use-permission';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
  children: ReactNode;
}

function AccessDeniedUI() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6" data-testid="access-denied-container">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You don't have permission to view this content. Please contact your administrator if you believe this is an error.
          </p>
          <Button
            variant="outline"
            onClick={() => setLocation('/admin')}
            data-testid="button-go-to-dashboard"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showAccessDenied = false,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermission();

  if (isLoading) {
    return null;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showAccessDenied) {
    return <AccessDeniedUI />;
  }

  return <>{fallback}</>;
}

export interface WithPermissionOptions {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

export function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithPermissionOptions
) {
  function WithPermissionComponent(props: P) {
    return (
      <PermissionGuard
        permission={options.permission}
        permissions={options.permissions}
        requireAll={options.requireAll}
        fallback={options.fallback}
        showAccessDenied={options.showAccessDenied}
      >
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  }

  WithPermissionComponent.displayName = `WithPermission(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithPermissionComponent;
}

export interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  redirectTo?: string;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  redirectTo = '/admin',
  children,
}: PermissionGateProps) {
  const [, setLocation] = useLocation();
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermission();

  if (isLoading) {
    return null;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    setLocation(redirectTo);
    return null;
  }

  return <>{children}</>;
}
