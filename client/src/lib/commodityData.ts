import { createElement, ReactNode } from 'react';
import {
  Package2,
  Pill,
  Sofa,
  Mountain,
  Cog,
  Paintbrush,
  SunMedium,
  Apple,
  Car,
  Layers,
  Wine,
  Droplet,
  Shirt,
  Sprout
} from "lucide-react";

export interface CommodityInfo {
  name: string;
  description: string;
  icon: ReactNode;
  transportationModes: string[];
  handlingRequirements: string[];
  businessCycle: {
    date: string;
    volume: number;
  }[];
  marketTrends: string[];
  primaryRoutes: {
    from: string;
    to: string;
    volume: string;
  }[];
  relatedCommodities: string[];
  regulatoryConsiderations: string[];
  sustainabilityImpact: string;
  rawTypes: string[];
}

export const commodityData: Record<string, CommodityInfo> = {
  "electronics-tech": {
    name: "Electronics & Tech",
    description: "Consumer and industrial electronic components, devices, and equipment requiring secure, climate-controlled shipping solutions and specialized handling.",
    icon: createElement(Package2, { className: "w-6 h-6" }),
    transportationModes: ["Air Freight", "Sea Container", "Express Courier", "Specialized Ground"],
    handlingRequirements: [
      "Electrostatic discharge (ESD) protection",
      "Climate-controlled containers",
      "Specialized packaging for fragile items",
      "Security monitoring"
    ],
    businessCycle: [
      { date: "2024-01", volume: 1200 },
      { date: "2024-02", volume: 1350 },
      { date: "2024-03", volume: 1100 },
      { date: "2024-04", volume: 1450 },
      { date: "2024-05", volume: 1600 }
    ],
    marketTrends: [
      "Growing demand in emerging markets",
      "Seasonal peaks during holiday seasons",
      "Increasing focus on semiconductor shipments",
      "Rising importance of expedited delivery for high-value components"
    ],
    primaryRoutes: [
      { from: "Shanghai", to: "Rotterdam", volume: "2000 TEU/month" },
      { from: "Shenzhen", to: "Los Angeles", volume: "1500 TEU/month" },
      { from: "Singapore", to: "Dubai", volume: "1000 TEU/month" },
      { from: "Taipei", to: "Hamburg", volume: "800 TEU/month" }
    ],
    relatedCommodities: ["Automotive & Parts", "Machinery & Equipment"],
    regulatoryConsiderations: [
      "Import/export controls for certain technologies",
      "Lithium battery shipping regulations",
      "Electronic waste disposal regulations",
      "Certification requirements"
    ],
    sustainabilityImpact: "Moderate to high due to e-waste concerns and energy-intensive manufacturing processes. Growing focus on recyclable packaging and sustainable component sourcing.",
    rawTypes: ["Electronics", "Consumer Electronics"]
  },
  "pharmaceuticals-medical": {
    name: "Pharmaceuticals & Medical",
    description: "Medical supplies, medicines, and healthcare products requiring temperature-controlled environments and strict chain of custody protocols.",
    icon: createElement(Pill, { className: "w-6 h-6" }),
    transportationModes: ["Temperature Controlled Air", "Reefer Container", "Secure Ground", "Express Medical Courier"],
    handlingRequirements: [
      "Temperature-controlled storage (2-8°C for most items)",
      "Validated cold chain management",
      "GMP and GDP compliance",
      "Secure handling with chain of custody"
    ],
    businessCycle: [
      { date: "2024-01", volume: 800 },
      { date: "2024-02", volume: 850 },
      { date: "2024-03", volume: 900 },
      { date: "2024-04", volume: 750 },
      { date: "2024-05", volume: 950 }
    ],
    marketTrends: [
      "Increased vaccine transportation",
      "Growing cold chain logistics demand",
      "Stricter regulatory compliance",
      "Rise in biopharmaceutical shipments"
    ],
    primaryRoutes: [
      { from: "Basel", to: "New York", volume: "500 TEU/month" },
      { from: "Mumbai", to: "Lagos", volume: "300 TEU/month" },
      { from: "Brussels", to: "Singapore", volume: "400 TEU/month" },
      { from: "Dublin", to: "Tokyo", volume: "250 TEU/month" }
    ],
    relatedCommodities: ["Chemicals", "Personal Care & Cosmetics"],
    regulatoryConsiderations: [
      "Strict import licensing requirements",
      "Controlled substance handling regulations",
      "Country-specific pharmaceutical approval",
      "Temperature validation documentation"
    ],
    sustainabilityImpact: "Low to moderate, with growing emphasis on sustainable packaging and reducing cold chain carbon footprint through technology innovations.",
    rawTypes: ["Pharmaceuticals", "Medical Supplies"]
  },
  "furniture-home": {
    name: "Furniture & Home",
    description: "Household furnishings and decor items that often require specialized handling for large, bulky, or fragile items.",
    icon: createElement(Sofa, { className: "w-6 h-6" }),
    transportationModes: ["FCL Ocean Freight", "FTL Ground Transport", "Specialized Moving Services"],
    handlingRequirements: [
      "Special packaging for fragile items",
      "Humidity control for wooden furniture",
      "Protective wrapping for finished surfaces",
      "Assembly/disassembly capabilities"
    ],
    businessCycle: [
      { date: "2024-01", volume: 900 },
      { date: "2024-02", volume: 850 },
      { date: "2024-03", volume: 1000 },
      { date: "2024-04", volume: 1100 },
      { date: "2024-05", volume: 1050 }
    ],
    marketTrends: [
      "Growing direct-to-consumer shipping model",
      "Increase in flat-pack furniture logistics",
      "Seasonal demand patterns tied to housing market",
      "Rising use of protective and sustainable packaging"
    ],
    primaryRoutes: [
      { from: "Guangzhou", to: "Los Angeles", volume: "1200 TEU/month" },
      { from: "Ho Chi Minh City", to: "Rotterdam", volume: "900 TEU/month" },
      { from: "Malaysia", to: "Sydney", volume: "700 TEU/month" },
      { from: "Poland", to: "United Kingdom", volume: "500 TEU/month" }
    ],
    relatedCommodities: ["Textiles & Cotton", "Plastics & Materials"],
    regulatoryConsiderations: [
      "Wood treatment and certification requirements",
      "Material safety standards",
      "Furniture flammability regulations",
      "Country-specific labeling requirements"
    ],
    sustainabilityImpact: "Moderate, with increasing focus on sustainable materials, reduced packaging waste, and furniture recycling programs in major markets.",
    rawTypes: ["Furniture", "Home Goods"]
  },
  "minerals-ores": {
    name: "Minerals & Ores",
    description: "Raw mineral materials and ores requiring specialized bulk handling and transportation with strict environmental considerations.",
    icon: createElement(Mountain, { className: "w-6 h-6" }),
    transportationModes: ["Bulk Carriers", "Rail Transport", "Specialized Road Haulage"],
    handlingRequirements: [
      "Bulk handling equipment",
      "Dust control measures",
      "Contamination prevention",
      "Heavy lift capabilities"
    ],
    businessCycle: [
      { date: "2024-01", volume: 2200 },
      { date: "2024-02", volume: 2100 },
      { date: "2024-03", volume: 2300 },
      { date: "2024-04", volume: 2500 },
      { date: "2024-05", volume: 2400 }
    ],
    marketTrends: [
      "Price volatility based on industrial demand",
      "Increasing demand for rare earth minerals",
      "Growth in dedicated bulk shipping networks",
      "Focus on sustainable mining practices"
    ],
    primaryRoutes: [
      { from: "Australia", to: "China", volume: "5000 tons/month" },
      { from: "Brazil", to: "Europe", volume: "3500 tons/month" },
      { from: "South Africa", to: "Japan", volume: "2800 tons/month" },
      { from: "Canada", to: "United States", volume: "3200 tons/month" }
    ],
    relatedCommodities: ["Machinery & Equipment", "Oil & Gas"],
    regulatoryConsiderations: [
      "Environmental protection regulations",
      "Mining safety standards",
      "Import/export permits for strategic materials",
      "Heavy minerals transportation regulations"
    ],
    sustainabilityImpact: "High, due to environmental concerns around extraction, processing, and transportation. Growing focus on responsible sourcing and minimizing ecological footprints.",
    rawTypes: ["Mineral Ore", "Mining Products"]
  },
  "machinery-equipment": {
    name: "Machinery & Equipment",
    description: "Industrial machinery, equipment, and parts requiring specialized handling for oversized and heavy cargo with precise delivery timelines.",
    icon: createElement(Cog, { className: "w-6 h-6" }),
    transportationModes: ["Heavy Lift Vessels", "Breakbulk Shipping", "Specialized Road Transport", "Project Cargo"],
    handlingRequirements: [
      "Heavy lift cranes",
      "Engineered lifting plans",
      "Special permits for oversized loads",
      "Rust and corrosion prevention"
    ],
    businessCycle: [
      { date: "2024-01", volume: 750 },
      { date: "2024-02", volume: 800 },
      { date: "2024-03", volume: 900 },
      { date: "2024-04", volume: 950 },
      { date: "2024-05", volume: 1000 }
    ],
    marketTrends: [
      "Increasing project cargo for infrastructure development",
      "Growth in renewable energy equipment transportation",
      "Demand for specialized handling expertise",
      "Just-in-time delivery for manufacturing components"
    ],
    primaryRoutes: [
      { from: "Germany", to: "China", volume: "800 units/month" },
      { from: "Japan", to: "United States", volume: "650 units/month" },
      { from: "South Korea", to: "Middle East", volume: "500 units/month" },
      { from: "Italy", to: "Southeast Asia", volume: "450 units/month" }
    ],
    relatedCommodities: ["Electronics & Tech", "Automotive & Parts"],
    regulatoryConsiderations: [
      "Equipment certification requirements",
      "Heavy cargo road transportation permits",
      "Safety standards compliance",
      "Dual-use technology export controls"
    ],
    sustainabilityImpact: "Moderate, with increasing emphasis on energy-efficient manufacturing and transportation methods, plus recyclable packaging for components.",
    rawTypes: ["Machinery", "Industrial Equipment"]
  },
  "personal-care-cosmetics": {
    name: "Personal Care & Cosmetics",
    description: "Beauty, personal care products, and cosmetics requiring temperature stability and careful handling to maintain product integrity.",
    icon: createElement(Paintbrush, { className: "w-6 h-6" }),
    transportationModes: ["Air Freight", "Temperature-Controlled Container", "Express Freight"],
    handlingRequirements: [
      "Temperature control between 15-25°C",
      "Protection from direct sunlight",
      "Careful handling to prevent breakage",
      "Humidity control"
    ],
    businessCycle: [
      { date: "2024-01", volume: 500 },
      { date: "2024-02", volume: 550 },
      { date: "2024-03", volume: 600 },
      { date: "2024-04", volume: 650 },
      { date: "2024-05", volume: 700 }
    ],
    marketTrends: [
      "Growth in luxury cosmetics shipments",
      "Increasing direct-to-consumer logistics",
      "Emphasis on sustainable packaging",
      "Seasonal demand patterns"
    ],
    primaryRoutes: [
      { from: "France", to: "Middle East", volume: "400 TEU/month" },
      { from: "South Korea", to: "Southeast Asia", volume: "350 TEU/month" },
      { from: "United States", to: "Latin America", volume: "300 TEU/month" },
      { from: "Japan", to: "China", volume: "250 TEU/month" }
    ],
    relatedCommodities: ["Pharmaceuticals & Medical", "Chemicals"],
    regulatoryConsiderations: [
      "Cosmetic ingredient restrictions by country",
      "Product registration requirements",
      "Labeling and packaging regulations",
      "Animal testing bans in certain markets"
    ],
    sustainabilityImpact: "Moderate, with rapidly growing focus on sustainable packaging, natural ingredients, and reduced environmental impact throughout the supply chain.",
    rawTypes: ["Personal Care", "Cosmetics"]
  },
  "solar-renewable": {
    name: "Solar & Renewable",
    description: "Solar panels, wind turbines, and renewable energy equipment requiring specialized handling for fragile and oversized components.",
    icon: createElement(SunMedium, { className: "w-6 h-6" }),
    transportationModes: ["Specialized Container", "Breakbulk", "Heavy Lift", "Project Cargo"],
    handlingRequirements: [
      "Protective packaging for fragile solar panels",
      "Humidity control",
      "Security measures for high-value items",
      "Specialized lifting for oversized components"
    ],
    businessCycle: [
      { date: "2024-01", volume: 400 },
      { date: "2024-02", volume: 450 },
      { date: "2024-03", volume: 550 },
      { date: "2024-04", volume: 600 },
      { date: "2024-05", volume: 650 }
    ],
    marketTrends: [
      "Rapid global growth in renewable energy installations",
      "Increasing specialized logistics providers",
      "Strategic warehouse positioning near installation sites",
      "Seasonal construction cycles impact shipping"
    ],
    primaryRoutes: [
      { from: "China", to: "Europe", volume: "600 TEU/month" },
      { from: "Germany", to: "Middle East", volume: "450 TEU/month" },
      { from: "United States", to: "Latin America", volume: "400 TEU/month" },
      { from: "Southeast Asia", to: "Australia", volume: "350 TEU/month" }
    ],
    relatedCommodities: ["Electronics & Tech", "Machinery & Equipment"],
    regulatoryConsiderations: [
      "Renewable energy import incentives",
      "Specialized permitting for project cargo",
      "Material safety certifications",
      "Electronic component regulations"
    ],
    sustainabilityImpact: "Low, as the industry itself focuses on environmental benefits, with continued emphasis on minimizing transportation emissions and packaging waste.",
    rawTypes: ["Solar Panels", "Solar", "Renewable Energy Equipment"]
  },
  "food-beverages": {
    name: "Food & Beverages",
    description: "Perishable and non-perishable food products requiring temperature control, contamination prevention, and compliance with food safety regulations.",
    icon: createElement(Apple, { className: "w-6 h-6" }),
    transportationModes: ["Refrigerated Container", "Controlled Atmosphere Container", "Refrigerated Trucks", "Air Freight for Premium Items"],
    handlingRequirements: [
      "Temperature control throughout supply chain",
      "Humidity monitoring",
      "Cross-contamination prevention",
      "First-in, first-out inventory rotation"
    ],
    businessCycle: [
      { date: "2024-01", volume: 1800 },
      { date: "2024-02", volume: 1700 },
      { date: "2024-03", volume: 1900 },
      { date: "2024-04", volume: 2000 },
      { date: "2024-05", volume: 2100 }
    ],
    marketTrends: [
      "Growth in organic and specialty food logistics",
      "Increasing farm-to-table supply chains",
      "Technology adoption for cold chain monitoring",
      "Focus on reducing food waste in transit"
    ],
    primaryRoutes: [
      { from: "Brazil", to: "Europe", volume: "1500 TEU/month" },
      { from: "United States", to: "Asia", volume: "1200 TEU/month" },
      { from: "New Zealand", to: "China", volume: "900 TEU/month" },
      { from: "Spain", to: "United Kingdom", volume: "700 TEU/month" }
    ],
    relatedCommodities: ["Agricultural & Fertilizers", "Wine & Spirits"],
    regulatoryConsiderations: [
      "Food safety certifications",
      "Phytosanitary requirements",
      "Country-specific import restrictions",
      "Labeling and allergen disclosure regulations"
    ],
    sustainabilityImpact: "Moderate to high, with significant focus on reducing food waste, sustainable packaging, and lowering carbon footprint of refrigerated transportation.",
    rawTypes: ["Food", "Processed Foods", "Fresh Produce"]
  },
  "automotive-parts": {
    name: "Automotive & Parts",
    description: "Vehicles, automotive components, and parts requiring secure handling, just-in-time delivery, and specialized transportation equipment.",
    icon: createElement(Car, { className: "w-6 h-6" }),
    transportationModes: ["Ro-Ro Vessels", "Specialized Car Carriers", "Container Shipping", "Rail Transport"],
    handlingRequirements: [
      "Just-in-time delivery coordination",
      "Secure fastening to prevent movement",
      "Protection from elements",
      "Specialized loading/unloading equipment"
    ],
    businessCycle: [
      { date: "2024-01", volume: 1200 },
      { date: "2024-02", volume: 1300 },
      { date: "2024-03", volume: 1250 },
      { date: "2024-04", volume: 1400 },
      { date: "2024-05", volume: 1500 }
    ],
    marketTrends: [
      "Growth in electric vehicle logistics",
      "Just-in-time manufacturing supply chains",
      "Increasing aftermarket parts distribution",
      "Regional production hubs requiring inbound logistics"
    ],
    primaryRoutes: [
      { from: "Japan", to: "United States", volume: "1000 units/month" },
      { from: "Germany", to: "China", volume: "850 units/month" },
      { from: "South Korea", to: "Europe", volume: "750 units/month" },
      { from: "Mexico", to: "United States", volume: "1200 units/month" }
    ],
    relatedCommodities: ["Electronics & Tech", "Machinery & Equipment"],
    regulatoryConsiderations: [
      "Vehicle emission standards",
      "Safety certification requirements",
      "Hazardous materials regulations for batteries",
      "Import duty structures affecting logistics"
    ],
    sustainabilityImpact: "Moderate to high, with increasing focus on electric vehicle logistics, packaging waste reduction, and optimized transportation routing to reduce emissions.",
    rawTypes: ["Automotive", "Automotive Parts", "Vehicles"]
  },
  "plastics-materials": {
    name: "Plastics & Materials",
    description: "Raw plastic materials, resins, and polymer products requiring specialized handling to prevent contamination and ensure material integrity.",
    icon: createElement(Layers, { className: "w-6 h-6" }),
    transportationModes: ["Bulk Container", "Tank Container", "Hopper Cars", "Flexi-tanks"],
    handlingRequirements: [
      "Prevention of contamination",
      "Moisture control",
      "Temperature stability",
      "Static electricity prevention"
    ],
    businessCycle: [
      { date: "2024-01", volume: 1500 },
      { date: "2024-02", volume: 1600 },
      { date: "2024-03", volume: 1700 },
      { date: "2024-04", volume: 1550 },
      { date: "2024-05", volume: 1650 }
    ],
    marketTrends: [
      "Increasing demand for recycled plastic logistics",
      "Growth in bio-based plastics transportation",
      "Expanding manufacturing in emerging markets",
      "Fluctuations tied to petroleum prices"
    ],
    primaryRoutes: [
      { from: "Saudi Arabia", to: "China", volume: "1200 TEU/month" },
      { from: "United States", to: "Mexico", volume: "900 TEU/month" },
      { from: "South Korea", to: "Southeast Asia", volume: "800 TEU/month" },
      { from: "Germany", to: "Eastern Europe", volume: "600 TEU/month" }
    ],
    relatedCommodities: ["Oil & Gas", "Furniture & Home"],
    regulatoryConsiderations: [
      "Plastic waste import restrictions",
      "Chemical handling regulations",
      "Food-contact material certifications",
      "Single-use plastic bans affecting supply chains"
    ],
    sustainabilityImpact: "High, with significant focus on recyclable materials, waste reduction, and innovative sustainable alternatives to traditional plastics.",
    rawTypes: ["Plastics", "Polymer Materials", "Resins"]
  },
  "wine-spirits": {
    name: "Wine & Spirits",
    description: "Alcoholic beverages requiring temperature-controlled environments, specialized handling, and compliance with country-specific regulations.",
    icon: createElement(Wine, { className: "w-6 h-6" }),
    transportationModes: ["Temperature-Controlled Container", "Specialized Packaging", "Air Freight for Premium Goods"],
    handlingRequirements: [
      "Temperature control (10-15°C ideal)",
      "Vibration minimization",
      "Special packaging for glass bottles",
      "Humidity monitoring"
    ],
    businessCycle: [
      { date: "2024-01", volume: 600 },
      { date: "2024-02", volume: 550 },
      { date: "2024-03", volume: 650 },
      { date: "2024-04", volume: 700 },
      { date: "2024-05", volume: 750 }
    ],
    marketTrends: [
      "Growth in premium spirits global logistics",
      "Direct-to-consumer wine shipping expansion",
      "Specialized logistics providers for vineyards",
      "Seasonal demand patterns"
    ],
    primaryRoutes: [
      { from: "France", to: "United States", volume: "500 TEU/month" },
      { from: "Italy", to: "United Kingdom", volume: "400 TEU/month" },
      { from: "Australia", to: "China", volume: "350 TEU/month" },
      { from: "Chile", to: "Europe", volume: "300 TEU/month" }
    ],
    relatedCommodities: ["Food & Beverages", "Luxury Goods"],
    regulatoryConsiderations: [
      "Country-specific alcohol import regulations",
      "Age verification requirements",
      "Excise taxes and duties",
      "Labeling and certification requirements"
    ],
    sustainabilityImpact: "Moderate, with increasing focus on sustainable packaging, bottle weight reduction, and carbon-neutral shipping options for premium brands.",
    rawTypes: ["Wine", "Spirits", "Alcoholic Beverages"]
  },
  "oil-gas": {
    name: "Oil & Gas",
    description: "Petroleum products and natural gas requiring specialized equipment, safety protocols, and regulatory compliance for hazardous materials.",
    icon: createElement(Droplet, { className: "w-6 h-6" }),
    transportationModes: ["Tanker Ships", "Pipeline", "Rail Tank Cars", "Specialized Trucks"],
    handlingRequirements: [
      "Leak prevention measures",
      "Temperature monitoring",
      "Pressure control",
      "Specialized loading/unloading equipment"
    ],
    businessCycle: [
      { date: "2024-01", volume: 3000 },
      { date: "2024-02", volume: 2900 },
      { date: "2024-03", volume: 3100 },
      { date: "2024-04", volume: 3200 },
      { date: "2024-05", volume: 3300 }
    ],
    marketTrends: [
      "Fluctuations based on global energy demand",
      "Increasing LNG transportation infrastructure",
      "Growth in specialized safety equipment",
      "Seasonal demand patterns"
    ],
    primaryRoutes: [
      { from: "Middle East", to: "Asia", volume: "2 million barrels/day" },
      { from: "Russia", to: "Europe", volume: "1.5 million barrels/day" },
      { from: "United States", to: "Latin America", volume: "1 million barrels/day" },
      { from: "Canada", to: "United States", volume: "3.5 million barrels/day" }
    ],
    relatedCommodities: ["Chemicals", "Plastics & Materials"],
    regulatoryConsiderations: [
      "Hazardous materials transportation regulations",
      "Environmental protection requirements",
      "Country-specific import/export permits",
      "Special security protocols"
    ],
    sustainabilityImpact: "High, with significant environmental considerations and increasing focus on spill prevention, emissions reduction, and alternative fuels.",
    rawTypes: ["Oil", "Petroleum", "Natural Gas", "LNG"]
  },
  "textiles-cotton": {
    name: "Textiles & Cotton",
    description: "Raw and processed textile materials requiring protection from moisture, contamination, and damage during transportation.",
    icon: createElement(Shirt, { className: "w-6 h-6" }),
    transportationModes: ["Container Shipping", "Air Freight for High-Value Fabrics", "Rail Transport"],
    handlingRequirements: [
      "Humidity control to prevent mold",
      "Protection from water damage",
      "Pest prevention measures",
      "Special hanging containers for garments"
    ],
    businessCycle: [
      { date: "2024-01", volume: 1100 },
      { date: "2024-02", volume: 1200 },
      { date: "2024-03", volume: 1300 },
      { date: "2024-04", volume: 1250 },
      { date: "2024-05", volume: 1350 }
    ],
    marketTrends: [
      "Growth in sustainable textile logistics",
      "Fast fashion supply chain acceleration",
      "Increasing direct-to-consumer shipping",
      "Seasonal variations tied to fashion industry"
    ],
    primaryRoutes: [
      { from: "India", to: "Europe", volume: "900 TEU/month" },
      { from: "China", to: "United States", volume: "1200 TEU/month" },
      { from: "Vietnam", to: "Japan", volume: "700 TEU/month" },
      { from: "Bangladesh", to: "United Kingdom", volume: "600 TEU/month" }
    ],
    relatedCommodities: ["Agricultural & Fertilizers", "Furniture & Home"],
    regulatoryConsiderations: [
      "Import quotas in certain markets",
      "Country of origin labeling requirements",
      "Organic certification for natural fibers",
      "Chemical treatment regulations"
    ],
    sustainabilityImpact: "Moderate to high, with increasing focus on organic fibers, sustainable production methods, and reducing carbon footprint throughout the supply chain.",
    rawTypes: ["Cotton", "Textiles", "Fabrics", "Garments"]
  },
  "agricultural-fertilizers": {
    name: "Agricultural & Fertilizers",
    description: "Agricultural products, fertilizers, and farming supplies requiring environmental protection measures and specialized handling for bulk shipments.",
    icon: createElement(Sprout, { className: "w-6 h-6" }),
    transportationModes: ["Bulk Carriers", "Container Shipping", "Rail Transport", "Specialized Agricultural Trucks"],
    handlingRequirements: [
      "Moisture control for fertilizers",
      "Contamination prevention",
      "Temperature management for perishables",
      "Pest control measures"
    ],
    businessCycle: [
      { date: "2024-01", volume: 2000 },
      { date: "2024-02", volume: 1900 },
      { date: "2024-03", volume: 2100 },
      { date: "2024-04", volume: 2300 },
      { date: "2024-05", volume: 2500 }
    ],
    marketTrends: [
      "Seasonal demand tied to planting cycles",
      "Growth in organic fertilizer transportation",
      "Increasing direct farm-to-consumer logistics",
      "Price volatility affecting shipment volumes"
    ],
    primaryRoutes: [
      { from: "Canada", to: "Asia", volume: "1800 tons/month" },
      { from: "Morocco", to: "Brazil", volume: "1500 tons/month" },
      { from: "Russia", to: "India", volume: "1700 tons/month" },
      { from: "United States", to: "Mexico", volume: "1600 tons/month" }
    ],
    relatedCommodities: ["Food & Beverages", "Chemicals"],
    regulatoryConsiderations: [
      "Agricultural import restrictions",
      "Phytosanitary requirements",
      "Chemical handling regulations for fertilizers",
      "Environmental protection measures"
    ],
    sustainabilityImpact: "Moderate to high, particularly for fertilizers, with increasing focus on organic options, reducing runoff, and implementing sustainable farming practices throughout the supply chain.",
    rawTypes: ["Fertilizer", "Agricultural Products", "Farm Supplies"]
  }
};

