// Service Image Configuration
// Maps service IDs to their corresponding image assets from public/services/

// Base path for service images in the public directory
const SERVICE_IMAGE_BASE = '/services';

// Helper function to construct service image path
const getImagePath = (filename: string): string => `${SERVICE_IMAGE_BASE}/${filename}`;

// Default fallback image for services without specific images
const defaultServiceImage = getImagePath('warehousing.png');

export const serviceImages: Record<string, string> = {
  // Core Logistics Services (matching server/data/services-data.ts)
  container: getImagePath('container.png'),
  trucking: getImagePath('trucking.png'),
  airfreight: getImagePath('airfreight.png'),
  rail: getImagePath('rail.png'),
  warehousing: getImagePath('warehousing.png'),
  bulk: getImagePath('bulk.png'),
  'special-transport': getImagePath('special-transport.png'),
  customs: getImagePath('customs.png'),
  'drop-shipping': getImagePath('drop-shipping.png'),
  'port-services': getImagePath('port-services.png'),
  'supply-chain': getImagePath('supply-chain.png'),
  groupage: getImagePath('groupage.png'),
  finance: getImagePath('finance.png'),
  documentation: getImagePath('documentation.png'),
  consultation: getImagePath('consultation.png'),
  'online-shopping': getImagePath('online-shopping.png'),
  
  // Additional mappings for compatibility
  ocean: getImagePath('container.png'),
  road: getImagePath('trucking.png'),
  distribution: getImagePath('distribution.png'),
  certificates: getImagePath('certificates.png'),
  technology: getImagePath('supply-chain.png'),
  ecosystem: getImagePath('ecosystem.png'),
  modernization: getImagePath('modernization.png'),
  'help-develop': getImagePath('help-develop.png'),
  'e-commerce': getImagePath('online-shopping.png'),
  shopping: getImagePath('shopping.png'),
  insurance: getImagePath('finance.png'),
  investing: getImagePath('investing.png'),
  business: getImagePath('business.png'),
  companies: getImagePath('companies.png'),
  
  // Marketplace Services
  auction: getImagePath('auction.png'),
  'logistics-market': getImagePath('logistics-market.png'),
  trading: getImagePath('trading.png'),
  
  // Education & Training
  education: getImagePath('education.png'),
  knowledge: getImagePath('knowledge.png'),
  
  // Specialized Services
  project: getImagePath('project.png'),
  events: getImagePath('events.png'),
  
  // Network & Operations
  network: getImagePath('network.png'),
  tranship: getImagePath('tranship.png'),
  transit: getImagePath('transit.png'),
  
  // Partnership & Cooperation
  partnership: getImagePath('partnership.png'),
  cooperation: getImagePath('cooperation.png'),
  organizations: getImagePath('organizations.png'),
  
  // Maritime Services
  chartering: getImagePath('chartering.png'),
  shipping: getImagePath('shipping.png'),
  
  // Additional Services
  agency: getImagePath('agency.png'),
  'cross-staffing': getImagePath('cross-staffing.png'),
  export: getImagePath('export.png'),
  growth: getImagePath('growth.png'),
  post: getImagePath('post.png'),
  'third-party': getImagePath('third-party.png'),
  logistics: getImagePath('logistics.png'),
};

// Helper function to get service image with fallback
export const getServiceImage = (serviceId: string): string => {
  return serviceImages[serviceId] || defaultServiceImage;
};
