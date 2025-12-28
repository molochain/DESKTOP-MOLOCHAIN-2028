-- CMS Services Import Script for Laravel CMS (molochain.com)
-- Generated: 2025-12-09
-- Run this on the cms.molochain.com database to import all 46 services

-- Clear existing services (optional - uncomment if needed)
-- TRUNCATE TABLE services RESTART IDENTITY CASCADE;

-- Insert all 46 services
INSERT INTO services (slug, name, short_description, category, hero_image_url, features, is_active, created_at, updated_at)
VALUES
-- Transport Services
('container', 'Container Services', 'Comprehensive container handling and management solutions', 'transport', 'https://molochain.com/attached_assets/generated_images/Container_services_terminal_operations_d7c60d46.png', '["Full container load (FCL)","Less than container load (LCL)","Container tracking"]', true, NOW(), NOW()),
('trucking', 'Trucking Services', 'Reliable road transportation solutions', 'transport', 'https://molochain.com/attached_assets/generated_images/Trucking_transportation_services_f12cdd8e.png', '["Full truckload (FTL)","Less than truckload (LTL)","Door-to-door delivery"]', true, NOW(), NOW()),
('airfreight', 'Air Freight Services', 'Fast and reliable worldwide air cargo transportation solutions', 'transport', 'https://molochain.com/attached_assets/generated_images/Air_freight_cargo_services_6e8765cf.png', '["Express air freight","Next-flight-out service","Charter solutions"]', true, NOW(), NOW()),
('rail', 'Rail Services', 'Efficient rail freight transportation solutions', 'transport', 'https://molochain.com/attached_assets/generated_images/Rail_freight_transportation_04f4bb43.png', '["Intermodal transport","Container rail freight","Bulk cargo rail transport"]', true, NOW(), NOW()),
('bulk', 'Bulk Services', 'Specialized bulk cargo handling solutions', 'transport', 'https://molochain.com/attached_assets/generated_images/Bulk_cargo_handling_5f23ab70.png', '["Dry bulk cargo handling","Liquid bulk transport","Specialized equipment"]', true, NOW(), NOW()),
('special-transport', 'Special Transportation', 'Specialized solutions for unique and challenging cargo', 'transport', 'https://molochain.com/attached_assets/generated_images/Special_transport_services_270c7efc.png', '["Heavy lift and project cargo","Oversized cargo transport","Temperature-controlled"]', true, NOW(), NOW()),
('groupage', 'Groupage Services', 'Consolidated shipping solutions', 'transport', 'https://molochain.com/attached_assets/generated_images/Groupage_consolidation_services_45501d59.png', '["Cargo consolidation","Cost-effective small shipments","Regular departure schedules"]', true, NOW(), NOW()),
('transit', 'Transit Services', 'Seamless transit and cross-border transportation solutions', 'transport', 'https://molochain.com/attached_assets/generated_images/Transit_transport_services_3a5d2c89.png', '["Cross-border transit management","Transit documentation","Bonded transport"]', true, NOW(), NOW()),
('tranship', 'Transhipment Services', 'Expert transhipment and cargo transfer solutions', 'transport', 'https://molochain.com/attached_assets/generated_images/Transhipment_cargo_transfer_d5b6e423.png', '["Transhipment hub operations","Cargo transfer coordination","Multi-vessel operations"]', true, NOW(), NOW()),
('chartering', 'Chartering Services', 'Vessel and aircraft chartering solutions', 'transport', 'https://molochain.com/attached_assets/generated_images/Chartering_vessel_aircraft_j6l8m089.png', '["Vessel chartering","Aircraft chartering","Charter party negotiations"]', true, NOW(), NOW()),

-- Warehousing & Logistics
('warehousing', 'Warehousing Services', 'State-of-the-art storage and inventory management', 'warehousing', 'https://molochain.com/attached_assets/generated_images/Warehousing_storage_services_4cac1c12.png', '["Climate-controlled facilities","Inventory management","Order fulfillment"]', true, NOW(), NOW()),
('supply-chain', 'Supply Chain Services', 'End-to-end supply chain management and optimization solutions', 'logistics', 'https://molochain.com/attached_assets/generated_images/Supply_chain_management_7023cdd8.png', '["Supply chain design","Demand forecasting","Inventory optimization"]', true, NOW(), NOW()),
('distribution', 'Distribution Services', 'Comprehensive distribution network management', 'logistics', 'https://molochain.com/attached_assets/generated_images/Distribution_network_services_m9o1p312.png', '["Distribution network design","Multi-channel distribution","Regional distribution centers"]', true, NOW(), NOW()),
('third-party', 'Third Party Logistics', 'Complete 3PL outsourcing solutions', 'logistics', 'https://molochain.com/attached_assets/generated_images/Third_party_logistics_e7f8d534.png', '["Complete logistics outsourcing","Inventory management","Order fulfillment"]', true, NOW(), NOW()),
('network', 'Network Services', 'Global logistics network access and management', 'logistics', 'https://molochain.com/attached_assets/generated_images/Network_logistics_global_x0z2a423.png', '["Global network access","Partner connectivity","Network optimization"]', true, NOW(), NOW()),
('project', 'Project Services', 'Complex project logistics and management', 'logistics', 'https://molochain.com/attached_assets/generated_images/Project_logistics_management_a3c5d756.png', '["Project cargo handling","Project planning","Risk management"]', true, NOW(), NOW()),

