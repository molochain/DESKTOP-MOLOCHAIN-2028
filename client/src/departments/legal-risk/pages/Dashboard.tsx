import { ConfigurableDepartmentDashboard } from "@/components/department";
import { legalRiskConfig } from "@/config/departmentConfigs";

export default function LegalRiskDashboard() {
  return <ConfigurableDepartmentDashboard config={legalRiskConfig} variant="simple" />;
}
