import { ConfigurableDepartmentDashboard } from "@/components/department";
import { marketingBrandingConfig } from "@/config/departmentConfigs";

export default function MarketingBrandingDashboard() {
  return <ConfigurableDepartmentDashboard config={marketingBrandingConfig} variant="simple" />;
}
