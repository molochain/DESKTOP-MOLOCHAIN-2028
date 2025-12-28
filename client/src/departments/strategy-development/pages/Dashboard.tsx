import { ConfigurableDepartmentDashboard } from "@/components/department";
import { strategyDevelopmentConfig } from "@/config/departmentConfigs";

export default function StrategyDevelopmentDashboard() {
  return <ConfigurableDepartmentDashboard config={strategyDevelopmentConfig} variant="simple" />;
}
