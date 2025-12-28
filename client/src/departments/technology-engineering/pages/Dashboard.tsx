import { ConfigurableDepartmentDashboard } from "@/components/department";
import { technologyEngineeringConfig } from "@/config/departmentConfigs";

export default function TechnologyEngineeringDashboard() {
  return <ConfigurableDepartmentDashboard config={technologyEngineeringConfig} variant="full" />;
}