-- Customs & Documentation
('customs', 'Customs Clearance', 'Expert customs clearance and documentation services', 'customs', 'https://molochain.com/attached_assets/generated_images/Customs_clearance_services_616d889f.png', '["Import/export declarations","Customs documentation","Tariff classification"]', true, NOW(), NOW()),
('documentation', 'Documentation Services', 'Expert handling of all shipping and trade documentation', 'customs', 'https://molochain.com/attached_assets/generated_images/Documentation_management_services_1db92a96.png', '["Bill of lading preparation","Commercial invoice processing","Certificate of origin"]', true, NOW(), NOW()),
('certificates', 'Certificate Services', 'Professional certification and compliance management', 'customs', 'https://molochain.com/attached_assets/generated_images/Certificate_compliance_services_i5k7l978.png', '["Certificate of origin processing","Quality certificates","Compliance certifications"]', true, NOW(), NOW()),
('export', 'Export Services', 'Complete export management and facilitation', 'customs', 'https://molochain.com/attached_assets/generated_images/Export_management_services_q3s5t756.png', '["Export documentation","Export licensing","Market research"]', true, NOW(), NOW()),

-- Port & Agency
('port-services', 'Port Services', 'Comprehensive port operations and management solutions', 'port', 'https://molochain.com/attached_assets/generated_images/Port_operations_management_0da75b56.png', '["Vessel berthing management","Container terminal operations","Stevedoring services"]', true, NOW(), NOW()),
('agency', 'Agency Services', 'Comprehensive shipping agency and representation', 'agency', 'https://molochain.com/attached_assets/generated_images/Agency_services_representation_c9a4f312.png', '["Shipping agency representation","Port agency services","Vessel husbandry"]', true, NOW(), NOW()),

-- E-commerce
('drop-shipping', 'Drop Shipping Services', 'Seamless product fulfillment solutions for online retailers', 'ecommerce', 'https://molochain.com/attached_assets/generated_images/Drop_shipping_fulfillment_70aee1b8.png', '["Supplier network management","E-commerce integration","Automated order processing"]', true, NOW(), NOW()),
('online-shopping', 'Online Shopping Integration', 'Seamless e-commerce and logistics integration solutions', 'ecommerce', 'https://molochain.com/attached_assets/generated_images/E-commerce_integration_platform_72127fad.png', '["E-commerce platform integration","Order management","Inventory synchronization"]', true, NOW(), NOW()),
('shopping', 'Shopping Services', 'Personal shopping and procurement services', 'ecommerce', 'https://molochain.com/attached_assets/generated_images/Shopping_procurement_services_b4d6e867.png', '["Personal shopping","Procurement services","Product sourcing"]', true, NOW(), NOW()),

-- Finance
('finance', 'Finance Services', 'Comprehensive financial solutions for logistics operations', 'finance', 'https://molochain.com/attached_assets/generated_images/Financial_logistics_services_d88547dd.png', '["Trade finance solutions","Payment processing","Invoice factoring"]', true, NOW(), NOW()),
('investing', 'Investment Services', 'Logistics investment and financial advisory', 'finance', 'https://molochain.com/attached_assets/generated_images/Investment_financial_advisory_t6v8w089.png', '["Investment advisory","Project financing","Asset management"]', true, NOW(), NOW()),

-- Consulting
('consultation', 'Logistics Consultation', 'Expert consulting and optimization services', 'consulting', 'https://molochain.com/attached_assets/generated_images/Logistics_consulting_services_26087bd8.png', '["Supply chain assessment","Process improvement","Cost reduction strategies"]', true, NOW(), NOW()),
('business', 'Business Services', 'Comprehensive business support and development', 'consulting', 'https://molochain.com/attached_assets/generated_images/Business_services_support_h4j6k867.png', '["Business plan development","Market entry strategies","Partnership facilitation"]', true, NOW(), NOW()),
('growth', 'Growth Services', 'Business growth and expansion solutions', 'consulting', 'https://molochain.com/attached_assets/generated_images/Growth_expansion_services_r4t6u867.png', '["Market expansion strategies","Growth consulting","Scalability planning"]', true, NOW(), NOW()),
('help-develop', 'Development Services', 'Infrastructure and capability development', 'consulting', 'https://molochain.com/attached_assets/generated_images/Development_infrastructure_s5u7v978.png', '["Infrastructure development","Capability building","Process improvement"]', true, NOW(), NOW()),
('knowledge', 'Knowledge Services', 'Industry knowledge and information management', 'consulting', 'https://molochain.com/attached_assets/generated_images/Knowledge_information_management_u7w9x190.png', '["Market research","Industry analysis","Knowledge management"]', true, NOW(), NOW()),

