import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Ship,
  Clock,
  Globe2,
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
  Pill
} from "lucide-react";

// Define commodity categories with exact URLs
const commodityCategories = {
  "Electronics & Tech": "/commodities/electronics-tech",
  "Pharmaceuticals & Medical": "/commodities/pharmaceuticals-medical",
  "Furniture & Home": "/commodities/furniture-home",
  "Minerals & Ores": "/commodities/minerals-ores",
  "Machinery & Equipment": "/commodities/machinery-equipment",
  "Personal Care & Cosmetics": "/commodities/personal-care-cosmetics",
  "Solar & Renewable": "/commodities/solar-renewable",
  "Food & Beverages": "/commodities/food-beverages",
  "Automotive & Parts": "/commodities/automotive-parts",
  "Plastics & Materials": "/commodities/plastics-materials",
  "Wine & Spirits": "/commodities/wine-spirits",
  "Oil & Gas": "/commodities/oil-gas",
  "Textiles & Cotton": "/commodities/textiles-cotton",
  "Agricultural & Fertilizers": "/commodities/agricultural-fertilizers"
};

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

const getCargoIcon = (cargoType: string) => {
  switch (cargoType) {
    case "Electronics & Tech":
      return <Package2 className="w-4 h-4" />;
    case "Pharmaceuticals & Medical":
      return <Pill className="w-4 h-4" />;
    case "Furniture & Home":
      return <Warehouse className="w-4 h-4" />;
    case "Minerals & Ores":
      return <Building2 className="w-4 h-4" />;
    case "Machinery & Equipment":
      return <Cog className="w-4 h-4" />;
    case "Personal Care & Cosmetics":
      return <Package className="w-4 h-4" />;
    case "Solar & Renewable":
      return <SunMedium className="w-4 h-4" />;
    case "Food & Beverages":
      return <Apple className="w-4 h-4" />;
    case "Automotive & Parts":
      return <Car className="w-4 h-4" />;
    case "Plastics & Materials":
      return <Boxes className="w-4 h-4" />;
    case "Wine & Spirits":
      return <Wine className="w-4 h-4" />;
    case "Oil & Gas":
      return <Droplet className="w-4 h-4" />;
    case "Textiles & Cotton":
      return <Shirt className="w-4 h-4" />;
    case "Agricultural & Fertilizers":
      return <Package className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const getCargoColor = (cargoType: string) => {
  switch (cargoType) {
    case "Electronics & Tech":
      return 'bg-blue-100 text-blue-800';
    case "Pharmaceuticals & Medical":
      return 'bg-green-100 text-green-800';
    case "Furniture & Home":
      return 'bg-orange-100 text-orange-800';
    case "Minerals & Ores":
      return 'bg-slate-100 text-slate-800';
    case "Machinery & Equipment":
      return 'bg-purple-100 text-purple-800';
    case "Solar & Renewable":
      return 'bg-yellow-100 text-yellow-800';
    case "Food & Beverages":
      return 'bg-emerald-100 text-emerald-800';
    case "Automotive & Parts":
      return 'bg-red-100 text-red-800';
    case "Plastics & Materials":
      return 'bg-gray-100 text-gray-800';
    case "Wine & Spirits":
      return 'bg-purple-100 text-purple-800';
    case "Oil & Gas":
      return 'bg-gray-100 text-gray-800';
    case "Textiles & Cotton":
      return 'bg-indigo-100 text-indigo-800';
    case "Agricultural & Fertilizers":
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

// Update the getCommodityUrl function to fix the type checking issue
const getCommodityUrl = (type: keyof typeof commodityCategories): string => {
  return commodityCategories[type] || "/commodities/other";
};

const allProjects = [
  {
    id: "shanghai-mersin-electronics",
    title: "Shanghai to Mersin - Electronics",
    type: "Electronics & Tech",
    status: "active",
    icon: <Ship className="w-4 h-4" />,
    route: "Shanghai → Mersin",
    stats: {
      containers: "35 units",
      weight: "650 tons",
      type: "Electronics & Tech"
    },
    lastUpdate: "2024-10-15",
    services: ["CONT", "TRNS"]
  },
  {
    id: "antwerp-jebel-ali-pharma",
    title: "Antwerp to Jebel Ali - Pharmaceuticals",
    type: "Pharmaceuticals & Medical",
    status: "completed",
    icon: <Ship className="w-4 h-4" />,
    route: "Antwerp → Jebel Ali",
    stats: {
      containers: "25 units",
      weight: "400 tons",
      type: "Pharmaceuticals & Medical"
    },
    lastUpdate: "2024-04-20",
    services: ["CONT", "CUST"]
  },
  {
    id: "istanbul-navasheva-furniture",
    title: "Istanbul to Navasheva - Furniture",
    type: "Furniture & Home",
    status: "completed",
    icon: <Ship className="w-4 h-4" />,
    route: "Istanbul → Navasheva",
    stats: {
      containers: "40 units",
      weight: "900 tons",
      type: "Furniture & Home"
    },
    lastUpdate: "2024-06-15",
    services: ["CONT", "DIST"]
  },
  {
    id: "bandar-shanghai-mineral",
    title: "Bandar Abbas to Shanghai - Mineral",
    type: "Minerals & Ores",
    status: "active",
    icon: <Ship className="w-4 h-4" />,
    route: "Bandar Abbas → Shanghai",
    stats: {
      containers: "50 units",
      weight: "1,200 tons",
      type: "Minerals & Ores"
    },
    lastUpdate: "2024-02-10",
    services: ["BULK", "TRNS"]
  },
  {
    id: "southampton-montreal-machinery",
    title: "England to Canada - Machinery",
    type: "Machinery & Equipment",
    status: "active",
    icon: <Ship className="w-4 h-4" />,
    route: "Southampton → Montreal",
    stats: {
      containers: "20 units",
      weight: "800 tons",
      type: "Machinery & Equipment"
    },
    lastUpdate: "2024-05-20",
    services: ["CONT", "SPEC"]
  },
  {
    id: "jebel-ali-durban-personal",
    title: "Jebel Ali to Africa - Personal Care",
    type: "Personal Care & Cosmetics",
    status: "completed",
    icon: <Ship className="w-4 h-4" />,
    route: "Jebel Ali → Durban",
    stats: {
      containers: "15 units",
      weight: "300 tons",
      type: "Personal Care & Cosmetics"
    },
    lastUpdate: "2024-03-15",
    services: ["CONT", "DIST"]
  },
  {
    id: "nansha-liverpool-solar",
    title: "Nansha to England - Solar Panels",
    type: "Solar & Renewable",
    status: "upcoming",
    icon: <Ship className="w-4 h-4" />,
    route: "Nansha → Liverpool",
    stats: {
      containers: "30 units",
      weight: "600 tons",
      type: "Solar & Renewable"
    },
    lastUpdate: "2024-08-22",
    services: ["CONT", "TRNS"]
  },
  {
    id: "barcelona-jebel-ali-food",
    title: "Barcelona to Jebel Ali - Food",
    type: "Food & Beverages",
    status: "active",
    icon: <Ship className="w-4 h-4" />,
    route: "Barcelona → Jebel Ali",
    stats: {
      containers: "20 units",
      weight: "200 tons",
      type: "Food & Beverages"
    },
    lastUpdate: "2024-09-18",
    services: ["CONT", "GROU"]
  },
  {
    id: "istanbul-dar-automotive",
    title: "Istanbul to Africa - Automotive",
    type: "Automotive & Parts",
    status: "completed",
    icon: <Ship className="w-4 h-4" />,
    route: "Istanbul → Dar es Salaam",
    stats: {
      containers: "45 units",
      weight: "850 tons",
      type: "Automotive & Parts"
    },
    lastUpdate: "2024-11-12",
    services: ["CONT", "TRUCK"]
  },
  {
    id: "shanghai-bandar-plastics",
    title: "Shanghai to Bandar Abbas - Plastics",
    type: "Plastics & Materials",
    status: "upcoming",
    icon: <Ship className="w-4 h-4" />,
    route: "Shanghai → Bandar Abbas",
    stats: {
      containers: "25 units",
      weight: "500 tons",
      type: "Plastics & Materials"
    },
    lastUpdate: "2024-12-05",
    services: ["CONT", "DIST"]
  }
];

const projects = allProjects.sort((a, b) =>
  new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
).slice(0, 6);

const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "completed":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "upcoming":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export default function MiniLatestProjects() {
  const [selectedCargoType, setSelectedCargoType] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const filteredProjects = selectedCargoType
    ? projects.filter(project =>
        project.stats.type.toLowerCase().includes(selectedCargoType.toLowerCase())
      )
    : projects;

  return (
    <>
      <div className="mb-6">
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/latest-projects/${project.id}`)}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {project.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Globe2 className="w-4 h-4 mr-1" />
                      {project.route}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                  {project.services.map(service => (
                    <Link key={service} href={serviceRoutes[service as ServiceType]}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary/80"
                      >
                        {serviceNames[service as ServiceType]}
                      </Badge>
                    </Link>
                  ))}
                </div>

                <Link
                  href={getCommodityUrl(project.stats.type)}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Badge
                    className={`mb-4 cursor-pointer ${getCargoColor(project.stats.type)}`}
                  >
                    <span className="flex items-center gap-1">
                      {getCargoIcon(project.stats.type)}
                      {project.stats.type}
                    </span>
                  </Badge>
                </Link>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-semibold text-primary">{project.stats.containers}</div>
                    <div className="text-gray-500">Containers</div>
                  </div>
                  <div>
                    <div className="font-semibold text-primary">{project.stats.weight}</div>
                    <div className="text-gray-500">Weight</div>
                  </div>
                  <div>
                    <div className="font-semibold text-primary">{project.stats.type}</div>
                    <div className="text-gray-500">Cargo</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center text-xs text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Last updated: {new Date(project.lastUpdate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}