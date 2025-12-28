import { Router } from 'express';
import { z } from 'zod';
import { CarrierIntegrationFactory, RateComparisonService } from '../../services/carrier-integration-service';
import { validateRequest } from '../../middleware/validate';
import { logger } from '../../utils/logger';
import { isAuthenticated } from '../../core/auth/auth.service';

const router = Router();
const rateComparisonService = new RateComparisonService();

// Validation schemas
const shipmentDetailsSchema = z.object({
  origin: z.object({
    zipCode: z.string().min(5),
    country: z.string().min(2),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional()
  }),
  destination: z.object({
    zipCode: z.string().min(5),
    country: z.string().min(2),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional()
  }),
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  serviceType: z.enum(['standard', 'express', 'overnight']).optional(),
  insuranceValue: z.number().optional(),
  deliveryConfirmation: z.boolean().optional()
});

const trackingSchema = z.object({
  trackingNumber: z.string().min(10),
  carrier: z.string().min(3)
});

/**
 * Compare rates across multiple carriers
 */
router.post('/rates/compare', isAuthenticated, validateRequest({ body: shipmentDetailsSchema }), async (req, res) => {
  try {
    const shipmentDetails = req.body;
    const rates = await rateComparisonService.compareRates(shipmentDetails);
    
    res.json({
      success: true,
      rates,
      requestId: `rate_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Rate comparison failed:', error);
    res.status(500).json({
      success: false,
      error: 'Rate comparison service unavailable',
      message: 'Please try again later'
    });
  }
});

/**
 * Get rate from specific carrier
 */
router.post('/rates/:carrier', isAuthenticated, validateRequest({ body: shipmentDetailsSchema }), async (req, res) => {
  try {
    const { carrier } = req.params;
    const shipmentDetails = req.body;
    
    const integration = CarrierIntegrationFactory.create(carrier);
    const rate = await integration.getRate(shipmentDetails);
    
    res.json({
      success: true,
      rate,
      carrier,
      requestId: `rate_${carrier}_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Rate calculation failed for ${req.params.carrier}:`, error);
    res.status(500).json({
      success: false,
      error: `${req.params.carrier} rate service unavailable`,
      message: 'Please try again later'
    });
  }
});

/**
 * Track shipment
 */
router.get('/track/:carrier/:trackingNumber', isAuthenticated, async (req, res) => {
  try {
    const { carrier, trackingNumber } = req.params;
    
    const integration = CarrierIntegrationFactory.create(carrier);
    const trackingInfo = await integration.trackShipment(trackingNumber);
    
    res.json({
      success: true,
      tracking: trackingInfo,
      carrier,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Tracking failed for ${req.params.carrier}:`, error);
    res.status(404).json({
      success: false,
      error: 'Tracking information not found',
      message: 'Please verify the tracking number and carrier'
    });
  }
});

/**
 * Validate address
 */
router.post('/address/validate', isAuthenticated, async (req, res) => {
  try {
    const { address, carrier = 'fedex' } = req.body;
    
    const integration = CarrierIntegrationFactory.create(carrier);
    const isValid = await integration.validateAddress(address);
    
    res.json({
      success: true,
      valid: isValid,
      address,
      carrier,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Address validation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Address validation service unavailable',
      message: 'Please try again later'
    });
  }
});

/**
 * Get transit time estimate
 */
router.get('/transit-time/:carrier', isAuthenticated, async (req, res) => {
  try {
    const { carrier } = req.params;
    const { origin, destination, serviceType } = req.query;
    
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination are required'
      });
    }

    // Simplified transit time calculation
    const baseTransitDays = {
      'standard': 5,
      'express': 3,
      'overnight': 1
    };
    
    const days = baseTransitDays[serviceType as keyof typeof baseTransitDays] || 5;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + days);
    
    res.json({
      success: true,
      transitTime: `${days} business days`,
      estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
      carrier,
      serviceType
    });
  } catch (error) {
    logger.error('Transit time calculation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Transit time service unavailable'
    });
  }
});

/**
 * Get carrier availability for region
 */
router.get('/availability/:carrier', isAuthenticated, async (req, res) => {
  try {
    const { carrier } = req.params;
    const { zipCode, country } = req.query;
    
    // Simplified availability check
    const availability = {
      available: true,
      serviceTypes: ['standard', 'express', 'overnight'],
      restrictions: [],
      estimatedPickupTime: '1-2 business days'
    };
    
    res.json({
      success: true,
      carrier,
      location: { zipCode, country },
      availability,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Availability check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Availability service unavailable'
    });
  }
});

/**
 * Generate shipping label
 */
router.post('/labels/generate', isAuthenticated, validateRequest({ body: shipmentDetailsSchema }), async (req, res) => {
  try {
    const { carrier = 'fedex', ...shipmentDetails } = req.body;
    
    const integration = CarrierIntegrationFactory.create(carrier);
    const label = await integration.generateLabel(shipmentDetails);
    
    res.json({
      success: true,
      label,
      carrier,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Label generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Label generation service unavailable',
      message: 'This feature is currently in development'
    });
  }
});

/**
 * Bulk rate calculation
 */
router.post('/rates/bulk', isAuthenticated, async (req, res) => {
  try {
    const { shipments } = req.body;
    
    if (!Array.isArray(shipments) || shipments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shipments array'
      });
    }
    
    const results = await Promise.allSettled(
      shipments.map(async (shipment: any) => {
        try {
          const rates = await rateComparisonService.compareRates(shipment);
          return { shipment, rates, success: true };
        } catch (error) {
          return { shipment, error: 'Rate calculation failed', success: false };
        }
      })
    );
    
    const processedResults = results.map((result, index) => ({
      index,
      ...(result.status === 'fulfilled' ? result.value : { error: 'Processing failed', success: false })
    }));
    
    res.json({
      success: true,
      results: processedResults,
      total: shipments.length,
      successful: processedResults.filter(r => r.success).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Bulk rate calculation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Bulk rate service unavailable'
    });
  }
});

/**
 * Get supported carriers
 */
router.get('/carriers', isAuthenticated, (req, res) => {
  const carriers = CarrierIntegrationFactory.getSupportedCarriers();
  
  res.json({
    success: true,
    carriers: carriers.map(carrier => ({
      name: carrier,
      displayName: carrier.toUpperCase(),
      features: {
        rateCalculation: true,
        tracking: true,
        labelGeneration: carrier === 'fedex',
        addressValidation: true
      }
    })),
    timestamp: new Date().toISOString()
  });
});

export default router;