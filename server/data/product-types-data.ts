// Product types data - Extracted from routes.ts for better organization
export interface ProductType {
  id: number;
  name: string;
  description: string;
  handlingRequirements: string;
  compatibleTransportModes: string[];
}

export const productTypesData: ProductType[] = [
  {
    id: 1,
    name: "Electronics",
    description: "Consumer and industrial electronic devices",
    handlingRequirements: "Anti-static packaging, temperature control",
    compatibleTransportModes: ["air", "ocean", "road"],
  },
  {
    id: 2,
    name: "Textiles",
    description: "Clothing and fabric materials",
    handlingRequirements: "Dry storage, protection from moisture",
    compatibleTransportModes: ["ocean", "road", "rail"],
  },
  {
    id: 3,
    name: "Automotive Parts",
    description: "Vehicle components and spare parts",
    handlingRequirements: "Secure packaging, prevent movement",
    compatibleTransportModes: ["air", "ocean", "rail"],
  },
  {
    id: 4,
    name: "Chemicals",
    description: "Industrial chemicals and compounds",
    handlingRequirements: "Hazardous materials handling, proper documentation",
    compatibleTransportModes: ["ocean", "rail"],
  },
  {
    id: 5,
    name: "Food Products",
    description: "Processed and packaged foods",
    handlingRequirements: "Temperature control, sanitary conditions",
    compatibleTransportModes: ["air", "ocean", "road"],
  },
];
