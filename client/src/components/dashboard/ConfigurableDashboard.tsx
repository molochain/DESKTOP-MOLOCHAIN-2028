import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { LucideIcon } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { PageShell, StatCard } from "@/components/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MetricConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  valueKey: string;
  trendKey?: string;
  trendDirection?: "up" | "down";
  format?: "number" | "currency" | "percent";
  subtitle?: string;
}

export interface TabConfig {
  id: string;
  label: string;
  content: ReactNode | ((data: unknown) => ReactNode);
}

export interface ActionConfig {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
  testId: string;
}

export interface DashboardConfig {
  role: string;
  title: string;
  subtitle: string;
  metrics: MetricConfig[];
  tabs?: TabConfig[];
  actions?: ActionConfig[];
  queryKey?: string;
  additionalQueries?: string[];
}

interface ConfigurableDashboardProps {
  config: DashboardConfig;
  mockData?: Record<string, unknown>;
  className?: string;
}

function formatValue(
  value: unknown,
  format?: "number" | "currency" | "percent"
): string {
  if (value === undefined || value === null) return "—";

  const numValue = typeof value === "number" ? value : parseFloat(String(value));

  if (isNaN(numValue)) return String(value);

  switch (format) {
    case "currency":
      if (numValue >= 1000000) {
        return `$${(numValue / 1000000).toFixed(1)}M`;
      }
      if (numValue >= 1000) {
        return `$${(numValue / 1000).toFixed(1)}K`;
      }
      return `$${numValue.toLocaleString()}`;
    case "percent":
      return `${numValue}%`;
    case "number":
    default:
      return numValue.toLocaleString();
  }
}

function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  return path.split(".").reduce((current: unknown, key: string) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function ConfigurableDashboard({
  config,
  mockData,
  className,
}: ConfigurableDashboardProps) {
  const { dashboardData, isLoadingData, error, refetch } = useDashboard();

  const { data: additionalData } = useQuery({
    queryKey: config.queryKey ? [config.queryKey] : ["dashboard", config.role],
    enabled: !!dashboardData && !!config.queryKey,
  });

  const isLoading = isLoadingData;
  const data = mockData || additionalData || dashboardData;

  const testIdPrefix = `${config.role.toLowerCase()}-dashboard`;

  const actions = config.actions?.map((action) => {
    const Icon = action.icon;
    return (
      <Button
        key={action.testId}
        variant={action.variant || "default"}
        onClick={action.onClick}
        data-testid={action.testId}
      >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {action.label}
      </Button>
    );
  });

  return (
    <PageShell
      title={config.title}
      description={config.subtitle}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      actions={actions ? <>{actions}</> : undefined}
      testId={testIdPrefix}
      className={className}
    >
      <div className="space-y-6" data-testid={testIdPrefix}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.metrics.map((metric) => {
            const value = getNestedValue(data, metric.valueKey);
            const trendValue = metric.trendKey
              ? getNestedValue(data, metric.trendKey)
              : undefined;

            return (
              <StatCard
                key={metric.key}
                icon={metric.icon}
                label={metric.label}
                value={formatValue(value, metric.format)}
                trend={
                  trendValue !== undefined
                    ? {
                        value: Number(trendValue),
                        direction: metric.trendDirection || "up",
                      }
                    : undefined
                }
                subtitle={metric.subtitle}
                testId={`${testIdPrefix}-metric-${metric.key}`}
              />
            );
          })}
        </div>

        {config.tabs && config.tabs.length > 0 && (
          <Tabs
            defaultValue={config.tabs[0].id}
            className="w-full"
            data-testid={`${testIdPrefix}-tabs`}
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              {config.tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  data-testid={`${testIdPrefix}-tab-${tab.id}`}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {config.tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                data-testid={`${testIdPrefix}-tabcontent-${tab.id}`}
              >
                {typeof tab.content === "function"
                  ? tab.content(data)
                  : tab.content}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </PageShell>
  );
}

export default ConfigurableDashboard;
