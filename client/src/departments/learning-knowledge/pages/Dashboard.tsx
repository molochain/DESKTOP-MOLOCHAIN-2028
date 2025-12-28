import { ConfigurableDepartmentDashboard } from "@/components/department";
import { learningKnowledgeConfig } from "@/config/departmentConfigs";

export default function LearningKnowledgeDashboard() {
  return <ConfigurableDepartmentDashboard config={learningKnowledgeConfig} variant="simple" />;
}
