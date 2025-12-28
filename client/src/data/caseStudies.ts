export interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  image: string;
  serviceIds: string[];
  featured?: boolean;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "global-shipping-optimization",
    title: "Global Shipping Route Optimization",
    company: "TransOcean Logistics",
    industry: "Maritime Shipping",
    challenge: "TransOcean Logistics was experiencing significant delays and cost overruns due to inefficient shipping routes across their global network spanning 45 countries. Manual route planning led to 30% excess fuel consumption and frequent port congestion issues.",
    solution: "MoloChain implemented an AI-powered route optimization system integrated with real-time weather data, port traffic analytics, and predictive maintenance schedules. We deployed our container tracking solution across their entire fleet of 200+ vessels.",
    results: [
      { metric: "Cost Reduction", value: "28%", description: "Annual shipping costs reduced" },
      { metric: "Transit Time", value: "-35%", description: "Average delivery time improvement" },
      { metric: "Fuel Efficiency", value: "+42%", description: "Fuel consumption optimization" },
      { metric: "On-Time Delivery", value: "98.5%", description: "Improved from 76% baseline" }
    ],
    image: "/services/shipping.png",
    serviceIds: ["container", "supply-chain", "consultation"],
    featured: true
  },
  {
    id: "ecommerce-fulfillment",
    title: "E-Commerce Fulfillment Transformation",
    company: "QuickMart Global",
    industry: "E-Commerce & Retail",
    challenge: "QuickMart faced overwhelming order volumes during peak seasons, with fulfillment times averaging 5-7 days. Their fragmented warehouse network lacked integration, causing inventory discrepancies and customer dissatisfaction.",
    solution: "We designed and implemented a unified fulfillment network with 12 strategically located warehouses. Our drop-shipping integration and real-time inventory sync reduced handling time by automating 85% of order processing workflows.",
    results: [
      { metric: "Fulfillment Speed", value: "24hrs", description: "Same-day processing achieved" },
      { metric: "Order Accuracy", value: "99.8%", description: "Reduced errors by 94%" },
      { metric: "Customer Satisfaction", value: "+45%", description: "NPS score improvement" },
      { metric: "Peak Capacity", value: "3x", description: "Handling capacity increase" }
    ],
    image: "/services/drop-shipping.png",
    serviceIds: ["warehousing", "drop-shipping", "online-shopping", "distribution"]
  },
  {
    id: "pharma-cold-chain",
    title: "Pharmaceutical Cold Chain Excellence",
    company: "BioMed Pharmaceuticals",
    industry: "Pharmaceuticals & Healthcare",
    challenge: "BioMed needed to transport temperature-sensitive vaccines across 30 countries while maintaining strict 2-8°C requirements. Previous logistics partners had a 12% spoilage rate, costing millions in lost inventory and regulatory penalties.",
    solution: "MoloChain deployed specialized cold chain logistics with IoT-enabled temperature monitoring, redundant cooling systems, and 24/7 real-time tracking. Our customs clearance team expedited border crossings to minimize transit exposure.",
    results: [
      { metric: "Spoilage Rate", value: "0.3%", description: "Down from 12% previously" },
      { metric: "Compliance Score", value: "100%", description: "Full regulatory compliance" },
      { metric: "Coverage", value: "30+", description: "Countries served reliably" },
      { metric: "Cost Savings", value: "$4.2M", description: "Annual savings achieved" }
    ],
    image: "/services/special-transport.png",
    serviceIds: ["special-transport", "customs", "airfreight", "documentation"]
  },
  {
    id: "cross-border-trade",
    title: "Cross-Border Trade Facilitation",
    company: "Asia Pacific Trading Co.",
    industry: "International Trade",
    challenge: "Complex customs regulations across 15 Asian markets created unpredictable clearance times averaging 8-12 days. Documentation errors caused 25% of shipments to face holds or penalties, severely impacting cash flow.",
    solution: "Our team implemented automated customs documentation with AI-powered classification, pre-clearance processing, and established trusted trader relationships with customs authorities in all target markets.",
    results: [
      { metric: "Clearance Time", value: "2 days", description: "Average from 8-12 days" },
      { metric: "Documentation Accuracy", value: "99.9%", description: "Near-zero error rate" },
      { metric: "Duty Optimization", value: "18%", description: "Reduced duty payments" },
      { metric: "Trade Volume", value: "+65%", description: "Enabled business growth" }
    ],
    image: "/services/customs.png",
    serviceIds: ["customs", "documentation", "transit", "finance"]
  },
  {
    id: "multimodal-network",
    title: "Integrated Multimodal Logistics Network",
    company: "Continental Industries",
    industry: "Manufacturing",
    challenge: "Continental operated siloed transportation modes with separate vendors for rail, trucking, and sea freight. This fragmentation caused coordination failures, inventory build-ups, and 40% higher logistics costs than industry benchmarks.",
    solution: "MoloChain unified all transportation modes under a single platform with intelligent mode selection, seamless handoffs, and consolidated billing. We optimized their network using our rail and trucking services for last-mile delivery.",
    results: [
      { metric: "Logistics Cost", value: "-32%", description: "Total cost reduction" },
      { metric: "Lead Time", value: "-40%", description: "Order-to-delivery improvement" },
      { metric: "Carbon Footprint", value: "-25%", description: "Environmental impact reduction" },
      { metric: "Visibility", value: "100%", description: "End-to-end tracking achieved" }
    ],
    image: "/services/rail.png",
    serviceIds: ["rail", "trucking", "container", "supply-chain", "groupage"]
  },
  {
    id: "bulk-commodity-logistics",
    title: "Bulk Commodity Supply Chain",
    company: "GrainWorld Commodities",
    industry: "Agriculture & Commodities",
    challenge: "GrainWorld struggled with seasonal demand spikes, inadequate storage capacity, and port congestion during harvest seasons. They lost 15% of grain value to spoilage and quality degradation during extended storage.",
    solution: "We implemented a comprehensive bulk handling solution with climate-controlled silos, optimized port scheduling, and predictive analytics for harvest timing. Our chartering services secured dedicated vessel capacity during peak seasons.",
    results: [
      { metric: "Spoilage Loss", value: "-90%", description: "From 15% to 1.5%" },
      { metric: "Storage Capacity", value: "+200%", description: "Through network optimization" },
      { metric: "Port Turnaround", value: "48hrs", description: "From 7+ days average" },
      { metric: "Revenue Impact", value: "+$12M", description: "Annual value preserved" }
    ],
    image: "/services/bulk.png",
    serviceIds: ["bulk", "port-services", "chartering", "warehousing", "project"]
  }
];

export const industries = [
  "All Industries",
  "Maritime Shipping",
  "E-Commerce & Retail",
  "Pharmaceuticals & Healthcare",
  "International Trade",
  "Manufacturing",
  "Agriculture & Commodities"
];

export const getCaseStudyById = (id: string): CaseStudy | undefined => {
  return caseStudies.find(cs => cs.id === id);
};

export const getCaseStudiesByIndustry = (industry: string): CaseStudy[] => {
  if (industry === "All Industries") return caseStudies;
  return caseStudies.filter(cs => cs.industry === industry);
};

export const getFeaturedCaseStudy = (): CaseStudy | undefined => {
  return caseStudies.find(cs => cs.featured);
};

export const getCaseStudiesByService = (serviceId: string): CaseStudy[] => {
  return caseStudies.filter(cs => cs.serviceIds.includes(serviceId));
};
