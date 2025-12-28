import { ConfigurableDepartmentDashboard } from "@/components/department";
import { supplyChainConfig } from "@/config/departmentConfigs";

export default function SupplyChainDashboard() {
  return <ConfigurableDepartmentDashboard config={supplyChainConfig} variant="simple" />;
}
