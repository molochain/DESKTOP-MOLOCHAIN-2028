import { ConfigurableDepartmentDashboard } from "@/components/department";
import { humanResourcesConfig } from "@/config/departmentConfigs";

export default function HRDashboard() {
  return <ConfigurableDepartmentDashboard config={humanResourcesConfig} variant="full" />;
}
