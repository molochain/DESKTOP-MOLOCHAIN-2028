import { 
  Users, 
  Briefcase, 
  Code, 
  FileText, 
  BookOpen, 
  Scale, 
  Megaphone, 
  Network, 
  Target,
  Package,
  Cog
} from "lucide-react";
import type { DepartmentConfig } from "@/components/department";

export const humanResourcesConfig: DepartmentConfig = {
  id: "human-resources",
  name: "Human Resources",
  description: "Talent management and employee experience",
  icon: Users,
  color: "blue",
  mission: "Attract, develop, and retain world-class talent while fostering an inclusive culture that drives innovation and excellence across MoloChain's global workforce of 45,000+ employees.",
  metrics: [
    { label: "Employee Satisfaction", value: "87%", trend: "+3% from last quarter" },
    { label: "Retention Rate", value: "94.2%", trend: "Industry leading" },
    { label: "Open Positions", value: "342" },
    { label: "Training Hours", value: "2.1M", trend: "YTD delivered" }
  ],
  functions: [
    "Talent acquisition and recruitment",
    "Employee development and training",
    "Performance management",
    "Compensation and benefits",
    "Employee relations and engagement"
  ],
  divisions: [
    { name: "Talent Acquisition", description: "Global recruitment and onboarding", size: 285 },
    { name: "Learning & Development", description: "Training and career development", size: 175 },
    { name: "Compensation & Benefits", description: "Rewards and benefits management", size: 145 },
    { name: "Employee Experience", description: "Culture and engagement initiatives", size: 195 }
  ],
  initiatives: [
    { name: "AI Recruitment Platform", status: "completed", description: "Smart candidate matching system" },
    { name: "Global Wellness Program", status: "active", description: "Employee health and wellbeing" },
    { name: "Leadership Academy 2.0", status: "active", description: "Next-gen leadership development" }
  ]
};

export const managementConfig: DepartmentConfig = {
  id: "management",
  name: "Management",
  description: "Executive leadership and strategic direction",
  icon: Briefcase,
  color: "amber",
  mission: "Provide visionary leadership and strategic direction to drive MoloChain's global expansion, ensuring sustainable growth and stakeholder value creation.",
  metrics: [
    { label: "Strategic Goals", value: "14/15", trend: "93% achievement rate" },
    { label: "Shareholder Value", value: "+28%", trend: "YoY growth" },
    { label: "Board Satisfaction", value: "4.8/5" },
    { label: "Decision Velocity", value: "2.3 days", trend: "Avg. time to decision" }
  ],
  functions: [
    "Strategic planning and execution",
    "Corporate governance",
    "Stakeholder management",
    "Executive decision making",
    "Organizational alignment"
  ],
  divisions: [
    { name: "Executive Office", description: "C-suite and executive support", size: 85 },
    { name: "Strategy & Planning", description: "Long-term strategic initiatives", size: 125 },
    { name: "Corporate Development", description: "M&A and partnerships", size: 95 },
    { name: "Investor Relations", description: "Stakeholder communication", size: 65 }
  ],
  initiatives: [
    { name: "Digital Transformation 2025", status: "active", description: "Company-wide digital evolution" },
    { name: "Global Expansion Phase 4", status: "planned", description: "Entry into 20 new markets" },
    { name: "Sustainability Leadership", status: "active", description: "Carbon neutral by 2030" }
  ]
};

export const technologyEngineeringConfig: DepartmentConfig = {
  id: "technology-engineering",
  name: "Technology & Engineering",
  description: "Innovation and technical infrastructure",
  icon: Code,
  color: "purple",
  mission: "Drive technological innovation and maintain world-class infrastructure to power MoloChain's global operations, ensuring 99.99% uptime and cutting-edge solutions.",
  metrics: [
    { label: "System Uptime", value: "99.97%", trend: "6 months streak" },
    { label: "Active Services", value: "2,450", trend: "+125 microservices" },
    { label: "Response Time", value: "45ms" },
    { label: "Security Score", value: "A+", trend: "Zero breaches" }
  ],
  functions: [
    "Infrastructure management",
    "Software development",
    "Cybersecurity",
    "Data engineering",
    "Innovation and R&D"
  ],
  divisions: [
    { name: "Platform Engineering", description: "Core platform and infrastructure", size: 850 },
    { name: "Product Development", description: "Customer-facing applications", size: 1200 },
    { name: "Data & Analytics", description: "Big data and ML platforms", size: 620 },
    { name: "Security Operations", description: "24/7 security monitoring", size: 480 }
  ],
  initiatives: [
    { name: "Cloud Migration Phase 3", status: "active", description: "Multi-cloud architecture rollout" },
    { name: "AI Operations Center", status: "active", description: "Automated incident response" },
    { name: "Quantum Computing Lab", status: "planned", description: "Future tech exploration" }
  ]
};

