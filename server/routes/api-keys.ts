import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated, isAdmin } from '../core/auth/auth.service';
import { apiCache } from '../utils/cache-manager';
import { logger } from '../utils/logger';

const router = Router();

// In-memory storage for API keys (in production, these should be in a secure database)
let apiKeys = {
  openai: {
    id: 'openai',
    name: 'OpenAI API Key',
    service: 'openai',
    key: process.env.OPENAI_API_KEY || '',
    isActive: !!process.env.OPENAI_API_KEY,
    description: 'Required for AI-powered features including chat assistants, content generation, and analytics',
    required: true,
    lastUsed: null as string | null,
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe Secret Key',
    service: 'stripe',
    key: process.env.STRIPE_SECRET_KEY || '',
    isActive: !!process.env.STRIPE_SECRET_KEY,
    description: 'Required for payment processing, subscriptions, and billing management',
    required: true,
    lastUsed: null as string | null,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram Access Token',
    service: 'instagram',
    key: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    isActive: !!process.env.INSTAGRAM_ACCESS_TOKEN,
    description: 'Required for Instagram marketing features and social media integration',
    required: false,
    lastUsed: null as string | null,
  },
  'google-maps': {
    id: 'google-maps',
    name: 'Google Maps API Key',
    service: 'google-maps',
    key: process.env.GOOGLE_MAPS_API_KEY || '',
    isActive: !!process.env.GOOGLE_MAPS_API_KEY,
    description: 'Required for location services, route optimization, and mapping features',
    required: false,
    lastUsed: null as string | null,
  },
};

// Feature flags
let features = {
  openAI: !!process.env.OPENAI_API_KEY,
  stripe: !!process.env.STRIPE_SECRET_KEY,
  instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
  googleMaps: !!process.env.GOOGLE_MAPS_API_KEY,
};

// Performance metrics
const getPerformanceMetrics = () => {
  const cacheStats = apiCache.getStats();
  return {
    cacheEnabled: true,
    cacheHitRate: cacheStats.hitRate,
    optimizationLevel: 'standard',
  };
};

// Validation schemas
const updateApiKeySchema = z.object({
  key: z.string().min(1),
});

const updateFeatureSchema = z.object({
  feature: z.string(),
  enabled: z.boolean(),
});

// Get all settings
router.get('/', isAuthenticated, (_req, res) => {
  try {
    // Mask API keys for security
    const maskedApiKeys = Object.values(apiKeys).map(apiKey => ({
      ...apiKey,
      key: apiKey.key ? maskApiKey(apiKey.key) : '',
    }));

    const settings = {
      apiKeys: maskedApiKeys,
      features,
      performance: getPerformanceMetrics(),
    };

    res.json(settings);
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update API key
router.patch('/api-keys/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validation = updateApiKeySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { key } = validation.data;

    if (!apiKeys[id as keyof typeof apiKeys]) {
      return res.status(404).json({ error: 'API key configuration not found' });
    }

    // Update the API key
    apiKeys[id as keyof typeof apiKeys] = {
      ...apiKeys[id as keyof typeof apiKeys],
      key,
      isActive: !!key,
      lastUsed: new Date().toISOString(),
    };

    // Update corresponding feature flag
    if (id === 'openai') {
      features.openAI = !!key;
      process.env.OPENAI_API_KEY = key;
    } else if (id === 'stripe') {
      features.stripe = !!key;
      process.env.STRIPE_SECRET_KEY = key;
    } else if (id === 'instagram') {
      features.instagram = !!key;
      process.env.INSTAGRAM_ACCESS_TOKEN = key;
    } else if (id === 'google-maps') {
      features.googleMaps = !!key;
      process.env.GOOGLE_MAPS_API_KEY = key;
    }

    // Clear relevant caches
    apiCache.invalidatePattern('settings');
    
    logger.info(`API key updated for service: ${id}`);
    res.json({ success: true, message: 'API key updated successfully' });
  } catch (error) {
    logger.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// Toggle feature
router.patch('/features', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const validation = updateFeatureSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { feature, enabled } = validation.data;

    if (!(feature in features)) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    features[feature as keyof typeof features] = enabled;

    // Clear relevant caches
    apiCache.invalidatePattern('settings');
    
    logger.info(`Feature toggled: ${feature} = ${enabled}`);
    res.json({ success: true, message: 'Feature updated successfully' });
  } catch (error) {
    logger.error('Error toggling feature:', error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

// Test API key
router.post('/api-keys/:id/test', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!apiKeys[id as keyof typeof apiKeys]) {
      return res.status(404).json({ error: 'API key configuration not found' });
    }

    const apiKey = apiKeys[id as keyof typeof apiKeys];
    
    if (!apiKey.key) {
      return res.status(400).json({ error: 'API key not configured' });
    }

    // Test the API key based on service
    let testResult = { success: false, message: '' };

    switch (id) {
      case 'openai':
        // Test OpenAI API key
        try {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${apiKey.key}`,
            },
          });
          testResult.success = response.ok;
          testResult.message = response.ok ? 'OpenAI API key is valid' : 'Invalid OpenAI API key';
        } catch (error) {
          testResult.message = 'Failed to connect to OpenAI';
        }
        break;

      case 'stripe':
        // Test Stripe API key
        try {
          const response = await fetch('https://api.stripe.com/v1/charges', {
            headers: {
              'Authorization': `Bearer ${apiKey.key}`,
            },
          });
          // Stripe returns 200 even for invalid keys, check for specific error
          testResult.success = response.status !== 401;
          testResult.message = testResult.success ? 'Stripe API key is valid' : 'Invalid Stripe API key';
        } catch (error) {
          testResult.message = 'Failed to connect to Stripe';
        }
        break;

      default:
        testResult.success = true;
        testResult.message = 'API key stored successfully';
    }

    if (testResult.success) {
      apiKeys[id as keyof typeof apiKeys].lastUsed = new Date().toISOString();
    }

    res.json(testResult);
  } catch (error) {
    logger.error('Error testing API key:', error);
    res.status(500).json({ error: 'Failed to test API key' });
  }
});

// Helper function to mask API keys
function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
}

// Export the API keys for use in other modules
export function getApiKey(service: string): string | undefined {
  const apiKey = apiKeys[service as keyof typeof apiKeys];
  return apiKey?.key || undefined;
}

// Export feature flags
export function isFeatureEnabled(feature: string): boolean {
  return features[feature as keyof typeof features] || false;
}

export default router;