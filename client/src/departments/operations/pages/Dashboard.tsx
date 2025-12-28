import { ConfigurableDepartmentDashboard } from "@/components/department";
import { operationsConfig } from "@/config/departmentConfigs";

export default function OperationsDashboard() {
  return <ConfigurableDepartmentDashboard config={operationsConfig} variant="simple" />;
}