// Generate slugs from the commodity categories
export const commodityCategories = {
  "Electronics & Tech": "electronics-tech",
  "Pharmaceuticals & Medical": "pharmaceuticals-medical",
  "Furniture & Home": "furniture-home",
  "Minerals & Ores": "minerals-ores",
  "Machinery & Equipment": "machinery-equipment",
  "Personal Care & Cosmetics": "personal-care-cosmetics",
  "Solar & Renewable": "solar-renewable",
  "Food & Beverages": "food-beverages",
  "Automotive & Parts": "automotive-parts",
  "Plastics & Materials": "plastics-materials",
  "Wine & Spirits": "wine-spirits",
  "Oil & Gas": "oil-gas",
  "Textiles & Cotton": "textiles-cotton",
  "Agricultural & Fertilizers": "agricultural-fertilizers"
};

// Create a reverse mapping from slugs to commodity names
export const slugToCommodity: Record<string, string> = {};

Object.entries(commodityCategories).forEach(([commodity, slug]) => {
  slugToCommodity[slug] = commodity;
  
  // Also support simple slugs like "electronics" for "electronics-tech"
  const simplifiedSlug = slug.split('-')[0];
  if (!slugToCommodity[simplifiedSlug]) {
    slugToCommodity[simplifiedSlug] = commodity;
  }
});

