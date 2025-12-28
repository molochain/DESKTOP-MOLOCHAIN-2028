// Partners data - Extracted from routes.ts for better organization
export interface Partner {
  id: number;
  name: string;
  logo: string;
  country: string;
  tags: string[];
  description: string;
  contribution: string;
  industry: string;
  collaborationType: string;
  website: string;
  active: boolean;
  headquarters: string;
  foundedYear: number;
  keyStrengths: string[];
  collaborationAreas: string[];
  achievements: string[];
  timeline?: { year: number; event: string }[];
  caseStudies?: { title: string; description: string; url: string }[];
}

export const partnersData: Partner[] = [
  {
    id: 1,
    name: "LogiTech Solutions",
    logo: "",
    country: "Singapore",
    tags: ["Technology", "AI", "Optimization"],
    description:
      "A leader in logistics technology solutions focusing on AI-powered route optimization and fleet management systems.",
    contribution:
      "Provides advanced tech integrations for real-time shipment tracking and predictive analytics.",
    industry: "Technology",
    collaborationType: "Technical Integration",
    website: "https://logitech-solutions.com",
    active: true,
    headquarters: "Singapore City, Singapore",
    foundedYear: 2010,
    keyStrengths: [
      "AI-powered route optimization technology",
      "Predictive analytics for shipping demand",
      "IoT integration for cargo monitoring",
      "Machine learning algorithms for supply chain optimization",
    ],
    collaborationAreas: [
      "Technology integration and implementation",
      "Custom software development",
      "Data analytics and visualization",
      "IoT sensor networks and telematics",
    ],
    achievements: [
      "Reduced average delivery times by 18% through AI route optimization",
      "Implemented predictive analytics systems for 200+ global clients",
      "Developed proprietary cargo tracking system with 99.8% accuracy",
      "Created machine learning model that improved inventory forecasting by 32%",
    ],
    timeline: [
      { year: 2020, event: "Initial partnership established" },
      { year: 2021, event: "Launch of integrated tracking system" },
      { year: 2022, event: "Expansion to Asian markets" },
      { year: 2023, event: "Joint AI research initiative started" },
      { year: 2024, event: "Global rollout of predictive analytics platform" },
    ],
    caseStudies: [
      {
        title: "AI-Powered Route Optimization",
        description:
          "How LogiTech's AI algorithms reduced delivery times by 18% across MOLOCHAIN's global shipping network.",
        url: "#ai-route-optimization",
      },
      {
        title: "Predictive Analytics Implementation",
        description:
          "Case study on the integration of advanced predictive analytics into MOLOCHAIN's supply chain operations.",
        url: "#predictive-analytics",
      },
    ],
  },
  {
    id: 2,
    name: "Global Shipping Partners",
    logo: "",
    country: "Netherlands",
    tags: ["Maritime", "Shipping", "Global"],
    description:
      "One of the world's largest shipping companies with a vast network of vessels and port operations across continents.",
    contribution:
      "Offers preferential rates and premium shipping lanes to our network partners.",
    industry: "Logistics",
    collaborationType: "Strategic Alliance",
    website: "https://globalshipping-partners.com",
    active: true,
    headquarters: "Rotterdam, Netherlands",
    foundedYear: 1985,
    keyStrengths: [
      "Global fleet of 350+ container vessels",
      "Operations in 120+ major ports worldwide",
      "Specialized in temperature-controlled shipping",
      "Dedicated bulk and break-bulk cargo services",
    ],
    collaborationAreas: [
      "Priority access to major shipping routes",
      "Preferential rates for network members",
      "Vessel sharing and capacity optimization",
      "Joint ventures for terminal operations",
    ],
    achievements: [
      "Expanded fleet by 25% in the past three years",
      "Reduced carbon emissions by 15% through vessel efficiency improvements",
      "Developed direct shipping routes to 8 emerging markets",
      "Established state-of-the-art container tracking system",
    ],
    timeline: [
      { year: 2019, event: "Initial strategic alliance formed" },
      { year: 2020, event: "First joint vessel sharing agreement" },
      { year: 2021, event: "Expanded into South American routes" },
      { year: 2022, event: "Joint terminal operation in Singapore" },
      { year: 2024, event: "Launch of combined fleet management system" },
    ],
    caseStudies: [
      {
        title: "Global Fleet Expansion",
        description:
          "How MOLOCHAIN and Global Shipping Partners collaborated to expand shipping capacity by 25% in key markets.",
        url: "#fleet-expansion",
      },
      {
        title: "Sustainable Shipping Initiative",
        description:
          "Case study on reducing carbon emissions by 15% through joint vessel efficiency improvements.",
        url: "#sustainable-shipping",
      },
      {
        title: "Terminal Operations Innovation",
        description:
          "Details of the joint Singapore terminal operation that increased throughput by 40%.",
        url: "#terminal-operations",
      },
    ],
  },
  {
    id: 3,
    name: "EcoFreight Innovations",
    logo: "",
    country: "Germany",
    tags: ["Sustainability", "Green Logistics", "Carbon Neutral"],
    description:
      "Pioneering sustainable shipping solutions with carbon-neutral fleet operations and eco-friendly packaging.",
    contribution:
      "Helps reduce environmental footprint across the supply chain with innovative green technologies.",
    industry: "Logistics",
    collaborationType: "Service Provider",
    website: "https://ecofreight-green.com",
    active: true,
    headquarters: "Hamburg, Germany",
    foundedYear: 2012,
    keyStrengths: [
      "Carbon-neutral shipping operations",
      "Sustainable packaging solutions",
      "Renewable energy-powered warehouses",
      "Environmental compliance consulting",
    ],
    collaborationAreas: [
      "Supply chain carbon footprint reduction",
      "Eco-friendly packaging implementation",
      "Sustainability certification assistance",
      "Environmental compliance reporting",
    ],
    achievements: [
      "Achieved carbon neutrality across entire operations",
      "Developed biodegradable packaging that reduced plastic use by 78%",
      "Assisted 50+ clients in achieving sustainability certifications",
      "Reduced clients' average shipping emissions by 35%",
    ],
  },
  {
    id: 4,
    name: "Quantum Ventures",
    logo: "",
    country: "United States",
    tags: ["Investment", "Venture Capital", "Growth"],
    description:
      "A forward-thinking investment firm specializing in logistics and supply chain technology startups.",
    contribution:
      "Provides strategic funding and business development expertise to scale operations.",
    industry: "Finance",
    collaborationType: "Financial Investor",
    website: "https://quantum-automation.com",
    active: true,
    headquarters: "San Francisco, USA",
    foundedYear: 2008,
    keyStrengths: [
      "Specialized focus on logistics and supply chain investments",
      "Deep industry expertise and network",
      "Long-term growth perspective",
      "Hands-on operational support",
    ],
    collaborationAreas: [
      "Strategic investment and growth capital",
      "Business development and scaling expertise",
      "Industry partnership introductions",
      "Advisory services and governance",
    ],
    achievements: [
      "Managed $1.2B in assets focused on logistics technology",
      "Average portfolio company growth rate of 43% annually",
      "Successfully exited 12 logistics technology investments",
      "Created innovation hub connecting startups with enterprise partners",
    ],
  },
  {
    id: 5,
    name: "Pacific Trade Solutions",
    logo: "",
    country: "Australia",
    tags: ["Regional", "Customs", "Trade"],
    description:
      "Experts in Asia-Pacific customs regulations and regional trade compliance with strong government relationships.",
    contribution:
      "Facilitates smooth customs clearance and regulatory compliance across APAC markets.",
    industry: "Legal",
    collaborationType: "Service Provider",
    website: "https://pacifictrade-alliance.com",
    active: true,
    headquarters: "Sydney, Australia",
    foundedYear: 2005,
    keyStrengths: [
      "Comprehensive APAC regulatory expertise",
      "Strong government relations across 15 countries",
      "Specialized customs documentation systems",
      "Trade agreement optimization capabilities",
    ],
    collaborationAreas: [
      "Customs clearance facilitation",
      "Regulatory compliance consulting",
      "Trade agreement optimization",
      "Import/export documentation",
    ],
    achievements: [
      "Reduced average customs clearance times by 47%",
      "Saved clients over $25M in duties through trade agreement optimization",
      "Successfully managed 50,000+ customs clearances with 99.7% accuracy",
      "Developed proprietary compliance checking system used by major ports",
    ],
  },
  {
    id: 6,
    name: "African Logistics Network",
    logo: "",
    country: "Kenya",
    tags: ["Regional", "Distribution", "Last Mile"],
    description:
      "The largest logistics network in Africa with operations in 27 countries providing unparalleled regional coverage.",
    contribution:
      "Provides exceptional last-mile delivery and local distribution services across African markets.",
    industry: "Logistics",
    collaborationType: "Local Operator",
    website: "https://african-logistics-hub.com",
    active: true,
    headquarters: "Nairobi, Kenya",
    foundedYear: 2009,
    keyStrengths: [
      "Extensive network in 27 African countries",
      "Specialized knowledge of local markets",
      "Last-mile delivery expertise in challenging regions",
      "Strong relationships with local authorities",
    ],
    collaborationAreas: [
      "Regional distribution and warehousing",
      "Last-mile delivery in African markets",
      "Market entry consulting",
      "Local partnership facilitation",
    ],
    achievements: [
      "Built Africa's largest owned delivery fleet with 1,500+ vehicles",
      "Reached 85% population coverage across operational countries",
      "Reduced delivery times in rural areas by 60%",
      "Developed mobile payment integration for regional transactions",
    ],
  },
  {
    id: 7,
    name: "BlockchainFreight",
    logo: "",
    country: "Estonia",
    tags: ["Blockchain", "Smart Contracts", "Security"],
    description:
      "Pioneers in blockchain technology for secure, transparent, and efficient supply chain documentation.",
    contribution:
      "Implements smart contract solutions for automated payments and secure documentation.",
    industry: "Technology",
    collaborationType: "Technical Integration",
    website: "https://blockchain-freight.com",
    active: true,
    headquarters: "Tallinn, Estonia",
    foundedYear: 2016,
    keyStrengths: [
      "Proprietary blockchain for supply chain documentation",
      "Smart contract development expertise",
      "Decentralized freight documentation system",
      "Secure authentication protocols",
    ],
    collaborationAreas: [
      "Blockchain implementation and integration",
      "Smart contract automation",
      "Document security and authentication",
      "Payment automation systems",
    ],
    achievements: [
      "Reduced documentation processing time by 94%",
      "Eliminated paperwork errors through smart contract validation",
      "Decreased payment settlement times from days to minutes",
      "Saved clients $4.5M in dispute resolution costs",
    ],
    timeline: [
      { year: 2021, event: "Partnership agreement signed" },
      { year: 2022, event: "Pilot blockchain documentation system launch" },
      { year: 2022, event: "First smart contracts implemented" },
      { year: 2023, event: "Full integration with MOLOCHAIN platform" },
      { year: 2024, event: "Expanded to cover payment automation" },
    ],
  },
  {
    id: 8,
    name: "Global Trade Institute",
    logo: "",
    country: "Switzerland",
    tags: ["Research", "Analytics", "Education"],
    description:
      "Leading research institute dedicated to global trade patterns, policy analysis, and logistics optimization.",
    contribution:
      "Provides market intelligence and trade flow analytics to optimize shipping routes.",
    industry: "Research",
    collaborationType: "Research Partner",
    website: "https://global-trade-institute.org",
    active: true,
    headquarters: "Geneva, Switzerland",
    foundedYear: 1994,
    keyStrengths: [
      "Comprehensive global trade data collection",
      "Advanced trade pattern analysis",
      "Trade policy impact assessment",
      "Economic forecasting for logistics",
    ],
    collaborationAreas: [
      "Market intelligence and data sharing",
      "Trade flow optimization research",
      "Policy impact analysis",
      "Industry education and training",
    ],
    achievements: [
      "Published 200+ research papers on global trade optimization",
      "Developed predictive model for trade disruptions with 88% accuracy",
      "Created industry-standard trade route efficiency metrics",
      "Trained 5,000+ logistics professionals through specialized programs",
    ],
    timeline: [
      { year: 2018, event: "Formal partnership agreement" },
      { year: 2019, event: "First joint research project" },
      { year: 2020, event: "Launch of trade flow analysis tool" },
      { year: 2022, event: "Co-sponsored global logistics summit" },
      { year: 2023, event: "Began AI-powered route optimization research" },
    ],
  },
  {
    id: 9,
    name: "Middle East Distribution Co.",
    logo: "",
    country: "UAE",
    tags: ["Regional", "Warehousing", "Distribution"],
    description:
      "Strategic hub operator with extensive warehousing and distribution networks across the Middle East and North Africa.",
    contribution:
      "Offers premium warehouse space and regional distribution expertise in key MENA markets.",
    industry: "Logistics",
    collaborationType: "Local Operator",
    website: "https://middle-east-distribution.com",
    active: true,
    headquarters: "Dubai, UAE",
    foundedYear: 2004,
    keyStrengths: [
      "Strategic locations in 9 MENA countries",
      "Modern warehousing facilities exceeding 450,000 sqm",
      "Specialized handling for temperature-sensitive goods",
      "Strong customs relationships across the region",
    ],
    collaborationAreas: [
      "Regional warehousing and distribution",
      "Cross-border logistics in MENA",
      "Specialized handling for sensitive cargo",
      "Market entry facilitation",
    ],
    achievements: [
      "Expanded warehouse capacity by 65% in the past 5 years",
      "Established cross-border distribution network serving 12 countries",
      "Reduced regional distribution times by 40%",
      "Implemented advanced tracking system with 99.9% accuracy",
    ],
  },
];

// Helper function to get partner by ID
export const getPartnerById = (id: number): Partner | undefined => {
  return partnersData.find((p) => p.id === id);
};

// Helper function to get related partners
export const getRelatedPartners = (id: number, limit: number = 3): Partial<Partner>[] => {
  const partner = getPartnerById(id);
  if (!partner) return [];

  return partnersData
    .filter(
      (p) =>
        p.id !== id &&
        (p.industry === partner.industry ||
          p.collaborationType === partner.collaborationType),
    )
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      name: p.name,
      logo: p.logo,
      country: p.country,
      tags: p.tags,
      description: p.description,
      industry: p.industry,
      collaborationType: p.collaborationType,
    }));
};
