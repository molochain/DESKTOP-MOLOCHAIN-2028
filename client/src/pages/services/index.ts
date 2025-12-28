// Main service pages
export { default as Services } from "./Services";
export { default as ServicesHub } from "./ServicesHub";
export { default as ServiceManagement } from "./ServiceManagement";
export { default as ServiceRecommender } from "./ServiceRecommender";
export { default as ServicePage } from "./ServicePage";

// ServiceId type for type-safety (matches servicesConfig.ts keys)
export type ServiceId = 
  | "agency" | "airfreight" | "auction" | "technology" | "bulk" 
  | "business" | "certificates" | "chartering" | "companies" 
  | "consultation" | "container" | "cooperation" | "cross-staffing" 
  | "customs" | "distribution" | "documentation" | "drop-shipping" 
  | "ecosystem" | "education" | "events" | "export" | "finance" 
  | "groupage" | "growth" | "help-develop" | "investing" | "knowledge" 
  | "logistics-market" | "modernization" | "network" | "online-shopping" 
  | "organizations" | "partnership" | "port-services" | "post" | "project" 
  | "rail" | "shopping" | "special-transport" | "supply-chain" | "third-party" 
  | "trading" | "tranship" | "transit" | "trucking" | "warehousing";
