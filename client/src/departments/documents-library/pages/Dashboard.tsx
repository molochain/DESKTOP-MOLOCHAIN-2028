import { ConfigurableDepartmentDashboard } from "@/components/department";
import { documentsLibraryConfig } from "@/config/departmentConfigs";

export default function DocumentsLibraryDashboard() {
  return <ConfigurableDepartmentDashboard config={documentsLibraryConfig} variant="simple" />;
}
