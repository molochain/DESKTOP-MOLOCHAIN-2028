import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  testId?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  testId = "empty-state",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      data-testid={testId}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        {icon || <Inbox className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3
        className="text-lg font-semibold"
        data-testid={`${testId}-title`}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm text-muted-foreground mt-1 max-w-sm"
          data-testid={`${testId}-description`}
        >
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4" data-testid={`${testId}-action`}>
          {action}
        </div>
      )}
    </div>
  );
}
