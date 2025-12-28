import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import {
  Ship,
  Package,
  Package2,
  Building2,
  Car,
  Shirt,
  Apple,
  Cog,
  Boxes,
  SunMedium,
  Warehouse,
  Wine,
  Droplet,
  Pill,
  Globe2,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

// Service type mapping with full names
const serviceNames = {
  AIR: "Airfreight Services",
  AGEN: "Agency Services",
  AUCT: "Auction Services",
  BULK: "Bulk Services",
  CHRT: "Chartering Services",
  CONS: "Consultation Services",
  CONT: "Container Services",
  CROS: "Cross-Staffing Services",
  CUST: "Customs Services",
  DIST: "Distribution Services",
  DROP: "Drop Shipping Services",
  ESHP: "Online Shopping Integration",
  FINA: "Finance Services",
  GROU: "Groupage Services",
  DEV: "Help Development Services",
  PORT: "Port Services",
  POST: "Post Services",
  PROJ: "Project Services",
  RAIL: "Rail Services",
  SPLY: "Supply Chain Services",
  SPEC: "Special Transport Services",
  "3PL": "Third Party Services",
  TRAN: "Transhipment Services",
  TRNS: "Transit Services",
  TRUCK: "Trucking Services",
  WARE: "Warehousing Services"
} as const;

const serviceRoutes = {
  AIR: "/services/airfreight",
  AGEN: "/services/agency",
  AUCT: "/services/auction",
  BULK: "/services/bulk",
  CHRT: "/services/chartering",
  CONS: "/services/consultation",
  CONT: "/services/container",
  CROS: "/services/cross-staffing",
  CUST: "/services/customs",
  DIST: "/services/distribution",
  DROP: "/services/drop-shipping",
  ESHP: "/services/online-shopping",
  FINA: "/services/finance",
  GROU: "/services/groupage",
  DEV: "/services/help-develop",
  PORT: "/services/port-services",
  POST: "/services/post",
  PROJ: "/services/project",
  RAIL: "/services/rail",
  SPLY: "/services/supply-chain",
  SPEC: "/services/special-transport",
  "3PL": "/services/third-party",
  TRAN: "/services/tranship",
  TRNS: "/services/transit",
  TRUCK: "/services/trucking",
  WARE: "/services/warehousing"
} as const;

type ServiceType = keyof typeof serviceRoutes;

interface Project {
  id: string;
  title: string;
  description: string;
  route: string;
  services: ServiceType[];
  region: string;
  cargo: {
    type: string;
    weight: string;
    containers: number;
  };
  status: 'active' | 'completed' | 'upcoming';
  lastUpdate: string;
}

// Add commodity type mapping
const commodityTypes = {
  "Electronics": "Electronics & Tech",
  "Consumer Electronics": "Electronics & Tech",
  "Pharmaceuticals": "Pharmaceuticals & Medical",
  "Furniture": "Furniture & Home",
  "Mineral Ore": "Minerals & Ores",
  "Machinery": "Machinery & Equipment",
  "Personal Care": "Personal Care & Cosmetics",
  "Solar Panels": "Solar & Renewable",
  "Solar": "Solar & Renewable",
  "Food": "Food & Beverages",
  "Processed Foods": "Food & Beverages",
  "Automotive": "Automotive & Parts",
  "Automotive Parts": "Automotive & Parts",
  "Plastics": "Plastics & Materials",
  "Wine": "Wine & Spirits",
  "Oil": "Oil & Gas",
  "Cotton": "Textiles & Cotton",
  "Fertilizer": "Agricultural & Fertilizers"
} as const;

const latestProjects: Project[] = [
  {
    id: "shanghai-mersin-electronics",
    title: "Shanghai to Mersin - Consumer Electronics",
    description: "A Chinese tech company exported 35 containers of smartphones and accessories to Mersin, Turkey, for a retail launch.",
    route: "Shanghai → Mersin",
    services: ["CONT", "CUST", "TRUCK"],
    region: "Asia",
    cargo: {
      type: "Consumer Electronics",
      weight: "650 tons",
      containers: 35
    },
    status: "active",
    lastUpdate: "2024-10-15"
  },
  {
    id: "antwerp-jebel-ali-pharma",
    title: "Antwerp to Jebel Ali - Pharmaceuticals",
    description: "A European pharmaceutical manufacturer shipped 25 containers of over-the-counter medicines to Dubai.",
    route: "Antwerp → Jebel Ali",
    services: ["CONT", "CUST"],
    region: "Middle East",
    cargo: {
      type: "Pharmaceuticals",
      weight: "400 tons",
      containers: 25
    },
    status: "completed",
    lastUpdate: "2024-04-20"
  },
  {
    id: "istanbul-navasheva-furniture",
    title: "Istanbul to Navasheva - Furniture",
    description: "A Turkish furniture company exported 40 containers of modern furniture to Navasheva, India.",
    route: "Istanbul → Navasheva",
    services: ["CONT", "WARE"],
    region: "Asia",
    cargo: {
      type: "Furniture",
      weight: "900 tons",
      containers: 40
    },
    status: "completed",
    lastUpdate: "2024-06-15"
  },
  {
    id: "bandar-shanghai-mineral",
    title: "Bandar Abbas to Shanghai - Mineral",
    description: "An Iranian mining company transported 50 containers of copper ore to Shanghai for processing.",
    route: "Bandar Abbas → Shanghai",
    services: ["BULK", "TRUCK"],
    region: "Asia",
    cargo: {
      type: "Mineral Ore",
      weight: "1,200 tons",
      containers: 50
    },
    status: "active",
    lastUpdate: "2024-02-10"
  },
  {
    id: "southampton-montreal-machinery",
    title: "England to Canada - Machinery",
    description: "A British engineering firm shipped 20 containers of agricultural machinery to Montreal, Canada.",
    route: "Southampton → Montreal",
    services: ["CONT", "RAIL"],
    region: "North America",
    cargo: {
      type: "Machinery",
      weight: "800 tons",
      containers: 20
    },
    status: "active",
    lastUpdate: "2024-05-20"
  },
  {
    id: "jebel-ali-durban-personal",
    title: "Jebel Ali to Africa - Personal Care",
    description: "A UAE-based company exported 15 containers of shampoos and soaps to Durban, South Africa.",
    route: "Jebel Ali → Durban",
    services: ["CONT", "DIST"],
    region: "Africa",
    cargo: {
      type: "Personal Care",
      weight: "300 tons",
      containers: 15
    },
    status: "completed",
    lastUpdate: "2024-03-15"
  },
  {
    id: "nansha-liverpool-solar",
    title: "Nansha to England - Solar Panels",
    description: "A Chinese manufacturer exported 30 containers of solar panels to Liverpool, UK.",
    route: "Nansha → Liverpool",
    services: ["CONT", "RAIL"],
    region: "Europe",
    cargo: {
      type: "Solar Panels",
      weight: "600 tons",
      containers: 30
    },
    status: "upcoming",
    lastUpdate: "2024-08-22"
  },
  {
    id: "barcelona-jebel-ali-food",
    title: "Barcelona to Jebel Ali - Food",
    description: "A Spanish food processing company shipped 20 containers of canned vegetables to Dubai.",
    route: "Barcelona → Jebel Ali",
    services: ["CONT", "DIST"],
    region: "Middle East",
    cargo: {
      type: "Processed Foods",
      weight: "200 tons",
      containers: 20
    },
    status: "active",
    lastUpdate: "2024-09-18"
  },
  {
    id: "istanbul-dar-automotive",
    title: "Istanbul to Africa - Automotive",
    description: "A Turkish automotive supplier transported 45 containers of spare parts to Dar es Salaam.",
    route: "Istanbul → Dar es Salaam",
    services: ["CONT", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Automotive Parts",
      weight: "850 tons",
      containers: 45
    },
    status: "completed",
    lastUpdate: "2024-11-12"
  },
  {
    id: "shanghai-bandar-plastics",
    title: "Shanghai to Bandar Abbas - Plastics",
    description: "25 containers of industrial plastic materials were shipped from China to Iran.",
    route: "Shanghai → Bandar Abbas",
    services: ["CONT", "TRUCK"],
    region: "Middle East",
    cargo: {
      type: "Plastics",
      weight: "500 tons",
      containers: 25
    },
    status: "upcoming",
    lastUpdate: "2024-12-05"
  },
  {
    id: "hamburg-toronto-wine",
    title: "Hamburg to Canada - Wines",
    description: "A German winery exported 10 refrigerated containers of premium wines to Toronto.",
    route: "Hamburg → Toronto",
    services: ["CONT", "TRUCK"],
    region: "North America",
    cargo: {
      type: "Wine",
      weight: "120 tons",
      containers: 10
    },
    status: "active",
    lastUpdate: "2024-10-15"
  },
  {
    id: "jebel-ali-navasheva-oil",
    title: "Jebel Ali to Navasheva - Crude Oil",
    description: "A UAE-based refinery shipped 50 containers of crude oil to India for processing.",
    route: "Jebel Ali → Navasheva",
    services: ["BULK", "TRUCK"],
    region: "Asia",
    cargo: {
      type: "Oil",
      weight: "1,000 tons",
      containers: 50
    },
    status: "completed",
    lastUpdate: "2024-04-15"
  },
  {
    id: "sedny-istanbul-cotton",
    title: "Sedny to Istanbul - Cotton",
    description: "An Egyptian supplier exported 18 containers of raw cotton to Turkey for textile manufacturing.",
    route: "Sedny → Istanbul",
    services: ["CONT", "TRUCK"],
    region: "Middle East",
    cargo: {
      type: "Cotton",
      weight: "450 tons",
      containers: 18
    },
    status: "active",
    lastUpdate: "2024-05-20"
  },
  {
    id: "antwerp-lagos-fertilizers",
    title: "Antwerp to Africa - Fertilizers",
    description: "A Belgian chemical company transported 30 containers of fertilizers to Lagos, Nigeria.",
    route: "Antwerp → Lagos",
    services: ["BULK", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Fertilizer",
      weight: "700 tons",
      containers: 30
    },
    status: "upcoming",
    lastUpdate: "2024-02-15"
  },
  {
    id: "rotterdam-istanbul-furniture",
    title: "Rotterdam to Istanbul - Home Furnishings",
    description: "Dutch furniture products for Turkish market.",
    route: "Rotterdam → Istanbul",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Furniture",
      weight: "390 tons",
      containers: 27
    },
    status: "active",
    lastUpdate: "2025-01-20"
  },
  {
    id: "shanghai-singapore-electronics",
    title: "Shanghai to Singapore - Tech Components",
    description: "Chinese electronics components for Singapore assembly plants.",
    route: "Shanghai → Singapore",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Electronics",
      weight: "560 tons",
      containers: 36
    },
    status: "upcoming",
    lastUpdate: "2025-01-21"
  },
  {
    id: "barcelona-montreal-wine",
    title: "Barcelona to Montreal - Wine Export",
    description: "Spanish wine shipment to Canadian distributors.",
    route: "Barcelona → Montreal",
    services: ["CONT", "AIR"],
    region: "North America",
    cargo: {
      type: "Wine",
      weight: "290 tons",
      containers: 19
    },
    status: "active",
    lastUpdate: "2025-01-22"
  },
  {
    id: "jeddah-karachi-textiles",
    title: "Jeddah to Karachi - Textile Materials",
    description: "Saudi textile materials for Pakistani manufacturing.",
    route: "Jeddah → Karachi",
    services: ["CONT", "TRUCK"],
    region: "Asia",
    cargo: {
      type: "Cotton",
      weight: "310 tons",
      containers: 23
    },
    status: "active",
    lastUpdate: "2025-01-23"
  },
  {
    id: "hamburg-santos-machinery",
    title: "Hamburg to Santos - Industrial Machinery",
    description: "German industrial equipment for Brazilian manufacturing sector.",
    route: "Hamburg → Santos",
    services: ["CONT", "AIR"],
    region: "South America",
    cargo: {
      type: "Machinery",
      weight: "780 tons",
      containers: 40
    },
    status: "upcoming",
    lastUpdate: "2025-01-24"
  },
  {
    id: "busan-seattle-automotive",
    title: "Busan to Seattle - Auto Parts",
    description: "Korean automotive components for US assembly plants.",
    route: "Busan → Seattle",
    services: ["CONT", "AIR"],
    region: "North America",
    cargo: {
      type: "Automotive",
      weight: "470 tons",
      containers: 31
    },
    status: "completed",
    lastUpdate: "2025-01-25"
  },
  {
    id: "valencia-casablanca-solar",
    title: "Valencia to Casablanca - Solar Equipment",
    description: "Spanish solar technology for Moroccan energy projects.",
    route: "Valencia → Casablanca",
    services: ["CONT", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Solar",
      weight: "540 tons",
      containers: 32
    },
    status: "active",
    lastUpdate: "2025-01-26"
  },
  {
    id: "shanghai-melbourne-electronics",
    title: "Shanghai to Melbourne - Consumer Electronics",
    description: "Chinese electronics export to Australian market.",
    route: "Shanghai → Melbourne",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Electronics",
      weight: "590 tons",
      containers: 37
    },
    status: "upcoming",
    lastUpdate: "2025-01-27"
  },
  {
    id: "antwerp-dubai-machinery",
    title: "Antwerp to Dubai - Manufacturing Equipment",
    description: "Belgian industrial machinery for UAE manufacturing sector.",
    route: "Antwerp → Dubai",
    services: ["CONT", "AIR"],
    region: "Middle East",
    cargo: {
      type: "Machinery",
      weight: "820 tons",
      containers: 41
    },
    status: "active",
    lastUpdate: "2025-01-28"
  },
  {
    id: "alexandria-rotterdam-cotton",
    title: "Alexandria to Rotterdam - Cotton Export",
    description: "Egyptian cotton products for European textile industry.",
    route: "Alexandria → Rotterdam",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Cotton",
      weight: "340 tons",
      containers: 25
    },
    status: "completed",
    lastUpdate: "2025-01-29"
  },
  {
    id: "mumbai-singapore-pharmaceuticals",
    title: "Mumbai to Singapore - Medical Supplies",
    description: "Indian pharmaceutical products for Southeast Asian market.",
    route: "Mumbai → Singapore",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Pharmaceuticals",
      weight: "270 tons",
      containers: 17
    },
    status: "active",
    lastUpdate: "2025-30"
  },
  {
    id: "los-angeles-yokohama-electronics",
    title: "LA to Yokohama - Tech Components",
    description: "US technology components for Japanese market.",
    route: "Los Angeles → Yokohama",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Electronics",
      weight: "510 tons",
      containers: 34
    },
    status: "upcoming",
    lastUpdate: "2025-01-31"
  },
  {
    id: "los-angeles-sydney-machinery",
    title: "LA to Sydney - Industrial Equipment",
    description: "US manufacturing equipment for Australian industrial sector.",
    route: "Los Angeles → Sydney",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Machinery",
      weight: "850 tons",
      containers: 42
    },
    status: "completed",
    lastUpdate: "2025-01-19"
  },
  {
    id: "nhava-sheva-rotterdam-textiles",
    title: "Nhava Sheva to Rotterdam - Textiles",
    description: "Indian textile exports to European fashion industry.",
    route: "Nhava Sheva → Rotterdam",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Cotton",
      weight: "420 tons",
      containers: 28
    },
    status: "active",
    lastUpdate: "2025-02-07"
  },
  {
    id: "tianjin-melbourne-solar",
    title: "Tianjin to Melbourne - Solar Equipment",
    description: "Chinese renewable energy equipment for Australian market.",
    route: "Tianjin → Melbourne",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Solar",
      weight: "680 tons",
      containers: 45
    },
    status: "upcoming",
    lastUpdate: "2025-02-08"
  },
  {
    id: "santos-cape-town-machinery",
    title: "Santos to Cape Town - Industrial Tools",
    description: "Brazilian industrial equipment for South African manufacturing.",
    route: "Santos → Cape Town",
    services: ["CONT", "AIR"],
    region: "Africa",
    cargo: {
      type: "Machinery",
      weight: "550 tons",
      containers: 35
    },
    status: "active",
    lastUpdate: "2025-02-09"
  },
  {
    id: "piraeus-jeddah-electronics",
    title: "Piraeus to Jeddah - Tech Products",
    description: "European electronics shipment to Saudi Arabian market.",
    route: "Piraeus → Jeddah",
    services: ["CONT", "AIR"],
    region: "Middle East",
    cargo: {
      type: "Electronics",
      weight: "320 tons",
      containers: 22
    },
    status: "completed",
    lastUpdate: "2025-02-10"
  },
  {
    id: "busan-long-beach-automotive",
    title: "Busan to Long Beach - Auto Parts",
    description: "Korean automotive components for US market.",
    route: "Busan → Long Beach",
    services: ["CONT", "AIR"],
    region: "North America",
    cargo: {
      type: "Automotive",
      weight: "780 tons",
      containers: 52
    },
    status: "active",
    lastUpdate: "2025-02-11"
  },
  {
    id: "durban-singapore-minerals",
    title: "Durban to Singapore - Mineral Ore",
    description: "South African mineral exports to Asian processing facilities.",
    route: "Durban → Singapore",
    services: ["BULK", "TRUCK"],
    region: "Asia",
    cargo: {
      type: "Mineral Ore",
      weight: "1,500 tons",
      containers: 60
    },
    status: "upcoming",
    lastUpdate: "2025-02-12"
  },
  {
    id: "valencia-alexandria-furniture",
    title: "Valencia to Alexandria - Furniture",
    description: "Spanish furniture exports to Egyptian market.",
    route: "Valencia → Alexandria",
    services: ["CONT", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Furniture",
      weight: "290 tons",
      containers: 20
    },
    status: "completed",
    lastUpdate: "2025-02-13"
  },
  {
    id: "kaohsiung-manila-electronics",
    title: "Kaohsiung to Manila - Electronics",
    description: "Taiwanese electronics for Philippine market.",
    route: "Kaohsiung → Manila",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Electronics",
      weight: "380 tons",
      containers: 25
    },
    status: "active",
    lastUpdate: "2025-02-14"
  },
  {
    id: "marseille-casablanca-machinery",
    title: "Marseille to Casablanca - Equipment",
    description: "French industrial equipment for Moroccan manufacturing.",
    route: "Marseille → Casablanca",
    services: ["CONT", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Machinery",
      weight: "620 tons",
      containers: 40
    },
    status: "upcoming",
    lastUpdate: "2025-02-15"
  },
  {
    id: "jakarta-chennai-rubber",
    title: "Jakarta to Chennai - Raw Materials",
    description: "Indonesian rubber exports to Indian manufacturing.",
    route: "Jakarta → Chennai",
    services: ["CONT", "TRUCK"],
    region: "Asia",
    cargo: {
      type: "Oil",
      weight: "450 tons",
      containers: 30
    },
    status: "active",
    lastUpdate: "2025-02-16"
  },
  {
    id: "constanta-beirut-grain",
    title: "Constanta to Beirut - Agricultural",
    description: "Romanian grain exports to Lebanese market.",
    route: "Constanta → Beirut",
    services: ["BULK", "TRUCK"],
    region: "Middle East",
    cargo: {
      type: "Food",
      weight: "2,000 tons",
      containers: 80
    },
    status: "completed",
    lastUpdate: "2025-02-17"
  },
  {
    id: "dalian-vancouver-electronics",
    title: "Dalian to Vancouver - Tech Products",
    description: "Chinese electronics for Canadian market.",
    route: "Dalian → Vancouver",
    services: ["CONT", "AIR"],
    region: "North America",
    cargo: {
      type: "Electronics",
      weight: "410 tons",
      containers: 27
    },
    status: "active",
    lastUpdate: "2025-02-18"
  },
  {
    id: "hamburg-mumbai-machinery",
    title: "Hamburg to Mumbai - Industrial",
    description: "German machinery for Indian manufacturing sector.",
    route: "Hamburg → Mumbai",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Machinery",
      weight: "850 tons",
      containers: 56
    },
    status: "upcoming",
    lastUpdate: "2025-02-19"
  },
  {
    id: "jebel-ali-mombasa-electronics",
    title: "Jebel Ali to Mombasa - Tech",
    description: "UAE technology products for East African market.",
    route: "Jebel Ali → Mombasa",
    services: ["CONT", "AIR"],
    region: "Africa",
    cargo: {
      type: "Electronics",
      weight: "280 tons",
      containers: 19
    },
    status: "active",
    lastUpdate: "2025-02-20"
  },
  {
    id: "ningbo-seattle-solar",
    title: "Ningbo to Seattle - Solar Panels",
    description: "Chinese solar equipment for US renewable projects.",
    route: "Ningbo → Seattle",
    services: ["CONT", "AIR"],
    region: "North America",
    cargo: {
      type: "Solar",
      weight: "720 tons",
      containers: 48
    },
    status: "completed",
    lastUpdate: "2025-02-21"
  },
  {
    id: "montreal-liverpool-automotive",
    title: "Montreal to Liverpool - Auto Parts",
    description: "Canadian automotive components for UK assembly plants.",
    route: "Montreal → Liverpool",
    services: ["CONT", "AIR"],
    region: "Europe",
    cargo: {
      type: "Automotive",
      weight: "580 tons",
      containers: 38
    },
    status: "active",
    lastUpdate: "2025-02-22"
  },
  {
    id: "port-said-piraeus-cotton",
    title: "Port Said to Piraeus - Textiles",
    description: "Egyptian cotton products for European textile industry.",
    route: "Port Said → Piraeus",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Cotton",
      weight: "350 tons",
      containers: 23
    },
    status: "upcoming",
    lastUpdate: "2025-02-23"
  },
  {
    id: "sydney-auckland-wine",
    title: "Sydney to Auckland - Beverages",
    description: "Australian wine exports to New Zealand market.",
    route: "Sydney → Auckland",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Wine",
      weight: "180 tons",
      containers: 12
    },
    status: "active",
    lastUpdate: "2025-02-24"
  },
  {
    id: "shanghai-panama-electronics",
    title: "Shanghai to Panama - Electronics",
    description: "Chinese electronics for Central American distribution.",
    route: "Shanghai → Panama",
    services: ["CONT", "AIR"],
    region: "North America",
    cargo: {
      type: "Electronics",
      weight: "490 tons",
      containers: 33
    },
    status: "upcoming",
    lastUpdate: "2025-02-25"
  },
  {
    id: "antwerp-dakar-machinery",
    title: "Antwerp to Dakar - Industrial",
    description: "Belgian industrial equipment for West African market.",
    route: "Antwerp → Dakar",
    services: ["CONT", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Machinery",
      weight: "710 tons",
      containers: 47
    },
    status: "active",
    lastUpdate: "2025-02-26"
  },
  {
    id: "kobe-manila-automotive",
    title: "Kobe to Manila - Auto Parts",
    description: "Japanese automotive components for Philippine assembly.",
    route: "Kobe → Manila",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Automotive",
      weight: "430 tons",
      containers: 29
    },
    status: "completed",
    lastUpdate: "2025-02-27"
  },
  {
    id: "haifa-istanbul-electronics",
    title: "Haifa to Istanbul - Tech Products",
    description: "Israeli technology exports to Turkish market.",
    route: "Haifa → Istanbul",
    services: ["CONT", "AIR"],
    region: "Middle East",
    cargo: {
      type: "Electronics",
      weight: "260 tons",
      containers: 17
    },
    status: "active",
    lastUpdate: "2025-02-28"
  },
  {
    id: "colombo-port-klang-textiles",
    title: "Colombo to Port Klang - Fabrics",
    description: "Sri Lankan textile exports to Malaysian market.",
    route: "Colombo → Port Klang",
    services: ["CONT", "TRUCK"],
    region: "Asia",
    cargo: {
      type: "Cotton",
      weight: "290 tons",
      containers: 19
    },
    status: "upcoming",
    lastUpdate: "2025-03-01"
  },
  {
    id: "barcelona-genoa-wine",
    title: "Barcelona to Genoa - Wine",
    description: "Spanish wine exports to Italian market.",
    route: "Barcelona → Genoa",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Wine",
      weight: "240 tons",
      containers: 16
    },
    status: "active",
    lastUpdate: "2025-03-02"
  },
  {
    id: "chittagong-singapore-electronics",
    title: "Chittagong to Singapore - Tech",
    description: "Bangladeshi electronics for Southeast Asian market.",
    route: "Chittagong → Singapore",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Electronics",
      weight: "320 tons",
      containers: 21
    },
    status: "completed",
    lastUpdate: "2025-03-03"
  },
  {
    id: "gdansk-helsinki-furniture",
    title: "Gdansk to Helsinki - Furniture",
    description: "Polish furniture exports to Finnish market.",
    route: "Gdansk → Helsinki",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Furniture",
      weight: "380 tons",
      containers: 25
    },
    status: "active",
    lastUpdate: "2025-03-04"
  },
  {
    id: "incheon-vladivostok-automotive",
    title: "Incheon to Vladivostok - Auto Parts",
    description: "Korean automotive components for Russian market.",
    route: "Incheon → Vladivostok",
    services: ["CONT", "RAIL"],
    region: "Asia",
    cargo: {
      type: "Automotive",
      weight: "520 tons",
      containers: 35
    },
    status: "upcoming",
    lastUpdate: "2025-03-05"
  },
  {
    id: "valparaiso-callao-machinery",
    title: "Valparaiso to Callao- Equipment",
    description: "Chilean industrial equipment for Peruvian mining sector.",    route: "Valparaiso → Callao",
    services: ["CONT", "TRUCK"],region: "South America",
    cargo: {
      type: "Machinery",
      weight: "890 tons",
      containers: 59
    },
    status: "active",lastUpdate: "2025-03-06"
  },
  {
    id: "manila-ho-chi-minh-electronics",
    title: "Manila to Ho Chi Minh - Electronics",
    description: "Philippine electronics for Vietnamese market.",
    route: "Manila → Ho Chi Minh",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Electronics",
      weight: "270 tons",
      containers: 18
    },
    status: "completed",
    lastUpdate: "2025-03-077"
  },
  {
    id: "lome-luanda-machinery",
    title: "Lome to Luanda - Industrial",
    description: "Togolese machinery exports to Angolan market.",
    route: "Lome → Luanda",
    services: ["CONT", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Machinery",
      weight: "630 tons",
      containers: 42
    },
    status: "active",
    lastUpdate: "2025-03-08"
  },
  {
    id: "yokohama-bangkok-automotive",
    title: "Yokohama to Bangkok - Auto Parts",
    description: "Japanese automotive components for Thai assembly plants.",
    route: "Yokohama → Bangkok",
    services: ["CONT", "RAIL"],
    region: "Asia",
    cargo: {
      type: "Automotive",
      weight: "480 tons",
      containers: 32
    },
    status: "upcoming",
    lastUpdate: "2025-03-09"
  },
  {
    id: "tema-maputo-electronics",
    title: "Tema to Maputo - Tech Products",
    description: "Ghanaian electronics for Mozambican market.",
    route: "Tema → Maputo",
    services: ["CONT", "AIR"],
    region: "Africa",
    cargo: {
      type: "Electronics",
      weight: "190 tons",
      containers: 13
    },
    status: "active",
    lastUpdate: "2025-03-10"
  },
  {
    id: "mersin-nansha-electronics",
    title: "Mersin to Nansha - Electronics",
    description: "In June 2024, a Turkish electronics company shipped 40 containers of household appliances to Nansha, China.",
    route: "Mersin → Nansha",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Electronics",
      weight: "800 tons",
      containers: 40
    },
    status: "completed",
    lastUpdate: "2024-06-15"
  },
  {
    id: "jebel-ali-hamburg-petrochemicals",
    title: "Jebel Ali to Hamburg - Petrochemicals",
    description: "A major petrochemical producer in Dubai exported 50 containers of polyethylene granules to Hamburg, Germany.",
    route: "Jebel Ali → Hamburg",
    services: ["BULK", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Petrochemicals",
      weight: "1,200 tons",
      containers: 50
    },
    status: "active",
    lastUpdate: "2024-07-20"
  },
  {
    id: "bandar-abbas-antwerp-carpets",
    title: "Bandar Abbas to Antwerp - Carpets",
    description: "In March 2024, 20 containers of handmade Persian carpets were exported from Bandar Abbas, Iran, to Antwerp, Belgium.",
    route: "Bandar Abbas → Antwerp",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Carpets",
      weight: "300 tons",
      containers: 20
    },
    status: "completed",
    lastUpdate: "2024-03-15"
  },
  {
    id: "istanbul-southampton-textiles",
    title: "Istanbul to England - Textiles",
    description: "A textile manufacturer shipped 25 containers of garments to Southampton, UK, for the fall fashion season.",
    route: "Istanbul → Southampton",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Textiles",
      weight: "600 tons",
      containers: 25
    },
    status: "upcoming",
    lastUpdate: "2024-10-10"
  },
  {
    id: "shanghai-vancouver-furniture",
    title: "Shanghai to Canada - Furniture",
    description: "In July 2024, a Chinese furniture manufacturer exported 35 containers of wooden furniture to Vancouver, Canada.",
    route: "Shanghai → Vancouver",
    services: ["CONT", "RAIL"],
    region: "North America",
    cargo: {
      type: "Furniture",
      weight: "900 tons",
      containers: 35
    },
    status: "active",
    lastUpdate: "2024-07-15"
  },
  {
    id: "sedny-barcelona-agricultural",
    title: "Sedny to Barcelona - Agricultural Products",
    description: "In May 2024, 18 containers of fresh oranges from Egypt were delivered to Barcelona, Spain.",
    route: "Sedny → Barcelona",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Fresh oranges",
      weight: "250 tons",
      containers: 18
    },
    status: "completed",
    lastUpdate: "2024-05-20"
  },
  {
    id: "jebel-ali-lagos-solar",
    title: "Jebel Ali to Africa - Solar Panels",
    description: "A renewable energy company exported 30 containers of solar panels from Dubai to Lagos, Nigeria.",
    route: "Jebel Ali → Lagos",
    services: ["CONT", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Solar Panels",
      weight: "600 tons",
      containers: 30
    },
    status: "active",
    lastUpdate: "2024-08-25"
  },
  {
    id: "bandar-abbas-navasheva-dates",
    title: "Bandar Abbas to Navasheva - Dates",
    description: "In January 2024, 15 containers of premium Iranian dates were exported to Navasheva, India.",
    route: "Bandar Abbas → Navasheva",
    services: ["CONT", "TRUCK"],
    region: "Asia",
    cargo: {
      type: "Dates",
      weight: "200 tons",
      containers: 15
    },
    status: "completed",
    lastUpdate: "2024-01-15"
  },
  {
    id: "mersin-abidjan-olive",
    title: "Mersin to Africa - Olive Oil",
    description: "A Turkish producer shipped 22 containers of extra virgin olive oil to Abidjan, Ivory Coast.",
    route: "Mersin → Abidjan",
    services: ["CONT", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Olive Oil",
      weight: "350 tons",
      containers: 22
    },
    status: "active",
    lastUpdate: "2024-09-10"
  },
  {
    id: "istanbul-toronto-machinery",
    title: "Istanbul to Canada - Machinery",
    description: "In August 2024, an industrial equipment manufacturer shipped 18 containers of machinery to Toronto, Canada.",
    route: "Istanbul → Toronto",
    services: ["CONT", "RAIL"],
    region: "North America",
    cargo: {
      type: "Machinery",
      weight: "700 tons",
      containers: 18
    },
    status: "upcoming",
    lastUpdate: "2024-08-15"
  },
  {
    id: "jebel-ali-nansha-auto",
    title: "Jebel Ali to Nansha - Automotive Parts",
    description: "A Dubai-based company exported 20 containers of automotive spare parts to Nansha, China.",
    route: "Jebel Ali → Nansha",
    services: ["CONT", "AIR"],
    region: "Asia",
    cargo: {
      type: "Automotive Parts",
      weight: "450 tons",
      containers: 20
    },
    status: "active",
    lastUpdate: "2024-09-20"
  },
  {
    id: "hamburg-istanbul-pharma",
    title: "Hamburg to Istanbul - Pharmaceuticals",
    description: "A German pharmaceutical company transported 10 refrigerated containers of vaccines to Istanbul.",
    route: "Hamburg → Istanbul",
    services: ["CONT", "AIR"],
    region: "Europe",
    cargo: {
      type: "Pharmaceuticals",
      weight: "150 tons",
      containers: 10
    },
    status: "completed",
    lastUpdate: "2024-10-05"
  },
  {
    id: "antwerp-bandar-chemicals",
    title: "Antwerp to Bandar Abbas - Industrial Chemicals",
    description: "A chemical supplier shipped 25 containers of industrial chemicals to Bandar Abbas, Iran.",
    route: "Antwerp → Bandar Abbas",
    services: ["BULK", "TRUCK"],
    region: "Middle East",
    cargo: {
      type: "Chemicals",
      weight: "500 tons",
      containers: 25
    },
    status: "active",
    lastUpdate: "2024-11-10"
  },
  {
    id: "navasheva-london-tea",
    title: "Navasheva to England - Tea",
    description: "In June 2024, 15 containers of premium Indian tea were exported to London, UK.",
    route: "Navasheva → London",
    services: ["CONT", "TRUCK"],
    region: "Europe",
    cargo: {
      type: "Tea",
      weight: "100 tons",
      containers: 15
    },
    status: "completed",
    lastUpdate: "2024-06-20"
  },
  {
    id: "montreal-hamburg-lumber",
    title: "Canada to Hamburg - Lumber",
    description: "A Canadian forestry company shipped 30 containers of processed lumber to Hamburg, Germany.",
    route: "Montreal → Hamburg",
    services: ["CONT", "RAIL"],
    region: "Europe",
    cargo: {
      type: "Lumber",
      weight: "800 tons",
      containers: 30
    },
    status: "active",
    lastUpdate: "2024-07-25"
  },
  {
    id: "barcelona-sedny-wines",
    title: "Barcelona to Sedny - Wines",
    description: "In May 2024, 12 refrigerated containers of Spanish wine were delivered to Sedny, Egypt.",
    route: "Barcelona → Sedny",
    services: ["CONT", "TRUCK"],
    region: "Middle East",
    cargo: {
      type: "Wine",
      weight: "120 tons",
      containers: 12
    },
    status: "completed",
    lastUpdate: "2024-05-15"
  },
  {
    id: "bandar-tema-petroleum",
    title: "Bandar Abbas to Africa - Petroleum Products",
    description: "A petroleum company in Iran exported 45 containers of lubricants to Tema, Ghana.",
    route: "Bandar Abbas → Tema",
    services: ["BULK", "TRUCK"],
    region: "Africa",
    cargo: {
      type: "Petroleum Products",
      weight: "1,000 tons",
      containers: 45
    },
    status: "active",
    lastUpdate: "2024-08-30"
  },
  {
    id: "nansha-mersin-electronics",
    title: "Nansha to Mersin - Electronics",
    description: "In March 2024, 50 containers of laptops and TVs were imported to Mersin, Turkey.",
    route: "Nansha → Mersin",
    services: ["CONT", "AIR"],
    region: "Middle East",
    cargo: {
      type: "Electronics",
      weight: "700 tons",
      containers: 50
    },
    status: "completed",
    lastUpdate: "2024-03-20"
  },
  {
    id: "jebel-ali-liverpool-perfumes",
    title: "Jebel Ali to England - Perfumes",
    description: "A luxury perfume brand exported 10 containers of perfumes to Liverpool, UK.",
    route: "Jebel Ali → Liverpool",
    services: ["CONT", "AIR"],
    region: "Europe",
    cargo: {
      type: "Perfumes",
      weight: "100 tons",
      containers: 10
    },
    status: "active",
    lastUpdate: "2024-09-25"
  },
  {
    id: "hamburg-barcelona-machinery",
    title: "Hamburg to Barcelona - Machinery",
    description: "A German engineering company shipped 30 containers of manufacturing equipment to Barcelona, Spain.",
    route: "Hamburg → Barcelona",
    services: ["CONT", "RAIL"],
    region: "Europe",
    cargo: {
      type: "Machinery",
      weight: "850 tons",
      containers: 30
    },
    status: "upcoming",
    lastUpdate: "2024-10-30"
  },
  {
    id: "dubai-lagos-supply-chain",
    title: "Dubai to Lagos - Supply Chain Optimization",
    description: "End-to-end supply chain optimization project for Nigerian retailer network.",
    route: "Dubai → Lagos",
    services: ["SPLY", "CONS"],
    region: "Africa",
    cargo: {
      type: "Electronics",
      weight: "350 tons",
      containers: 22
    },
    status: "active",
    lastUpdate: "2025-01-29"
  },
  {
    id: "hamburg-singapore-auction",
    title: "Hamburg Equipment Auction",
    description: "Global online auction of used shipping and logistics equipment.",
    route: "Hamburg → Global",
    services: ["AUCT", "FINA"],
    region: "Global",
    cargo: {
      type: "Machinery",
      weight: "670 tons",
      containers: 42
    },
    status: "upcoming",
    lastUpdate: "2025-01-30"
  },
  {
    id: "shenzhen-global-ecommerce",
    title: "Shenzhen E-commerce Integration",
    description: "Global e-commerce platform integration for Chinese electronics manufacturer.",
    route: "Shenzhen → Global Markets",
    services: ["ESHP", "DROP"],
    region: "Global",
    cargo: {
      type: "Electronics",
      weight: "840 tons",
      containers: 56
    },
    status: "active",
    lastUpdate: "2025-01-31"
  },
  {
    id: "rotterdam-port-operations",
    title: "Rotterdam Port Services Optimization",
    description: "Comprehensive port operations and management solution implementation.",
    route: "Rotterdam Port",
    services: ["PORT", "CONS"],
    region: "Europe",
    cargo: {
      type: "Machinery",
      weight: "N/A",
      containers: 0
    },
    status: "active",
    lastUpdate: "2025-02-01"
  },
  {
    id: "singapore-fleet-chartering",
    title: "APAC Fleet Chartering Project",
    description: "Long-term vessel chartering arrangement for Asia-Pacific trade routes.",
    route: "Singapore Hub",
    services: ["CHRT", "SPLY"],
    region: "Asia",
    cargo: {
      type: "Various",
      weight: "12,000 tons",
      containers: 800
    },
    status: "active",
    lastUpdate: "2025-02-02"
  },
  {
    id: "istanbul-europe-dropshipping",
    title: "Turkish Textiles Dropshipping",
    description: "European online retail dropshipping program for Turkish textile manufacturers.",
    route: "Istanbul → EU Markets",
    services: ["DROP", "ESHP"],
    region: "Europe",
    cargo: {
      type: "Cotton",
      weight: "240 tons",
      containers: 16
    },
    status: "upcoming",
    lastUpdate: "2025-02-03"
  }
];

