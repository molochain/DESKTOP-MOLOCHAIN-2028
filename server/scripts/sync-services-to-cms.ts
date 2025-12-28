import axios from 'axios';

const CMS_BASE_URL = process.env.LARAVEL_CMS_URL || 'https://cms.molochain.com/api';
const LOCAL_API_URL = 'http://localhost:5000/api';

interface LocalService {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  features?: string[];
  isActive?: boolean;
}

interface CMSService {
  slug: string;
  name: string;
  short_description: string;
  category: string;
  hero_image_url: string;
  features?: string[];
  is_active: boolean;
}

function deriveCategory(serviceId: string): string {
  const categoryMap: Record<string, string> = {
    'container': 'transport',
    'trucking': 'transport',
    'airfreight': 'transport',
    'rail': 'transport',
    'warehousing': 'warehousing',
    'bulk': 'transport',
    'special-transport': 'transport',
    'customs': 'customs',
    'drop-shipping': 'ecommerce',
    'port-services': 'port',
    'supply-chain': 'logistics',
    'groupage': 'transport',
    'finance': 'finance',
    'documentation': 'customs',
    'consultation': 'consulting',
    'online-shopping': 'ecommerce',
    'transit': 'transport',
    'cross-staffing': 'hr',
    'agency': 'agency',
    'tranship': 'transport',
    'post': 'postal',
    'third-party': 'logistics',
    'auction': 'marketplace',
    'blockchain': 'technology',
    'business': 'consulting',
    'certificates': 'customs',
    'chartering': 'transport',
    'companies': 'corporate',
    'cooperation': 'partnership',
    'distribution': 'logistics',
    'ecosystem': 'platform',
    'education': 'training',
    'events': 'events',
    'export': 'customs',
    'growth': 'consulting',
    'help-develop': 'consulting',
    'investing': 'finance',
    'knowledge': 'consulting',
    'logistics-market': 'marketplace',
    'modernization': 'technology',
    'network': 'logistics',
    'organizations': 'corporate',
    'partnership': 'partnership',
    'project': 'logistics',
    'shopping': 'ecommerce',
    'trading': 'trading',
  };
  return categoryMap[serviceId] || 'general';
}

function transformToCMSFormat(service: LocalService): CMSService {
  const baseUrl = 'https://molochain.com';
  let heroImageUrl = service.imageUrl || '';
  
  if (heroImageUrl && !heroImageUrl.startsWith('http')) {
    heroImageUrl = `${baseUrl}/${heroImageUrl}`;
  }
  
  return {
    slug: service.id,
    name: service.title,
    short_description: service.description,
    category: deriveCategory(service.id),
    hero_image_url: heroImageUrl,
    features: service.features,
    is_active: service.isActive !== false,
  };
}

async function fetchLocalServices(): Promise<LocalService[]> {
  try {
    const response = await axios.get(`${LOCAL_API_URL}/services`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Failed to fetch local services:', error);
    throw error;
  }
}

async function fetchCMSServices(): Promise<{ slug: string }[]> {
  try {
    const response = await axios.get(`${CMS_BASE_URL}/services`);
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch CMS services:', error);
    return [];
  }
}

async function syncServiceToCMS(service: CMSService): Promise<boolean> {
  try {
    const response = await axios.post(`${CMS_BASE_URL}/services`, service, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });
    console.log(`✅ Synced: ${service.name} (${service.slug})`);
    return true;
  } catch (error: any) {
    if (error.response?.status === 409 || error.response?.data?.error?.includes('duplicate')) {
      console.log(`⏭️  Already exists: ${service.name} (${service.slug})`);
      return true;
    }
    console.error(`❌ Failed to sync ${service.slug}:`, error.response?.data || error.message);
    return false;
  }
}

async function syncAllServices(): Promise<void> {
  console.log('🚀 Starting CMS Services Sync...\n');
  console.log(`📍 CMS URL: ${CMS_BASE_URL}`);
  console.log(`📍 Local API: ${LOCAL_API_URL}\n`);

  const localServices = await fetchLocalServices();
  console.log(`📦 Found ${localServices.length} local services\n`);

  const existingCMS = await fetchCMSServices();
  const existingSlugs = new Set(existingCMS.map(s => s.slug));
  console.log(`📋 CMS already has ${existingCMS.length} services\n`);

  const servicesToSync = localServices.filter(s => !existingSlugs.has(s.id));
  console.log(`🔄 Services to sync: ${servicesToSync.length}\n`);

  if (servicesToSync.length === 0) {
    console.log('✅ All services already synced to CMS!');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const service of servicesToSync) {
    const cmsService = transformToCMSFormat(service);
    const success = await syncServiceToCMS(cmsService);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Sync Summary:');
  console.log(`   ✅ Successfully synced: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Total in CMS: ${existingCMS.length + successCount}`);
}

async function generateCMSPayload(): Promise<void> {
  console.log('📝 Generating CMS payload for manual import...\n');

  const localServices = await fetchLocalServices();
  const cmsServices = localServices.map(transformToCMSFormat);

  console.log('='.repeat(60));
  console.log('CMS Services Payload (JSON):');
  console.log('='.repeat(60));
  console.log(JSON.stringify(cmsServices, null, 2));
  console.log('='.repeat(60));
  console.log(`\n📦 Total services: ${cmsServices.length}`);
}

const command = process.argv[2];

if (command === '--generate') {
  generateCMSPayload().catch(console.error);
} else {
  syncAllServices().catch(console.error);
}
