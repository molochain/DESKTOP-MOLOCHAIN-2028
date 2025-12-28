import { ConfigurableDepartmentDashboard } from "@/components/department";
import { managementConfig } from "@/config/departmentConfigs";

export default function ManagementDashboard() {
  return <ConfigurableDepartmentDashboard config={managementConfig} variant="full" />;
}
