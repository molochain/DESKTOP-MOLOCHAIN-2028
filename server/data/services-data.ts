// Comprehensive data about all available services with metadata useful for AI recommendations
export const servicesData = [
  {
    id: "container",
    name: "Container Services",
    description: "Comprehensive container handling and management solutions",
    image: "attached_assets/generated_images/Container_services_terminal_operations_d7c60d46.png",
    tags: ["container", "shipping", "logistics"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "wholesale"],
    cargoTypes: ["container", "general"],
    capabilities: [
      "Full container load (FCL) shipping",
      "Less than container load (LCL) shipping",
      "Container tracking and visibility",
      "Container maintenance and inspection",
      "Container storage and warehousing",
      "Specialized container handling",
      "Temperature-controlled containers",
      "Global container shipping network"
    ]
  },
  {
    id: "trucking",
    name: "Trucking Services",
    description: "Reliable road transportation solutions",
    image: "attached_assets/generated_images/Trucking_transportation_services_f12cdd8e.png",
    tags: ["trucking", "transport", "logistics"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "wholesale", "agriculture"],
    cargoTypes: ["general", "container", "bulk-dry", "refrigerated", "oversized"],
    capabilities: [
      "Full truckload (FTL) services",
      "Less than truckload (LTL) services",
      "Door-to-door delivery",
      "Expedited delivery options",
      "Specialized equipment for oversized cargo",
      "Temperature-controlled transport",
      "Cross-border trucking",
      "Last-mile delivery"
    ]
  },
  {
    id: "airfreight",
    name: "Air Freight Services",
    description: "Fast and reliable worldwide air cargo transportation solutions",
    image: "attached_assets/generated_images/Air_freight_cargo_services_6e8765cf.png",
    tags: ["air", "freight", "express"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "healthcare", "technology"],
    cargoTypes: ["general", "fragile", "refrigerated", "hazardous"],
    capabilities: [
      "Express air freight",
      "Next-flight-out service",
      "Charter solutions for urgent shipments",
      "Temperature-sensitive cargo handling",
      "Dangerous goods transport",
      "High-value cargo security measures",
      "Global airport network",
      "Customs clearance assistance"
    ]
  },
  {
    id: "rail",
    name: "Rail Services",
    description: "Efficient rail freight transportation solutions",
    image: "attached_assets/generated_images/Rail_freight_transportation_04f4bb43.png",
    tags: ["rail", "freight", "transport"],
    businessTypes: ["manufacturing", "wholesale", "mining", "agriculture"],
    cargoTypes: ["container", "bulk-dry", "bulk-liquid", "oversized", "vehicles"],
    capabilities: [
      "Intermodal transport solutions",
      "Container rail freight",
      "Bulk cargo rail transport",
      "Cross-border rail services",
      "Track & trace systems",
      "Rail terminal operations",
      "Railcar management",
      "Energy-efficient transportation"
    ]
  },
  {
    id: "warehousing",
    name: "Warehousing Services",
    description: "State-of-the-art storage and inventory management",
    image: "attached_assets/generated_images/Warehousing_storage_services_4cac1c12.png",
    tags: ["warehousing", "storage", "inventory"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "wholesale"],
    cargoTypes: ["general", "container", "refrigerated", "hazardous"],
    capabilities: [
      "Short and long-term storage solutions",
      "Climate-controlled facilities",
      "Inventory management systems",
      "Order fulfillment services",
      "Cross-docking operations",
      "Value-added services",
      "Security systems and monitoring",
      "Distribution center capabilities"
    ]
  },
  {
    id: "bulk",
    name: "Bulk Services",
    description: "Specialized bulk cargo handling solutions",
    image: "attached_assets/generated_images/Bulk_cargo_handling_5f23ab70.png",
    tags: ["bulk", "cargo", "handling"],
    businessTypes: ["manufacturing", "agriculture", "mining", "construction"],
    cargoTypes: ["bulk-dry", "bulk-liquid"],
    capabilities: [
      "Dry bulk cargo handling",
      "Liquid bulk transport",
      "Specialized loading/unloading equipment",
      "Bulk storage facilities",
      "Commodity-specific handling protocols",
      "Safety and environmental compliance",
      "Quality control measures",
      "High-volume capacity"
    ]
  },
  {
    id: "special-transport",
    name: "Special Transportation",
    description: "Specialized solutions for unique and challenging cargo",
    image: "attached_assets/generated_images/Special_transport_services_270c7efc.png",
    tags: ["special", "transport", "cargo", "refrigerated", "heavy-lift"],
    businessTypes: ["manufacturing", "construction", "healthcare", "technology", "mining"],
    cargoTypes: ["oversized", "hazardous", "refrigerated", "fragile", "livestock"],
    capabilities: [
      "Heavy lift and project cargo",
      "Oversized cargo transport",
      "Temperature-controlled shipping",
      "Hazardous materials handling",
      "High-security transport",
      "Fragile cargo handling protocols",
      "Specialized equipment and vehicles",
      "Custom transport planning"
    ]
  },
  {
    id: "customs",
    name: "Customs Clearance",
    description: "Expert customs clearance and documentation services",
    image: "attached_assets/generated_images/Customs_clearance_services_616d889f.png",
    tags: ["customs", "clearance", "documentation"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "wholesale"],
    cargoTypes: ["general", "container", "hazardous"],
    capabilities: [
      "Import/export declarations",
      "Customs documentation preparation",
      "Tariff classification assistance",
      "Duty and tax calculation",
      "Regulatory compliance guidance",
      "Customs bond services",
      "Customs brokerage",
      "Free trade agreement expertise"
    ]
  },
  {
    id: "drop-shipping",
    name: "Drop Shipping Services",
    description: "Seamless product fulfillment solutions for online retailers",
    image: "attached_assets/generated_images/Drop_shipping_fulfillment_70aee1b8.png",
    tags: ["drop-shipping", "e-commerce", "fulfillment"],
    businessTypes: ["e-commerce", "retail"],
    cargoTypes: ["general"],
    capabilities: [
      "Supplier network management",
      "E-commerce platform integration",
      "Automated order processing",
      "Inventory management",
      "Shipping label generation",
      "Package tracking",
      "Return processing",
      "White-label shipping"
    ]
  },
  {
    id: "port-services",
    name: "Port Services",
    description: "Comprehensive port operations and management solutions",
    image: "attached_assets/generated_images/Port_operations_management_0da75b56.png",
    tags: ["port", "maritime", "operations"],
    businessTypes: ["manufacturing", "wholesale", "shipping"],
    cargoTypes: ["container", "bulk-dry", "bulk-liquid", "general"],
    capabilities: [
      "Vessel berthing management",
      "Container terminal operations",
      "Stevedoring services",
      "Cargo handling and storage",
      "Vessel loading/unloading",
      "Port security services",
      "Customs coordination",
      "Terminal productivity optimization"
    ]
  },
  {
    id: "supply-chain",
    name: "Supply Chain Services",
    description: "End-to-end supply chain management and optimization solutions",
    image: "attached_assets/generated_images/Supply_chain_management_7023cdd8.png",
    tags: ["supply-chain", "logistics", "optimization"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "wholesale"],
    cargoTypes: ["general", "container", "bulk-dry", "refrigerated"],
    capabilities: [
      "Supply chain design and optimization",
      "Demand forecasting and planning",
      "Inventory optimization",
      "Supplier management",
      "Supply chain visibility tools",
      "Risk management strategies",
      "Performance analytics",
      "Continuous improvement programs"
    ]
  },
  {
    id: "groupage",
    name: "Groupage Services",
    description: "Consolidated shipping solutions",
    image: "attached_assets/generated_images/Groupage_consolidation_services_45501d59.png",
    tags: ["groupage", "shipping", "consolidation"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "wholesale"],
    cargoTypes: ["general", "container"],
    capabilities: [
      "Cargo consolidation",
      "Cost-effective small shipment solutions",
      "Regular departure schedules",
      "Multiple destination handling",
      "Shared container utilization",
      "Reduced transit costs",
      "Simplified documentation",
      "International groupage networks"
    ]
  },
  {
    id: "finance",
    name: "Finance Services",
    description: "Comprehensive financial solutions for logistics operations",
    image: "attached_assets/generated_images/Financial_logistics_services_d88547dd.png",
    tags: ["finance", "logistics", "payment"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "wholesale"],
    cargoTypes: ["all"],
    capabilities: [
      "Trade finance solutions",
      "Payment processing services",
      "Invoice factoring options",
      "Financial planning assistance",
      "Currency exchange services",
      "Credit facilities",
      "Insurance arrangements",
      "Payment term management"
    ]
  },
  {
    id: "documentation",
    name: "Documentation Services",
    description: "Expert handling of all shipping and trade documentation",
    image: "attached_assets/generated_images/Documentation_management_services_1db92a96.png",
    tags: ["documentation", "compliance", "paperwork"],
    businessTypes: ["manufacturing", "retail", "wholesale", "e-commerce"],
    cargoTypes: ["all"],
    capabilities: [
      "Bill of lading preparation",
      "Commercial invoice processing",
      "Certificate of origin documentation",
      "Dangerous goods documentation",
      "Packing list generation",
      "Electronic document management",
      "Document verification services",
      "Regulatory compliance checking"
    ]
  },
  {
    id: "consultation",
    name: "Logistics Consultation",
    description: "Expert consulting and optimization services",
    image: "attached_assets/generated_images/Logistics_consulting_services_26087bd8.png",
    tags: ["consulting", "optimization", "logistics"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "wholesale"],
    cargoTypes: ["all"],
    capabilities: [
      "Supply chain assessment",
      "Process improvement consulting",
      "Cost reduction strategies",
      "Strategic planning services",
      "Technology implementation guidance",
      "Route optimization",
      "Carrier selection assistance",
      "Performance benchmarking"
    ]
  },
  {
    id: "online-shopping",
    name: "Online Shopping Integration",
    description: "Seamless e-commerce and logistics integration solutions",
    image: "attached_assets/generated_images/E-commerce_integration_platform_72127fad.png",
    tags: ["e-commerce", "retail", "integration"],
    businessTypes: ["retail", "e-commerce"],
    cargoTypes: ["general", "fragile"],
    capabilities: [
      "E-commerce platform integration",
      "Order management systems",
      "Inventory synchronization",
      "Last-mile delivery services",
      "Return logistics management",
      "Delivery time optimization",
      "Customer communication tools",
      "International e-commerce solutions"
    ]
  },
  {
    id: "transit",
    name: "Transit Services",
    description: "Seamless transit and cross-border transportation solutions",
    image: "attached_assets/generated_images/Transit_transport_services_3a5d2c89.png",
    tags: ["transit", "cross-border", "transportation"],
    businessTypes: ["manufacturing", "retail", "wholesale", "e-commerce"],
    cargoTypes: ["general", "container", "refrigerated"],
    capabilities: [
      "Cross-border transit management",
      "Transit documentation",
      "Bonded transport services",
      "Multi-modal transit solutions",
      "Transit time optimization",
      "Real-time transit tracking",
      "Transit insurance coverage",
      "Regulatory compliance"
    ]
  },
  {
    id: "cross-staffing",
    name: "Cross Staffing Services",
    description: "Professional logistics workforce solutions",
    image: "attached_assets/generated_images/Cross_staffing_workforce_b8f3e210.png",
    tags: ["staffing", "workforce", "personnel"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Temporary staff placement",
      "Permanent recruitment",
      "Skilled workforce training",
      "Peak season staffing",
      "Specialized roles recruitment",
      "Performance management",
      "HR consulting services",
      "Workforce optimization"
    ]
  },
  {
    id: "agency",
    name: "Agency Services",
    description: "Comprehensive shipping agency and representation",
    image: "attached_assets/generated_images/Agency_services_representation_c9a4f312.png",
    tags: ["agency", "representation", "shipping"],
    businessTypes: ["shipping", "manufacturing", "wholesale"],
    cargoTypes: ["all"],
    capabilities: [
      "Shipping agency representation",
      "Port agency services",
      "Vessel husbandry",
      "Crew services coordination",
      "Ship chandling arrangements",
      "Documentation handling",
      "Local liaison services",
      "24/7 agency support"
    ]
  },
  {
    id: "tranship",
    name: "Transhipment Services",
    description: "Expert transhipment and cargo transfer solutions",
    image: "attached_assets/generated_images/Transhipment_cargo_transfer_d5b6e423.png",
    tags: ["transhipment", "transfer", "cargo"],
    businessTypes: ["shipping", "manufacturing", "wholesale"],
    cargoTypes: ["container", "bulk-dry", "bulk-liquid", "general"],
    capabilities: [
      "Transhipment hub operations",
      "Cargo transfer coordination",
      "Multi-vessel operations",
      "Storage during transhipment",
      "Documentation management",
      "Risk mitigation strategies",
      "Cost optimization",
      "Schedule coordination"
    ]
  },
  {
    id: "post",
    name: "Postal Services",
    description: "International postal and parcel delivery solutions",
    image: "attached_assets/generated_images/Postal_service_facility_229acbae.png",
    tags: ["postal", "parcel", "delivery"],
    businessTypes: ["e-commerce", "retail", "personal"],
    cargoTypes: ["general", "documents"],
    capabilities: [
      "International mail services",
      "Express parcel delivery",
      "Registered mail handling",
      "Package tracking systems",
      "Last-mile postal delivery",
      "Bulk mail solutions",
      "PO Box services",
      "Document courier services"
    ]
  },
  {
    id: "third-party",
    name: "Third Party Logistics",
    description: "Complete 3PL outsourcing solutions",
    image: "attached_assets/generated_images/Third_party_logistics_e7f8d534.png",
    tags: ["3PL", "outsourcing", "logistics"],
    businessTypes: ["manufacturing", "retail", "e-commerce", "wholesale"],
    cargoTypes: ["all"],
    capabilities: [
      "Complete logistics outsourcing",
      "Inventory management",
      "Order fulfillment",
      "Transportation management",
      "Warehouse operations",
      "Value-added services",
      "Returns processing",
      "Supply chain integration"
    ]
  },
  {
    id: "auction",
    name: "Auction Services",
    description: "Logistics auction and bidding platform",
    image: "attached_assets/generated_images/Auction_bidding_platform_f2a3b645.png",
    tags: ["auction", "bidding", "marketplace"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Freight rate auctions",
      "Service bidding platform",
      "Reverse auction management",
      "Contract negotiations",
      "Vendor selection process",
      "Price discovery tools",
      "Market analysis",
      "Automated bidding systems"
    ]
  },
  {
    id: "blockchain",
    name: "Blockchain Solutions",
    description: "Innovative blockchain-based logistics solutions",
    image: "attached_assets/generated_images/Blockchain_logistics_technology_g3h5i756.png",
    tags: ["blockchain", "technology", "innovation"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Smart contract implementation",
      "Supply chain transparency",
      "Document authentication",
      "Cargo tracking on blockchain",
      "Digital bill of lading",
      "Cryptocurrency payments",
      "Fraud prevention",
      "Decentralized logistics networks"
    ]
  },
  {
    id: "business",
    name: "Business Services",
    description: "Comprehensive business support and development",
    image: "attached_assets/generated_images/Business_services_support_h4j6k867.png",
    tags: ["business", "support", "development"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Business plan development",
      "Market entry strategies",
      "Partnership facilitation",
      "Business process optimization",
      "Regulatory compliance support",
      "Growth strategy consulting",
      "Risk assessment services",
      "Performance improvement"
    ]
  },
  {
    id: "certificates",
    name: "Certificate Services",
    description: "Professional certification and compliance management",
    image: "attached_assets/generated_images/Certificate_compliance_services_i5k7l978.png",
    tags: ["certificates", "compliance", "documentation"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Certificate of origin processing",
      "Quality certificates",
      "Compliance certifications",
      "Health certificates",
      "Phytosanitary certificates",
      "ISO certification support",
      "Document legalization",
      "Certificate verification"
    ]
  },
  {
    id: "chartering",
    name: "Chartering Services",
    description: "Vessel and aircraft chartering solutions",
    image: "attached_assets/generated_images/Chartering_vessel_aircraft_j6l8m089.png",
    tags: ["chartering", "vessel", "aircraft"],
    businessTypes: ["shipping", "manufacturing", "wholesale"],
    cargoTypes: ["bulk-dry", "bulk-liquid", "project-cargo", "general"],
    capabilities: [
      "Vessel chartering",
      "Aircraft chartering",
      "Charter party negotiations",
      "Voyage planning",
      "Charter documentation",
      "Market analysis",
      "Charter cost optimization",
      "Crew and vessel vetting"
    ]
  },
  {
    id: "companies",
    name: "Company Services",
    description: "Corporate logistics and fleet management",
    image: "attached_assets/generated_images/Company_fleet_management_k7m9n190.png",
    tags: ["corporate", "fleet", "management"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Corporate account management",
      "Fleet management solutions",
      "Dedicated logistics teams",
      "Custom SLA agreements",
      "Volume discounts",
      "Priority service access",
      "Executive reporting",
      "Strategic partnerships"
    ]
  },
  {
    id: "cooperation",
    name: "Cooperation Services",
    description: "International cooperation and joint ventures",
    image: "attached_assets/generated_images/Cooperation_joint_ventures_l8n0o201.png",
    tags: ["cooperation", "partnership", "joint-venture"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Joint venture facilitation",
      "International partnerships",
      "Cooperative agreements",
      "Alliance management",
      "Resource sharing programs",
      "Collaborative logistics",
      "Network expansion",
      "Strategic alliances"
    ]
  },
  {
    id: "distribution",
    name: "Distribution Services",
    description: "Comprehensive distribution network management",
    image: "attached_assets/generated_images/Distribution_network_services_m9o1p312.png",
    tags: ["distribution", "network", "delivery"],
    businessTypes: ["manufacturing", "retail", "wholesale", "e-commerce"],
    cargoTypes: ["general", "container", "refrigerated"],
    capabilities: [
      "Distribution network design",
      "Multi-channel distribution",
      "Regional distribution centers",
      "Direct store delivery",
      "Cross-docking services",
      "Route optimization",
      "Delivery scheduling",
      "Distribution analytics"
    ]
  },
  {
    id: "ecosystem",
    name: "Ecosystem Services",
    description: "Integrated logistics ecosystem management",
    image: "attached_assets/generated_images/Ecosystem_logistics_platform_n0p2q423.png",
    tags: ["ecosystem", "platform", "integration"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Ecosystem integration",
      "Platform connectivity",
      "Partner network access",
      "Data exchange systems",
      "Collaborative tools",
      "Ecosystem analytics",
      "Innovation hub access",
      "Technology integration"
    ]
  },
  {
    id: "education",
    name: "Education Services",
    description: "Professional logistics training and certification",
    image: "attached_assets/generated_images/Education_training_logistics_o1q3r534.png",
    tags: ["education", "training", "certification"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Professional training programs",
      "Industry certifications",
      "Online learning platforms",
      "Workshops and seminars",
      "Compliance training",
      "Skills development",
      "Leadership programs",
      "Custom training solutions"
    ]
  },
  {
    id: "events",
    name: "Event Logistics",
    description: "Specialized event and exhibition logistics",
    image: "attached_assets/generated_images/Event_exhibition_logistics_p2r4s645.png",
    tags: ["events", "exhibitions", "logistics"],
    businessTypes: ["events", "exhibitions", "entertainment"],
    cargoTypes: ["general", "fragile", "oversized"],
    capabilities: [
      "Exhibition logistics",
      "Trade show management",
      "Event cargo handling",
      "Temporary storage solutions",
      "On-site logistics support",
      "Custom booth transport",
      "Time-critical delivery",
      "Return logistics"
    ]
  },
  {
    id: "export",
    name: "Export Services",
    description: "Complete export management and facilitation",
    image: "attached_assets/generated_images/Export_management_services_q3s5t756.png",
    tags: ["export", "international", "trade"],
    businessTypes: ["manufacturing", "wholesale", "agriculture"],
    cargoTypes: ["all"],
    capabilities: [
      "Export documentation",
      "Export licensing",
      "Market research",
      "Export financing",
      "Compliance management",
      "Export packaging",
      "International marketing",
      "Trade promotion"
    ]
  },
  {
    id: "growth",
    name: "Growth Services",
    description: "Business growth and expansion solutions",
    image: "attached_assets/generated_images/Growth_expansion_services_r4t6u867.png",
    tags: ["growth", "expansion", "development"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Market expansion strategies",
      "Growth consulting",
      "Scalability planning",
      "Investment facilitation",
      "Partnership development",
      "Innovation programs",
      "Digital transformation",
      "Performance optimization"
    ]
  },
  {
    id: "help-develop",
    name: "Development Services",
    description: "Infrastructure and capability development",
    image: "attached_assets/generated_images/Development_infrastructure_s5u7v978.png",
    tags: ["development", "infrastructure", "capability"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Infrastructure development",
      "Capability building",
      "Process improvement",
      "Technology implementation",
      "System integration",
      "Quality enhancement",
      "Operational excellence",
      "Continuous improvement"
    ]
  },
  {
    id: "investing",
    name: "Investment Services",
    description: "Logistics investment and financial advisory",
    image: "attached_assets/generated_images/Investment_financial_advisory_t6v8w089.png",
    tags: ["investment", "finance", "advisory"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Investment advisory",
      "Project financing",
      "Asset management",
      "Risk assessment",
      "ROI analysis",
      "Portfolio management",
      "Merger & acquisition support",
      "Financial planning"
    ]
  },
  {
    id: "knowledge",
    name: "Knowledge Services",
    description: "Industry knowledge and information management",
    image: "attached_assets/generated_images/Knowledge_information_management_u7w9x190.png",
    tags: ["knowledge", "information", "research"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Market research",
      "Industry analysis",
      "Knowledge management",
      "Best practices sharing",
      "Research publications",
      "Data analytics",
      "Trend analysis",
      "Competitive intelligence"
    ]
  },
  {
    id: "logistics-market",
    name: "Logistics Marketplace",
    description: "Digital marketplace for logistics services",
    image: "attached_assets/generated_images/Logistics_marketplace_platform_v8x0y201.png",
    tags: ["marketplace", "platform", "digital"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Service marketplace",
      "Rate comparison",
      "Instant booking",
      "Vendor management",
      "Service reviews",
      "Transaction management",
      "Payment processing",
      "Dispute resolution"
    ]
  },
  {
    id: "modernization",
    name: "Modernization Services",
    description: "Digital transformation and modernization solutions",
    image: "attached_assets/generated_images/Modernization_digital_transformation_w9y1z312.png",
    tags: ["modernization", "digital", "transformation"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Digital transformation",
      "System modernization",
      "Process automation",
      "Cloud migration",
      "IoT implementation",
      "AI/ML integration",
      "Legacy system upgrade",
      "Technology roadmap"
    ]
  },
  {
    id: "network",
    name: "Network Services",
    description: "Global logistics network access and management",
    image: "attached_assets/generated_images/Network_logistics_global_x0z2a423.png",
    tags: ["network", "global", "connectivity"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Global network access",
      "Partner connectivity",
      "Network optimization",
      "Route planning",
      "Hub management",
      "Network analytics",
      "Coverage expansion",
      "Interconnection services"
    ]
  },
  {
    id: "organizations",
    name: "Organization Services",
    description: "Organizational development and management",
    image: "attached_assets/generated_images/Organization_management_services_y1a3b534.png",
    tags: ["organization", "management", "development"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Organizational design",
      "Change management",
      "Process optimization",
      "Team development",
      "Performance management",
      "Culture transformation",
      "Leadership development",
      "Organizational effectiveness"
    ]
  },
  {
    id: "partnership",
    name: "Partnership Services",
    description: "Strategic partnership development and management",
    image: "attached_assets/generated_images/Partnership_strategic_alliance_z2b4c645.png",
    tags: ["partnership", "alliance", "collaboration"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Partnership development",
      "Alliance management",
      "Joint venture support",
      "Collaboration frameworks",
      "Partner onboarding",
      "Relationship management",
      "Partnership agreements",
      "Value creation strategies"
    ]
  },
  {
    id: "project",
    name: "Project Services",
    description: "Complex project logistics and management",
    image: "attached_assets/generated_images/Project_logistics_management_a3c5d756.png",
    tags: ["project", "management", "logistics"],
    businessTypes: ["construction", "energy", "manufacturing", "infrastructure"],
    cargoTypes: ["project-cargo", "oversized", "heavy-lift"],
    capabilities: [
      "Project cargo handling",
      "Project planning",
      "Risk management",
      "Multi-modal coordination",
      "Site logistics",
      "Project documentation",
      "Timeline management",
      "Budget control"
    ]
  },
  {
    id: "shopping",
    name: "Shopping Services",
    description: "Personal shopping and procurement services",
    image: "attached_assets/generated_images/Shopping_procurement_services_b4d6e867.png",
    tags: ["shopping", "procurement", "personal"],
    businessTypes: ["retail", "e-commerce", "personal"],
    cargoTypes: ["general", "fragile"],
    capabilities: [
      "Personal shopping",
      "Procurement services",
      "Product sourcing",
      "Price negotiation",
      "Quality inspection",
      "Consolidation services",
      "International shopping",
      "Delivery coordination"
    ]
  },
  {
    id: "trading",
    name: "Trading Services",
    description: "International trade facilitation and support",
    image: "attached_assets/generated_images/Trading_international_commerce_c5e7f978.png",
    tags: ["trading", "commerce", "international"],
    businessTypes: ["all"],
    cargoTypes: ["all"],
    capabilities: [
      "Trade facilitation",
      "Import/export support",
      "Trade finance",
      "Market access",
      "Trade documentation",
      "Commodity trading",
      "Trade compliance",
      "Market intelligence"
    ]
  }
];

// Utility function to find service by ID
export function getServiceById(serviceId: string) {
  return servicesData.find(service => service.id === serviceId);
}

// Get all available business types from services data
export function getAllBusinessTypes() {
  const businessTypesSet = new Set<string>();
  
  servicesData.forEach(service => {
    service.businessTypes.forEach(type => businessTypesSet.add(type));
  });
  
  return Array.from(businessTypesSet);
}

// Get all available cargo types from services data
export function getAllCargoTypes() {
  const cargoTypesSet = new Set<string>();
  
  servicesData.forEach(service => {
    service.cargoTypes.forEach(type => cargoTypesSet.add(type));
  });
  
  return Array.from(cargoTypesSet);
}