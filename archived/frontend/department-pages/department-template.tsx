import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface DepartmentConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  mission: string;
  metrics: {
    primary: { label: string; value: string; trend: string };
    secondary: { label: string; value: string; trend: string };
    tertiary: { label: string; value: string; trend: string };
    quaternary: { label: string; value: string; trend: string };
  };
  functions: string[];
  divisions: Array<{ name: string; description: string; size: number }>;
  initiatives: Array<{ name: string; status: "completed" | "active" | "planned"; description: string }>;
}

interface DepartmentDashboardProps {
  config: DepartmentConfig;
}

export default function DepartmentDashboard({ config }: DepartmentDashboardProps) {
  const Icon = config.icon;
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/20`}>
          <Icon className={`h-8 w-8 text-${config.color}-600`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{config.name}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{config.mission}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(config.metrics).map(([key, metric]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
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

        <Card>
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
                <Progress value={(division.size / 500) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
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
                    <Badge variant={initiative.status === "completed" ? "default" : initiative.status === "active" ? "secondary" : "outline"}>
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
    </div>
  );
}
