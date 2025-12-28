import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Box, 
  FileText, 
  BookOpen, 
  Scale, 
  Megaphone, 
  Network, 
  Target,
  TrendingUp,
  Package,
  Cog
} from "lucide-react";

interface DashboardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  metrics: Array<{ label: string; value: string }>;
}

function BaseDashboard({ title, description, icon, metrics }: DashboardProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SupplyChainDashboard() {
  return (
    <BaseDashboard
      title="Supply Chain"
      description="End-to-end supply chain management"
      icon={<Package className="h-8 w-8 text-green-600" />}
      metrics={[
        { label: "Active Shipments", value: "2,847" },
        { label: "On-Time Delivery", value: "94.2%" },
        { label: "Inventory Accuracy", value: "99.1%" },
        { label: "Cost Savings", value: "$4.2M" }
      ]}
    />
  );
}

export function OperationsDashboard() {
  return (
    <BaseDashboard
      title="Operations"
      description="Operational excellence and efficiency"
      icon={<Cog className="h-8 w-8 text-blue-600" />}
      metrics={[
        { label: "Process Efficiency", value: "92%" },
        { label: "Quality Score", value: "98.5%" },
        { label: "Active Projects", value: "156" },
        { label: "SLA Compliance", value: "99.2%" }
      ]}
    />
  );
}

export function DocumentsDashboard() {
  return (
    <BaseDashboard
      title="Documents Library"
      description="Document management and compliance"
      icon={<FileText className="h-8 w-8 text-purple-600" />}
      metrics={[
        { label: "Total Documents", value: "45,892" },
        { label: "Compliance Rate", value: "100%" },
        { label: "Active Workflows", value: "234" },
        { label: "Storage Used", value: "2.4TB" }
      ]}
    />
  );
}

export function LearningDashboard() {
  return (
    <BaseDashboard
      title="Learning & Knowledge"
      description="Training and development programs"
      icon={<BookOpen className="h-8 w-8 text-amber-600" />}
      metrics={[
        { label: "Courses Available", value: "892" },
        { label: "Completion Rate", value: "87%" },
        { label: "Certified Staff", value: "12,450" },
        { label: "Training Hours", value: "2.1M" }
      ]}
    />
  );
}

export function LegalDashboard() {
  return (
    <BaseDashboard
      title="Legal & Risk"
      description="Legal compliance and risk management"
      icon={<Scale className="h-8 w-8 text-red-600" />}
      metrics={[
        { label: "Active Cases", value: "47" },
        { label: "Compliance Score", value: "98%" },
        { label: "Risk Assessment", value: "Low" },
        { label: "Contracts Managed", value: "3,245" }
      ]}
    />
  );
}

export function MarketingDashboard() {
  return (
    <BaseDashboard
      title="Marketing & Branding"
      description="Brand management and marketing campaigns"
      icon={<Megaphone className="h-8 w-8 text-pink-600" />}
      metrics={[
        { label: "Campaign ROI", value: "342%" },
        { label: "Brand Awareness", value: "78%" },
        { label: "Lead Generation", value: "15,234" },
        { label: "Social Reach", value: "2.4M" }
      ]}
    />
  );
}

export function NetworkDashboard() {
  return (
    <BaseDashboard
      title="Network & Partners"
      description="Partner ecosystem and network management"
      icon={<Network className="h-8 w-8 text-cyan-600" />}
      metrics={[
        { label: "Active Partners", value: "1,247" },
        { label: "Network Coverage", value: "195 countries" },
        { label: "Integration Rate", value: "94%" },
        { label: "Partner Revenue", value: "$45M" }
      ]}
    />
  );
}

export function StrategyDashboard() {
  return (
    <BaseDashboard
      title="Strategy & Development"
      description="Strategic planning and business development"
      icon={<Target className="h-8 w-8 text-indigo-600" />}
      metrics={[
        { label: "Strategic Goals", value: "24/30" },
        { label: "Growth Rate", value: "+18%" },
        { label: "Market Share", value: "12.4%" },
        { label: "New Markets", value: "7" }
      ]}
    />
  );
}

export default function AllDepartmentDashboards() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">All Department Dashboards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supply Chain</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>Active</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>Active</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