// Reverse mapping from raw types to standardized categories
export const rawTypeToCommodity: Record<string, string> = {
  "Electronics": "Electronics & Tech",
  "Consumer Electronics": "Electronics & Tech",
  "Pharmaceuticals": "Pharmaceuticals & Medical",
  "Medical Supplies": "Pharmaceuticals & Medical",
  "Furniture": "Furniture & Home",
  "Home Goods": "Furniture & Home",
  "Mineral Ore": "Minerals & Ores",
  "Mining Products": "Minerals & Ores",
  "Machinery": "Machinery & Equipment",
  "Industrial Equipment": "Machinery & Equipment",
  "Personal Care": "Personal Care & Cosmetics",
  "Cosmetics": "Personal Care & Cosmetics",
  "Solar Panels": "Solar & Renewable",
  "Solar": "Solar & Renewable",
  "Renewable Energy Equipment": "Solar & Renewable",
  "Food": "Food & Beverages",
  "Processed Foods": "Food & Beverages",
  "Fresh Produce": "Food & Beverages",
  "Automotive": "Automotive & Parts",
  "Automotive Parts": "Automotive & Parts",
  "Vehicles": "Automotive & Parts",
  "Plastics": "Plastics & Materials",
  "Polymer Materials": "Plastics & Materials",
  "Resins": "Plastics & Materials",
  "Wine": "Wine & Spirits",
  "Spirits": "Wine & Spirits",
  "Alcoholic Beverages": "Wine & Spirits",
  "Oil": "Oil & Gas",
  "Petroleum": "Oil & Gas",
  "Natural Gas": "Oil & Gas",
  "LNG": "Oil & Gas",
  "Cotton": "Textiles & Cotton",
  "Textiles": "Textiles & Cotton",
  "Fabrics": "Textiles & Cotton",
  "Garments": "Textiles & Cotton",
  "Fertilizer": "Agricultural & Fertilizers",
  "Agricultural Products": "Agricultural & Fertilizers",
  "Farm Supplies": "Agricultural & Fertilizers"
};

