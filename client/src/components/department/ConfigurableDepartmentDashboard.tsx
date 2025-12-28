import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricItem {
  label: string;
  value: string;
  trend?: string;
}

export interface DivisionItem {
  name: string;
  description: string;
  size: number;
}

export interface InitiativeItem {
  name: string;
  status: "completed" | "active" | "planned";
  description: string;
}

export interface DepartmentConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  metrics: MetricItem[];
  mission?: string;
  functions?: string[];
  divisions?: DivisionItem[];
  initiatives?: InitiativeItem[];
}

export interface ConfigurableDepartmentDashboardProps {
  config: DepartmentConfig;
  variant?: "simple" | "full";
}

const colorClasses: Record<string, { bg: string; text: string }> = {
  green: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-600" },
  blue: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-600" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/20", text: "text-purple-600" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/20", text: "text-amber-600" },
  red: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-600" },
  pink: { bg: "bg-pink-100 dark:bg-pink-900/20", text: "text-pink-600" },
  cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/20", text: "text-cyan-600" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/20", text: "text-indigo-600" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/20", text: "text-orange-600" },
};

function getStatusVariant(status: InitiativeItem["status"]): "default" | "secondary" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "active":
      return "secondary";
    case "planned":
      return "outline";
    default:
      return "outline";
  }
}

export function ConfigurableDepartmentDashboard({ 
  config, 
  variant = "full" 
}: ConfigurableDepartmentDashboardProps) {
  const Icon = config.icon;
  const colors = colorClasses[config.color] || colorClasses.blue;
  const hasFullContent = config.mission || config.functions || config.divisions || config.initiatives;
  const effectiveVariant = variant === "full" && hasFullContent ? "full" : "simple";

  return (
    <div className="space-y-6 p-6" data-testid={`department-dashboard-${config.id}`}>
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-lg", colors.bg)}>
          <Icon className={cn("h-8 w-8", colors.text)} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" data-testid="department-title">{config.name}</h1>
          <p className="text-muted-foreground" data-testid="department-description">{config.description}</p>
        </div>
      </div>

      {effectiveVariant === "full" && config.mission && (
        <Card data-testid="mission-card">
          <CardHeader>
            <CardTitle>Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{config.mission}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-grid">
        {config.metrics.map((metric, index) => (
          <Card key={index} data-testid={`metric-card-${index}`}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.trend && (
                <p className="text-xs text-muted-foreground">{metric.trend}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {effectiveVariant === "full" && (config.functions || config.divisions) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {config.functions && config.functions.length > 0 && (
            <Card data-testid="functions-card">
              <CardHeader>
                <CardTitle>Key Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {config.functions.map((func, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {func}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {config.divisions && config.divisions.length > 0 && (
            <Card data-testid="divisions-card">
              <CardHeader>
                <CardTitle>Divisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.divisions.map((division, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{division.name}</span>
                      <span className="text-sm text-muted-foreground">{division.size} employees</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{division.description}</p>
                    <Progress value={Math.min((division.size / 500) * 100, 100)} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {effectiveVariant === "full" && config.initiatives && config.initiatives.length > 0 && (
        <Card data-testid="initiatives-card">
          <CardHeader>
            <CardTitle>Active Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.initiatives.map((initiative, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{initiative.name}</h4>
                      <Badge variant={getStatusVariant(initiative.status)}>
                        {initiative.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{initiative.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ConfigurableDepartmentDashboard;
