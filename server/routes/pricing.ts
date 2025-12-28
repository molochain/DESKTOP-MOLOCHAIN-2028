import { Router, Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { servicePricingTiers, ServicePricingTier } from '@shared/schema';
import { z } from 'zod';

const router = Router();

const calculatePriceSchema = z.object({
  serviceId: z.string(),
  tierId: z.number().optional(),
  quantity: z.number().positive().default(1),
  distance: z.number().nonnegative().optional().default(0),
  weight: z.number().nonnegative().optional().default(0),
  insurance: z.boolean().optional().default(false),
  expressDelivery: z.boolean().optional().default(false),
  specialHandling: z.boolean().optional().default(false),
});

type CalculatePriceRequest = z.infer<typeof calculatePriceSchema>;

interface PriceBreakdown {
  basePrice: number;
  quantity: number;
  quantityTotal: number;
  distanceFee: number;
  weightFee: number;
  insuranceFee: number;
  expressDeliveryFee: number;
  specialHandlingFee: number;
  setupFee: number;
  subtotal: number;
  discountAmount: number;
  discountDescription: string | null;
  total: number;
  currency: string;
}

router.get('/services/:id/pricing', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Service ID is required' 
      });
    }

    let pricingTiers: ServicePricingTier[] = [];
    
    try {
      pricingTiers = await db
        .select()
        .from(servicePricingTiers)
        .where(
          and(
            eq(servicePricingTiers.serviceId, id),
            eq(servicePricingTiers.isActive, true)
          )
        )
        .orderBy(servicePricingTiers.priority);
    } catch (dbError) {
      console.warn('Database query failed for pricing tiers, returning empty:', dbError);
      pricingTiers = [];
    }

    if (pricingTiers.length === 0) {
      return res.json({
        success: true,
        serviceId: id,
        tiers: [],
        count: 0,
        message: 'No pricing tiers configured for this service. Contact sales for a quote.'
      });
    }

    const now = new Date();
    const validTiers = pricingTiers.filter(tier => {
      const validFrom = tier.validFrom ? new Date(tier.validFrom) : null;
      const validUntil = tier.validUntil ? new Date(tier.validUntil) : null;
      
      if (validFrom && now < validFrom) return false;
      if (validUntil && now > validUntil) return false;
      return true;
    });

    return res.json({
      success: true,
      serviceId: id,
      tiers: validTiers,
      count: validTiers.length
    });
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pricing tiers' 
    });
  }
});

router.post('/services/calculate-price', async (req: Request, res: Response) => {
  try {
    const validation = calculatePriceSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body',
        details: validation.error.errors 
      });
    }

    const {
      serviceId,
      tierId,
      quantity,
      distance,
      weight,
      insurance,
      expressDelivery,
      specialHandling
    } = validation.data;

    let tier: ServicePricingTier | undefined;

    try {
      if (tierId) {
        const tiers = await db
          .select()
          .from(servicePricingTiers)
          .where(
            and(
              eq(servicePricingTiers.id, tierId),
              eq(servicePricingTiers.serviceId, serviceId),
              eq(servicePricingTiers.isActive, true)
            )
          )
          .limit(1);
        tier = tiers[0];
      } else {
        const tiers = await db
          .select()
          .from(servicePricingTiers)
          .where(
            and(
              eq(servicePricingTiers.serviceId, serviceId),
              eq(servicePricingTiers.isActive, true)
            )
          )
          .orderBy(servicePricingTiers.priority)
          .limit(1);
        tier = tiers[0];
      }
    } catch (dbError) {
      console.warn('Database query failed for pricing, using default pricing:', dbError);
      tier = undefined;
    }

    const DEFAULT_BASE_PRICE = 100;
    const RATE_PER_KM = 0.15;
    const RATE_PER_KG = 0.50;
    const INSURANCE_RATE = 0.02;
    const EXPRESS_MULTIPLIER = 1.5;
    const SPECIAL_HANDLING_FEE = 25;

    if (!tier) {
      const basePrice = DEFAULT_BASE_PRICE;
      const quantityTotal = basePrice * quantity;
      const distanceFee = distance ? distance * RATE_PER_KM : 0;
      const weightFee = weight ? weight * RATE_PER_KG : 0;
      const insuranceFee = insurance ? quantityTotal * INSURANCE_RATE : 0;
      const expressDeliveryFee = expressDelivery ? quantityTotal * (EXPRESS_MULTIPLIER - 1) : 0;
      const specialHandlingFee = specialHandling ? SPECIAL_HANDLING_FEE : 0;
      const total = quantityTotal + distanceFee + weightFee + insuranceFee + expressDeliveryFee + specialHandlingFee;

      return res.json({
        success: true,
        serviceId,
        basePrice,
        totalPrice: Math.round(total * 100) / 100,
        currency: 'USD',
        isEstimate: true,
        message: 'This is an estimate based on default pricing. Contact sales for accurate quotes.',
        breakdown: {
          base: quantityTotal,
          distance: distanceFee,
          weight: weightFee,
          insurance: insuranceFee,
          expressDelivery: expressDeliveryFee,
          specialHandling: specialHandlingFee
        }
      });
    }

    const now = new Date();
    const validFrom = tier.validFrom ? new Date(tier.validFrom) : null;
    const validUntil = tier.validUntil ? new Date(tier.validUntil) : null;
    
    if (validFrom && now < validFrom) {
      return res.status(400).json({ 
        success: false, 
        error: 'This pricing tier is not yet valid' 
      });
    }
    if (validUntil && now > validUntil) {
      return res.status(400).json({ 
        success: false, 
        error: 'This pricing tier has expired' 
      });
    }

    const limitations = tier.limitations as { maxQuantity?: number; maxWeight?: string; regions?: string[] } | null;
    if (limitations?.maxQuantity && quantity > limitations.maxQuantity) {
      return res.status(400).json({ 
        success: false, 
        error: `Quantity exceeds maximum allowed (${limitations.maxQuantity})` 
      });
    }

    const minOrder = tier.minOrder ? parseFloat(tier.minOrder) : 0;
    const maxOrder = tier.maxOrder ? parseFloat(tier.maxOrder) : Infinity;
    
    const basePrice = parseFloat(tier.basePrice);
    const setupFee = tier.setupFee ? parseFloat(tier.setupFee) : 0;
    const currency = tier.currency || 'USD';

    const quantityTotal = basePrice * quantity;
    const distanceFee = distance ? distance * RATE_PER_KM : 0;
    const weightFee = weight ? weight * RATE_PER_KG : 0;
    const insuranceFee = insurance ? quantityTotal * INSURANCE_RATE : 0;
    const expressDeliveryFee = expressDelivery ? quantityTotal * (EXPRESS_MULTIPLIER - 1) : 0;
    const specialHandlingFee = specialHandling ? SPECIAL_HANDLING_FEE : 0;

    const subtotal = quantityTotal + distanceFee + weightFee + insuranceFee + expressDeliveryFee + specialHandlingFee + setupFee;

    let discountAmount = 0;
    let discountDescription: string | null = null;

    const discounts = tier.discounts as { 
      volume?: { min: number; discount: number }[]; 
      seasonal?: { code: string; percent: number }[] 
    } | null;

    if (discounts?.volume && discounts.volume.length > 0) {
      const sortedVolumeDiscounts = [...discounts.volume].sort((a, b) => b.min - a.min);
      for (const volumeDiscount of sortedVolumeDiscounts) {
        if (quantity >= volumeDiscount.min) {
          discountAmount = subtotal * (volumeDiscount.discount / 100);
          discountDescription = `Volume discount (${volumeDiscount.discount}% off for ${volumeDiscount.min}+ units)`;
          break;
        }
      }
    }

    const total = subtotal - discountAmount;

    if (total < minOrder) {
      return res.status(400).json({ 
        success: false, 
        error: `Total is below minimum order value (${currency} ${minOrder.toFixed(2)})` 
      });
    }
    if (total > maxOrder && maxOrder !== Infinity) {
      return res.status(400).json({ 
        success: false, 
        error: `Total exceeds maximum order value (${currency} ${maxOrder.toFixed(2)})` 
      });
    }

    const breakdown: PriceBreakdown = {
      basePrice,
      quantity,
      quantityTotal: Math.round(quantityTotal * 100) / 100,
      distanceFee: Math.round(distanceFee * 100) / 100,
      weightFee: Math.round(weightFee * 100) / 100,
      insuranceFee: Math.round(insuranceFee * 100) / 100,
      expressDeliveryFee: Math.round(expressDeliveryFee * 100) / 100,
      specialHandlingFee: Math.round(specialHandlingFee * 100) / 100,
      setupFee: Math.round(setupFee * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      discountDescription,
      total: Math.round(total * 100) / 100,
      currency
    };

    return res.json({
      success: true,
      tier: {
        id: tier.id,
        name: tier.tierName,
        description: tier.description
      },
      breakdown,
      validUntil: tier.validUntil
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate price' 
    });
  }
});

export default router;
