import { Router } from 'express';
import { logger } from '../../utils/logger';

const router = Router();

// Cached services data to avoid database timeout issues - includes all 46 services
const cachedServices = [
  {
    id: 'container',
    title: 'Container Services',
    description: 'Comprehensive container handling and management solutions',
    imageUrl: 'attached_assets/generated_images/Container_services_terminal_operations_d7c60d46.png',
    features: ['Full container load (FCL)', 'Less than container load (LCL)', 'Container tracking'],
    isActive: true
  },
  {
    id: 'trucking',
    title: 'Trucking Services',
    description: 'Reliable road transportation solutions',
    imageUrl: 'attached_assets/generated_images/Trucking_transportation_services_f12cdd8e.png',
    features: ['Full truckload (FTL)', 'Less than truckload (LTL)', 'Door-to-door delivery'],
    isActive: true
  },
  {
    id: 'airfreight',
    title: 'Air Freight Services',
    description: 'Fast and reliable worldwide air cargo transportation solutions',
    imageUrl: 'attached_assets/generated_images/Air_freight_cargo_services_6e8765cf.png',
    features: ['Express air freight', 'Next-flight-out service', 'Charter solutions'],
    isActive: true
  },
  {
    id: 'rail',
    title: 'Rail Services',
    description: 'Efficient rail freight transportation solutions',
    imageUrl: 'attached_assets/generated_images/Rail_freight_transportation_04f4bb43.png',
    features: ['Intermodal transport', 'Container rail freight', 'Bulk cargo rail transport'],
    isActive: true
  },
  {
    id: 'warehousing',
    title: 'Warehousing Services',
    description: 'State-of-the-art storage and inventory management',
    imageUrl: 'attached_assets/generated_images/Warehousing_storage_services_4cac1c12.png',
    features: ['Climate-controlled facilities', 'Inventory management', 'Order fulfillment'],
    isActive: true
  },
  {
    id: 'bulk',
    title: 'Bulk Services',
    description: 'Specialized bulk cargo handling solutions',
    imageUrl: 'attached_assets/generated_images/Bulk_cargo_handling_5f23ab70.png',
    features: ['Dry bulk cargo handling', 'Liquid bulk transport', 'Specialized equipment'],
    isActive: true
  },
  {
    id: 'special-transport',
    title: 'Special Transportation',
    description: 'Specialized solutions for unique and challenging cargo',
    imageUrl: 'attached_assets/generated_images/Special_transport_services_270c7efc.png',
    features: ['Heavy lift and project cargo', 'Oversized cargo transport', 'Temperature-controlled'],
    isActive: true
  },
  {
    id: 'customs',
    title: 'Customs Clearance',
    description: 'Expert customs clearance and documentation services',
    imageUrl: 'attached_assets/generated_images/Customs_clearance_services_616d889f.png',
    features: ['Import/export declarations', 'Customs documentation', 'Tariff classification'],
    isActive: true
  },
  {
    id: 'drop-shipping',
    title: 'Drop Shipping Services',
    description: 'Seamless product fulfillment solutions for online retailers',
    imageUrl: 'attached_assets/generated_images/Drop_shipping_fulfillment_70aee1b8.png',
    features: ['Supplier network management', 'E-commerce integration', 'Automated order processing'],
    isActive: true
  },
  {
    id: 'port-services',
    title: 'Port Services',
    description: 'Comprehensive port operations and management solutions',
    imageUrl: 'attached_assets/generated_images/Port_operations_management_0da75b56.png',
    features: ['Vessel berthing management', 'Container terminal operations', 'Stevedoring services'],
    isActive: true
  },
  {
    id: 'supply-chain',
    title: 'Supply Chain Services',
    description: 'End-to-end supply chain management and optimization solutions',
    imageUrl: 'attached_assets/generated_images/Supply_chain_management_7023cdd8.png',
    features: ['Supply chain design', 'Demand forecasting', 'Inventory optimization'],
    isActive: true
  },
  {
    id: 'groupage',
    title: 'Groupage Services',
    description: 'Consolidated shipping solutions',
    imageUrl: 'attached_assets/generated_images/Groupage_consolidation_services_45501d59.png',
    features: ['Cargo consolidation', 'Cost-effective small shipments', 'Regular departure schedules'],
    isActive: true
  },
  {
    id: 'finance',
    title: 'Finance Services',
    description: 'Comprehensive financial solutions for logistics operations',
    imageUrl: 'attached_assets/generated_images/Financial_logistics_services_d88547dd.png',
    features: ['Trade finance solutions', 'Payment processing', 'Invoice factoring'],
    isActive: true
  },
  {
    id: 'documentation',
    title: 'Documentation Services',
    description: 'Expert handling of all shipping and trade documentation',
    imageUrl: 'attached_assets/generated_images/Documentation_management_services_1db92a96.png',
    features: ['Bill of lading preparation', 'Commercial invoice processing', 'Certificate of origin'],
    isActive: true
  },
  {
    id: 'consultation',
    title: 'Logistics Consultation',
    description: 'Expert consulting and optimization services',
    imageUrl: 'attached_assets/generated_images/Logistics_consulting_services_26087bd8.png',
    features: ['Supply chain assessment', 'Process improvement', 'Cost reduction strategies'],
    isActive: true
  },
  {
    id: 'online-shopping',
    title: 'Online Shopping Integration',
    description: 'Seamless e-commerce and logistics integration solutions',
    imageUrl: 'attached_assets/generated_images/E-commerce_integration_platform_72127fad.png',
    features: ['E-commerce platform integration', 'Order management', 'Inventory synchronization'],
    isActive: true
  },
  {
    id: 'transit',
    title: 'Transit Services',
    description: 'Seamless transit and cross-border transportation solutions',
    imageUrl: 'attached_assets/generated_images/Transit_transport_services_3a5d2c89.png',
    features: ['Cross-border transit management', 'Transit documentation', 'Bonded transport'],
    isActive: true
  },
  {
    id: 'cross-staffing',
    title: 'Cross Staffing Services',
    description: 'Professional logistics workforce solutions',
    imageUrl: 'attached_assets/generated_images/Cross_staffing_workforce_b8f3e210.png',
    features: ['Temporary staff placement', 'Permanent recruitment', 'Skilled workforce training'],
    isActive: true
  },
  {
    id: 'agency',
    title: 'Agency Services',
    description: 'Comprehensive shipping agency and representation',
    imageUrl: 'attached_assets/generated_images/Agency_services_representation_c9a4f312.png',
    features: ['Shipping agency representation', 'Port agency services', 'Vessel husbandry'],
    isActive: true
  },
  {
    id: 'tranship',
    title: 'Transhipment Services',
    description: 'Expert transhipment and cargo transfer solutions',
    imageUrl: 'attached_assets/generated_images/Transhipment_cargo_transfer_d5b6e423.png',
    features: ['Transhipment hub operations', 'Cargo transfer coordination', 'Multi-vessel operations'],
    isActive: true
  },
  {
    id: 'post',
    title: 'Postal Services',
    description: 'International postal and parcel delivery solutions',
    imageUrl: 'attached_assets/generated_images/Postal_service_facility_229acbae.png',
    features: ['International mail services', 'Express parcel delivery', 'Registered mail handling'],
    isActive: true
  },
  {
    id: 'third-party',
    title: 'Third Party Logistics',
    description: 'Complete 3PL outsourcing solutions',
    imageUrl: 'attached_assets/generated_images/Third_party_logistics_e7f8d534.png',
    features: ['Complete logistics outsourcing', 'Inventory management', 'Order fulfillment'],
    isActive: true
  },
  {
    id: 'auction',
    title: 'Auction Services',
    description: 'Logistics auction and bidding platform',
    imageUrl: 'attached_assets/generated_images/Auction_bidding_platform_f2a3b645.png',
    features: ['Freight rate auctions', 'Service bidding platform', 'Reverse auction management'],
    isActive: true
  },
  {
    id: 'blockchain',
    title: 'Blockchain Solutions',
    description: 'Innovative blockchain-based logistics solutions',
    imageUrl: 'attached_assets/generated_images/Blockchain_logistics_technology_g3h5i756.png',
    features: ['Smart contract implementation', 'Supply chain transparency', 'Document authentication'],
    isActive: true
  },
  {
    id: 'business',
    title: 'Business Services',
    description: 'Comprehensive business support and development',
    imageUrl: 'attached_assets/generated_images/Business_services_support_h4j6k867.png',
    features: ['Business plan development', 'Market entry strategies', 'Partnership facilitation'],
    isActive: true
  },
  {
    id: 'certificates',
    title: 'Certificate Services',
    description: 'Professional certification and compliance management',
    imageUrl: 'attached_assets/generated_images/Certificate_compliance_services_i5k7l978.png',
    features: ['Certificate of origin processing', 'Quality certificates', 'Compliance certifications'],
    isActive: true
  },
  {
    id: 'chartering',
    title: 'Chartering Services',
    description: 'Vessel and aircraft chartering solutions',
    imageUrl: 'attached_assets/generated_images/Chartering_vessel_aircraft_j6l8m089.png',
    features: ['Vessel chartering', 'Aircraft chartering', 'Charter party negotiations'],
    isActive: true
  },
  {
    id: 'companies',
    title: 'Company Services',
    description: 'Corporate logistics and fleet management',
    imageUrl: 'attached_assets/generated_images/Company_fleet_management_k7m9n190.png',
    features: ['Corporate account management', 'Fleet management solutions', 'Dedicated logistics teams'],
    isActive: true
  },
  {
    id: 'cooperation',
    title: 'Cooperation Services',
    description: 'International cooperation and joint ventures',
    imageUrl: 'attached_assets/generated_images/Cooperation_joint_ventures_l8n0o201.png',
    features: ['Joint venture facilitation', 'International partnerships', 'Cooperative agreements'],
    isActive: true
  },
  {
    id: 'distribution',
    title: 'Distribution Services',
    description: 'Comprehensive distribution network management',
    imageUrl: 'attached_assets/generated_images/Distribution_network_services_m9o1p312.png',
    features: ['Distribution network design', 'Multi-channel distribution', 'Regional distribution centers'],
    isActive: true
  },
  {
    id: 'ecosystem',
    title: 'Ecosystem Services',
    description: 'Integrated logistics ecosystem management',
    imageUrl: 'attached_assets/generated_images/Ecosystem_logistics_platform_n0p2q423.png',
    features: ['Ecosystem integration', 'Platform connectivity', 'Partner network access'],
    isActive: true
  },
  {
    id: 'education',
    title: 'Education Services',
    description: 'Professional logistics training and certification',
    imageUrl: 'attached_assets/generated_images/Education_training_logistics_o1q3r534.png',
    features: ['Professional training programs', 'Industry certifications', 'Online learning platforms'],
    isActive: true
  },
  {
    id: 'events',
    title: 'Event Logistics',
    description: 'Specialized event and exhibition logistics',
    imageUrl: 'attached_assets/generated_images/Event_exhibition_logistics_p2r4s645.png',
    features: ['Exhibition logistics', 'Trade show management', 'Event cargo handling'],
    isActive: true
  },
  {
    id: 'export',
    title: 'Export Services',
    description: 'Complete export management and facilitation',
    imageUrl: 'attached_assets/generated_images/Export_management_services_q3s5t756.png',
    features: ['Export documentation', 'Export licensing', 'Market research'],
    isActive: true
  },
  {
    id: 'growth',
    title: 'Growth Services',
    description: 'Business growth and expansion solutions',
    imageUrl: 'attached_assets/generated_images/Growth_expansion_services_r4t6u867.png',
    features: ['Market expansion strategies', 'Growth consulting', 'Scalability planning'],
    isActive: true
  },
  {
    id: 'help-develop',
    title: 'Development Services',
    description: 'Infrastructure and capability development',
    imageUrl: 'attached_assets/generated_images/Development_infrastructure_s5u7v978.png',
    features: ['Infrastructure development', 'Capability building', 'Process improvement'],
    isActive: true
  },
  {
    id: 'investing',
    title: 'Investment Services',
    description: 'Logistics investment and financial advisory',
    imageUrl: 'attached_assets/generated_images/Investment_financial_advisory_t6v8w089.png',
    features: ['Investment advisory', 'Project financing', 'Asset management'],
    isActive: true
  },
  {
    id: 'knowledge',
    title: 'Knowledge Services',
    description: 'Industry knowledge and information management',
    imageUrl: 'attached_assets/generated_images/Knowledge_information_management_u7w9x190.png',
    features: ['Market research', 'Industry analysis', 'Knowledge management'],
    isActive: true
  },
  {
    id: 'logistics-market',
    title: 'Logistics Marketplace',
    description: 'Digital marketplace for logistics services',
    imageUrl: 'attached_assets/generated_images/Logistics_marketplace_platform_v8x0y201.png',
    features: ['Service marketplace', 'Rate comparison', 'Instant booking'],
    isActive: true
  },
  {
    id: 'modernization',
    title: 'Modernization Services',
    description: 'Digital transformation and modernization solutions',
    imageUrl: 'attached_assets/generated_images/Modernization_digital_transformation_w9y1z312.png',
    features: ['Digital transformation', 'System modernization', 'Process automation'],
    isActive: true
  },
  {
    id: 'network',
    title: 'Network Services',
    description: 'Global logistics network access and management',
    imageUrl: 'attached_assets/generated_images/Network_logistics_global_x0z2a423.png',
    features: ['Global network access', 'Partner connectivity', 'Network optimization'],
    isActive: true
  },
  {
    id: 'organizations',
    title: 'Organization Services',
    description: 'Organizational development and management',
    imageUrl: 'attached_assets/generated_images/Organization_management_services_y1a3b534.png',
    features: ['Organizational design', 'Change management', 'Process optimization'],
    isActive: true
  },
  {
    id: 'partnership',
    title: 'Partnership Services',
    description: 'Strategic partnership development and management',
    imageUrl: 'attached_assets/generated_images/Partnership_strategic_alliance_z2b4c645.png',
    features: ['Partnership development', 'Alliance management', 'Joint venture support'],
    isActive: true
  },
  {
    id: 'project',
    title: 'Project Services',
    description: 'Complex project logistics and management',
    imageUrl: 'attached_assets/generated_images/Project_logistics_management_a3c5d756.png',
    features: ['Project cargo handling', 'Project planning', 'Risk management'],
    isActive: true
  },
  {
    id: 'shopping',
    title: 'Shopping Services',
    description: 'Personal shopping and procurement services',
    imageUrl: 'attached_assets/generated_images/Shopping_procurement_services_b4d6e867.png',
    features: ['Personal shopping', 'Procurement services', 'Product sourcing'],
    isActive: true
  },
  {
    id: 'trading',
    title: 'Trading Services',
    description: 'International trade facilitation and support',
    imageUrl: 'attached_assets/generated_images/Trading_international_commerce_c5e7f978.png',
    features: ['Trade facilitation', 'Import/export support', 'Trade finance'],
    isActive: true
  }
];

// Cached services endpoint that returns immediately
router.get('/services', async (req, res) => {
  logger.info('Cached services endpoint called - returning 46 services');
  
  res.json({
    success: true,
    data: cachedServices,
    count: cachedServices.length
  });
});

// Get single service by ID
router.get('/services/:id', async (req, res) => {
  const service = cachedServices.find(s => s.id === req.params.id);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      error: 'Service not found'
    });
  }
  
  res.json({
    success: true,
    data: service
  });
});

export default router;