export const supplyChainConfig: DepartmentConfig = {
  id: "supply-chain",
  name: "Supply Chain",
  description: "End-to-end supply chain management",
  icon: Package,
  color: "green",
  metrics: [
    { label: "Active Shipments", value: "2,847" },
    { label: "On-Time Delivery", value: "94.2%" },
    { label: "Inventory Accuracy", value: "99.1%" },
    { label: "Cost Savings", value: "$4.2M" }
  ]
};

export const operationsConfig: DepartmentConfig = {
  id: "operations",
  name: "Operations",
  description: "Operational excellence and efficiency",
  icon: Cog,
  color: "blue",
  metrics: [
    { label: "Process Efficiency", value: "92%" },
    { label: "Quality Score", value: "98.5%" },
    { label: "Active Projects", value: "156" },
    { label: "SLA Compliance", value: "99.2%" }
  ]
};

export const documentsLibraryConfig: DepartmentConfig = {
  id: "documents-library",
  name: "Documents Library",
  description: "Document management and compliance",
  icon: FileText,
  color: "purple",
  metrics: [
    { label: "Total Documents", value: "45,892" },
    { label: "Compliance Rate", value: "100%" },
    { label: "Active Workflows", value: "234" },
    { label: "Storage Used", value: "2.4TB" }
  ]
};

export const learningKnowledgeConfig: DepartmentConfig = {
  id: "learning-knowledge",
  name: "Learning & Knowledge",
  description: "Training and development programs",
  icon: BookOpen,
  color: "amber",
  metrics: [
    { label: "Courses Available", value: "892" },
    { label: "Completion Rate", value: "87%" },
    { label: "Certified Staff", value: "12,450" },
    { label: "Training Hours", value: "2.1M" }
  ]
};

export const legalRiskConfig: DepartmentConfig = {
  id: "legal-risk",
  name: "Legal & Risk",
  description: "Legal compliance and risk management",
  icon: Scale,
  color: "red",
  metrics: [
    { label: "Active Cases", value: "47" },
    { label: "Compliance Score", value: "98%" },
    { label: "Risk Assessment", value: "Low" },
    { label: "Contracts Managed", value: "3,245" }
  ]
};

export const marketingBrandingConfig: DepartmentConfig = {
  id: "marketing-branding",
  name: "Marketing & Branding",
  description: "Brand management and marketing campaigns",
  icon: Megaphone,
  color: "pink",
  metrics: [
    { label: "Campaign ROI", value: "342%" },
    { label: "Brand Awareness", value: "78%" },
    { label: "Lead Generation", value: "15,234" },
    { label: "Social Reach", value: "2.4M" }
  ]
};

export const networkPartnersConfig: DepartmentConfig = {
  id: "network-partners",
  name: "Network & Partners",
  description: "Partner ecosystem and network management",
  icon: Network,
  color: "cyan",
  metrics: [
    { label: "Active Partners", value: "1,247" },
    { label: "Network Coverage", value: "195 countries" },
    { label: "Integration Rate", value: "94%" },
    { label: "Partner Revenue", value: "$45M" }
  ]
};

export const strategyDevelopmentConfig: DepartmentConfig = {
  id: "strategy-development",
  name: "Strategy & Development",
  description: "Strategic planning and business development",
  icon: Target,
  color: "indigo",
  metrics: [
    { label: "Strategic Goals", value: "24/30" },
    { label: "Growth Rate", value: "+18%" },
    { label: "Market Share", value: "12.4%" },
    { label: "New Markets", value: "7" }
  ]
};

export const departmentConfigs: Record<string, DepartmentConfig> = {
  "human-resources": humanResourcesConfig,
  "management": managementConfig,
  "technology-engineering": technologyEngineeringConfig,
  "supply-chain": supplyChainConfig,
  "operations": operationsConfig,
  "documents-library": documentsLibraryConfig,
  "learning-knowledge": learningKnowledgeConfig,
  "legal-risk": legalRiskConfig,
  "marketing-branding": marketingBrandingConfig,
  "network-partners": networkPartnersConfig,
  "strategy-development": strategyDevelopmentConfig,
};

export default departmentConfigs;
