import { ReactNode } from "react";
import { AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageShellProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
  testId?: string;
}

function PageShellSkeleton() {
  return (
    <div className="space-y-6" data-testid="page-shell-loading">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export function PageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  isLoading = false,
  error = null,
  onRetry,
  className,
  testId = "page-shell",
}: PageShellProps) {
  if (isLoading) {
    return <PageShellSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6" data-testid={`${testId}-error`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "Something went wrong while loading this page."}
          </AlertDescription>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-4"
              data-testid="button-retry"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("p-6 space-y-6", className)} data-testid={testId}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className="flex items-center space-x-1 text-sm text-muted-foreground"
          data-testid={`${testId}-breadcrumbs`}
        >
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid={`${testId}-title`}
          >
            {title}
          </h1>
          {description && (
            <p
              className="text-muted-foreground"
              data-testid={`${testId}-description`}
            >
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div
            className="flex flex-wrap gap-2"
            data-testid={`${testId}-actions`}
          >
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
