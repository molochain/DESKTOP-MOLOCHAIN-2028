import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  subtitle?: string;
  className?: string;
  testId?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  subtitle,
  className,
  testId = "stat-card",
}: StatCardProps) {
  return (
    <Card className={cn("", className)} data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`${testId}-value`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center text-xs",
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            )}
            data-testid={`${testId}-trend`}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            <span>{trend.value}%</span>
          </div>
        )}
        {subtitle && (
          <p
            className="text-xs text-muted-foreground mt-1"
            data-testid={`${testId}-subtitle`}
          >
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