-- Technology
('blockchain', 'Blockchain Solutions', 'Innovative blockchain-based logistics solutions', 'technology', 'https://molochain.com/attached_assets/generated_images/Blockchain_logistics_technology_g3h5i756.png', '["Smart contract implementation","Supply chain transparency","Document authentication"]', true, NOW(), NOW()),
('modernization', 'Modernization Services', 'Digital transformation and modernization solutions', 'technology', 'https://molochain.com/attached_assets/generated_images/Modernization_digital_transformation_w9y1z312.png', '["Digital transformation","System modernization","Process automation"]', true, NOW(), NOW()),

-- Marketplace
('auction', 'Auction Services', 'Logistics auction and bidding platform', 'marketplace', 'https://molochain.com/attached_assets/generated_images/Auction_bidding_platform_f2a3b645.png', '["Freight rate auctions","Service bidding platform","Reverse auction management"]', true, NOW(), NOW()),
('logistics-market', 'Logistics Marketplace', 'Digital marketplace for logistics services', 'marketplace', 'https://molochain.com/attached_assets/generated_images/Logistics_marketplace_platform_v8x0y201.png', '["Service marketplace","Rate comparison","Instant booking"]', true, NOW(), NOW()),

-- HR & Staffing
('cross-staffing', 'Cross Staffing Services', 'Professional logistics workforce solutions', 'hr', 'https://molochain.com/attached_assets/generated_images/Cross_staffing_workforce_b8f3e210.png', '["Temporary staff placement","Permanent recruitment","Skilled workforce training"]', true, NOW(), NOW()),

-- Postal
('post', 'Postal Services', 'International postal and parcel delivery solutions', 'postal', 'https://molochain.com/attached_assets/generated_images/Postal_service_facility_229acbae.png', '["International mail services","Express parcel delivery","Registered mail handling"]', true, NOW(), NOW()),

-- Corporate
('companies', 'Company Services', 'Corporate logistics and fleet management', 'corporate', 'https://molochain.com/attached_assets/generated_images/Company_fleet_management_k7m9n190.png', '["Corporate account management","Fleet management solutions","Dedicated logistics teams"]', true, NOW(), NOW()),
('organizations', 'Organization Services', 'Organizational development and management', 'corporate', 'https://molochain.com/attached_assets/generated_images/Organization_management_services_y1a3b534.png', '["Organizational design","Change management","Process optimization"]', true, NOW(), NOW()),

-- Partnership
('cooperation', 'Cooperation Services', 'International cooperation and joint ventures', 'partnership', 'https://molochain.com/attached_assets/generated_images/Cooperation_joint_ventures_l8n0o201.png', '["Joint venture facilitation","International partnerships","Cooperative agreements"]', true, NOW(), NOW()),
('partnership', 'Partnership Services', 'Strategic partnership development and management', 'partnership', 'https://molochain.com/attached_assets/generated_images/Partnership_strategic_alliance_z2b4c645.png', '["Partnership development","Alliance management","Joint venture support"]', true, NOW(), NOW()),

-- Platform
('ecosystem', 'Ecosystem Services', 'Integrated logistics ecosystem management', 'platform', 'https://molochain.com/attached_assets/generated_images/Ecosystem_logistics_platform_n0p2q423.png', '["Ecosystem integration","Platform connectivity","Partner network access"]', true, NOW(), NOW()),

-- Training
('education', 'Education Services', 'Professional logistics training and certification', 'training', 'https://molochain.com/attached_assets/generated_images/Education_training_logistics_o1q3r534.png', '["Professional training programs","Industry certifications","Online learning platforms"]', true, NOW(), NOW()),

-- Events
('events', 'Event Logistics', 'Specialized event and exhibition logistics', 'events', 'https://molochain.com/attached_assets/generated_images/Event_exhibition_logistics_p2r4s645.png', '["Exhibition logistics","Trade show management","Event cargo handling"]', true, NOW(), NOW()),

-- Trading
('trading', 'Trading Services', 'International trade facilitation and support', 'trading', 'https://molochain.com/attached_assets/generated_images/Trading_international_commerce_c5e7f978.png', '["Trade facilitation","Import/export support","Trade finance"]', true, NOW(), NOW())

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  category = EXCLUDED.category,
  hero_image_url = EXCLUDED.hero_image_url,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify import
SELECT COUNT(*) as total_services FROM services;
