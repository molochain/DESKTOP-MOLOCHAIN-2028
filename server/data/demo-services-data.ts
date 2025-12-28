// Demo services data - Simple service definitions for API endpoints
// Note: This is separate from the comprehensive services-data.ts which has AI recommendation data

export interface DemoService {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
}

export const demoServicesData: DemoService[] = [
  {
    id: "ocean-fcl",
    code: "OCE-FCL",
    name: "Ocean Freight (FCL)",
    description: "Full container load ocean shipping",
    category: "ocean",
    active: true,
  },
  {
    id: "ocean-lcl",
    code: "OCE-LCL",
    name: "Ocean Freight (LCL)",
    description: "Less than container load ocean shipping",
    category: "ocean",
    active: true,
  },
  {
    id: "air-standard",
    code: "AIR-STD",
    name: "Air Freight (Standard)",
    description: "Standard air freight services",
    category: "air",
    active: true,
  },
  {
    id: "air-express",
    code: "AIR-EXP",
    name: "Air Freight (Express)",
    description: "Express air freight services",
    category: "air",
    active: true,
  },
  {
    id: "rail-eurasia",
    code: "RAIL-EUR",
    name: "Rail Freight (Eurasia)",
    description: "Rail freight between Europe and Asia",
    category: "rail",
    active: true,
  },
  {
    id: "customs",
    code: "CUST",
    name: "Customs Clearance",
    description: "Import/export customs clearance services",
    category: "customs",
    active: true,
  },
];

// Helper to get service by ID
export const getDemoServiceById = (id: string): DemoService | undefined => {
  return demoServicesData.find((s) => s.id === id);
};

// Get services as a map for quick lookup
export const demoServicesMap: Record<string, DemoService> = demoServicesData.reduce(
  (acc, service) => {
    acc[service.id] = service;
    return acc;
  },
  {} as Record<string, DemoService>
);