const regions = [
  { value: "all", label: "All Regions" },
  { value: "asia", label: "Asia" },
  { value: "europe", label: "Europe" },
  { value: "africa", label: "Africa" },
  { value: "north-america", label: "North America" },
  { value: "middle-east", label: "Middle East" },
  { value: "south-america", label: "South America" }
];

const getCargoIcon = (cargoType: string) => {
  const type = cargoType.toLowerCase();
  switch (true) {
    case type.includes('electronics'):
      return <Package2 className="w-4 h-4" />;
    case type.includes('pharma'):
      return <Pill className="w-4 h-4" />;
    case type.includes('furniture'):
      return <Warehouse className="w-4 h-4" />;
    case type.includes('mineral'):
      return <Building2 className="w-4 h-4" />;
    case type.includes('machinery'):
      return <Cog className="w-4 h-4" />;
    case type.includes('personal'):
      return <Package className="w-4 h-4" />;
    case type.includes('solar'):
      return <SunMedium className="w-4 h-4" />;
    case type.includes('food'):
      return <Apple className="w-4 h-4" />;
    case type.includes('automotive'):
      return <Car className="w-4 h-4" />;
    case type.includes('plastic'):
      return <Boxes className="w-4 h-4" />;
    case type.includes('wine'):
      return <Wine className="w-4 h-4" />;
    case type.includes('oil'):
      return <Droplet className="w-4 h-4" />;
    case type.includes('cotton'):
      return <Shirt className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const getCargoColor = (cargoType: string) => {
  const type = cargoType.toLowerCase();
  switch (true) {
    case type.includes('electronics'):
      return 'bg-blue-100 text-blue-800';
    case type.includes('pharma'):
      return 'bg-green-100 text-green-800';
    case type.includes('furniture'):
      return 'bg-orange-100 text-orange-800';
    case type.includes('mineral'):
      return 'bg-slate-100 text-slate-800';
    case type.includes('machinery'):
      return 'bg-purple-100 text-purple-800';
    case type.includes('solar'):
      return 'bg-yellow-100 text-yellow-800';
    case type.includes('food'):
      return 'bg-emerald-100 text-emerald-800';
    case type.includes('automotive'):
      return 'bg-red-100 text-red-800';
    case type.includes('oil'):
      return 'bg-gray-100 text-gray-800';
    case type.includes('wine'):
      return 'bg-purple-100 text-purple-800';
    case type.includes('cotton'):
      return 'bg-indigo-100 text-indigo-800';
    case type.includes('fertilizer'):
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const serviceTypes = [
  { value: "all", label: "Service Type" },
  { value: "AUCT", label: "Auction Services" },
  { value: "AIR", label: "Airfreight Services" },
  { value: "BULK", label: "Bulk Services" },
  { value: "CHRT", label: "Chartering Services" },
  { value: "CONS", label: "Consultation Services" },
  { value: "CONT", label: "Container Services" },
  { value: "DIST", label: "Distribution Services" },
  { value: "DROP", label: "Drop Shipping Services" },
  { value: "ESHP", label: "Online Shopping Integration" },
  { value: "PORT", label: "Port Services" },
  { value: "RAIL", label: "Rail Services" },
  { value: "SPLY", label: "Supply Chain Services" },
  { value: "TRUCK", label: "Trucking Services" },
  { value: "WARE", label: "Warehousing Services" }
];

const cargoTypes = [
  { value: "all", label: "Commodity Type" },
  { value: "electronics", label: "Electronics & Tech" },
  { value: "pharmaceuticals", label: "Pharmaceuticals & Medical" },
  { value: "furniture", label: "Furniture & Home" },
  { value: "minerals", label: "Minerals & Ores" },
  { value: "machinery", label: "Machinery & Equipment" },
  { value: "personal-care", label: "Personal Care & Cosmetics" },
  { value: "solar", label: "Solar & Renewable" },
  { value: "food-beverage", label: "Food & Beverages" },
  { value: "automotive", label: "Automotive & Parts" },
  { value: "plastics", label: "Plastics & Materials" },
  { value: "wine-spirits", label: "Wine & Spirits" },
  { value: "oil-gas", label: "Oil & Gas" },
  { value: "textiles", label: "Textiles & Cotton" },
  { value: "agricultural", label: "Agricultural & Fertilizers" }
];

function getCommodityType(cargoType: string): string {
  return commodityTypes[cargoType as keyof typeof commodityTypes] || cargoType;
}

function formatCommodityUrl(commodityType: string): string {
  // Get the standardized type first
  const standardType = getCommodityType(commodityType);
  // Convert to lowercase, replace spaces and special characters with hyphens
  return standardType.toLowerCase().replace(/[& ]/g, '-');
}

export default function LatestProjects() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCargoType, setSelectedCargoType] = useState("all");
  const [selectedServiceType, setSelectedServiceType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  const allServices = latestProjects.flatMap(project => project.services);

  const filteredProjects = latestProjects
    .filter(project => {
      const matchesRegion = selectedRegion === "all" || project.region.toLowerCase() === selectedRegion;
      const matchesCargoType = selectedCargoType === "all" || project.cargo.type.toLowerCase().includes(selectedCargoType);
      const matchesServiceType = selectedServiceType === "all" || project.services.includes(selectedServiceType as ServiceType);
      const matchesSearch = !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.route.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRegion && matchesCargoType && matchesServiceType && matchesSearch;
    })
    .filter(project => !selectedService || project.services.includes(selectedService))
    .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCargoType} onValueChange={setSelectedCargoType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Cargo Type" />
              </SelectTrigger>
              <SelectContent>
                {cargoTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Service Type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-6">
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href={`/projects/${project.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Ship className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.title}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {project.route}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.services.map((service) => (
                      <Badge
                        key={service}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = serviceRoutes[service];
                        }}
                      >
                        {serviceNames[service]}
                      </Badge>
                    ))}
                    <Badge
                      variant="outline"
                      className="bg-primary/5 hover:bg-primary/10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `/commodities/${formatCommodityUrl(project.cargo.type)}`;
                        window.location.href = url;
                      }}
                    >
                      {getCommodityType(project.cargo.type)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="font-semibold text-primary">{project.cargo.containers}</div>
                      <div className="text-gray-500">Containers</div>
                    </div>
                    <div>
                      <div className="font-semibold text-primary">{project.cargo.weight}</div>
                      <div className="text-gray-500">Weight</div>
                    </div>
                    <div>
                      <div className="font-semibold text-primary">{project.status}</div>
                      <div className="text-gray-500">Status</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center text-xs text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Last updated: {new Date(project.lastUpdate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}