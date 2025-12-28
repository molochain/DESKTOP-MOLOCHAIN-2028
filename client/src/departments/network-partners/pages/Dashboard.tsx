import { ConfigurableDepartmentDashboard } from "@/components/department";
import { networkPartnersConfig } from "@/config/departmentConfigs";

export default function NetworkPartnersDashboard() {
  return <ConfigurableDepartmentDashboard config={networkPartnersConfig} variant="simple" />;
}
