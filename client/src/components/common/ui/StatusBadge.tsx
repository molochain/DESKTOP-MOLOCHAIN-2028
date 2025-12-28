import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusVariant = "success" | "warning" | "error" | "info" | "pending";

export interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
  testId?: string;
}

const statusStyles: Record<StatusVariant, string> = {
  success: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  error: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  pending: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800",
};

const statusLabels: Record<StatusVariant, string> = {
  success: "Success",
  warning: "Warning",
  error: "Error",
  info: "Info",
  pending: "Pending",
};

function isStatusVariant(status: string): status is StatusVariant {
  return status in statusStyles;
}

export function StatusBadge({
  status,
  label,
  className,
  testId = "status-badge",
}: StatusBadgeProps) {
  const variant = isStatusVariant(status) ? status : "pending";
  const displayLabel = label || (isStatusVariant(status) ? statusLabels[status] : status);

  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[variant], className)}
      data-testid={testId}
      data-status={status}
    >
      {displayLabel}
    </Badge>
  );
}