// Tag colors for different commodity categories
export const getCommodityColor = (commodityType: string): string => {
  const colorMap: Record<string, string> = {
    "Electronics & Tech": "bg-blue-100 text-blue-800 border-blue-200",
    "Pharmaceuticals & Medical": "bg-green-100 text-green-800 border-green-200",
    "Furniture & Home": "bg-orange-100 text-orange-800 border-orange-200",
    "Minerals & Ores": "bg-slate-100 text-slate-800 border-slate-200",
    "Machinery & Equipment": "bg-purple-100 text-purple-800 border-purple-200",
    "Personal Care & Cosmetics": "bg-pink-100 text-pink-800 border-pink-200",
    "Solar & Renewable": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Food & Beverages": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Automotive & Parts": "bg-red-100 text-red-800 border-red-200",
    "Plastics & Materials": "bg-gray-100 text-gray-800 border-gray-200",
    "Wine & Spirits": "bg-purple-100 text-purple-800 border-purple-200",
    "Oil & Gas": "bg-gray-100 text-gray-800 border-gray-200",
    "Textiles & Cotton": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Agricultural & Fertilizers": "bg-green-100 text-green-800 border-green-200"
  };

  return colorMap[commodityType] || "bg-slate-100 text-slate-800 border-slate-200";
};