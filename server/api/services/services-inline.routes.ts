import { Router } from 'express';
import { demoServicesData, demoServicesMap } from '../../data/demo-services-data';
import { productTypesData } from '../../data/product-types-data';
import { cacheMiddleware } from '../../middleware/cache';
import { logger } from '../../utils/logger';
import { db } from '../../db';
import { shipments } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 5 * 60,
  LONG: 30 * 60,
  VERY_LONG: 24 * 60 * 60,
};

router.get(
  "/services",
  cacheMiddleware({ type: "service", ttl: CACHE_TTL.MEDIUM }),
  (_req, res) => {
    try {
      if (!demoServicesData || !Array.isArray(demoServicesData)) {
        logger.warn("demoServicesData unavailable, returning empty array");
        return res.json([]);
      }
      res.json(demoServicesData);
    } catch (error) {
      logger.error("Error providing services data:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  },
);

router.get(
  "/services/:id",
  cacheMiddleware({
    type: "service",
    keyParam: "id",
    ttl: CACHE_TTL.MEDIUM,
  }),
  (req, res) => {
    try {
      if (!demoServicesMap || typeof demoServicesMap !== 'object') {
        logger.warn("demoServicesMap unavailable");
        return res.status(404).json({ message: "Service not found" });
      }
      
      const service = demoServicesMap[req.params.id];

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      logger.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  },
);

router.get(
  "/services/:id/availability/:regionCode",
  cacheMiddleware({
    type: "service",
    keyParam: "id",
    ttl: CACHE_TTL.SHORT,
  }),
  (req, res) => {
    try {
      const { id, regionCode } = req.params;

      const availabilityData = {
        available: true,
        restrictions: {
          max_weight: 25000,
          dangerous_goods: id.includes("air") ? false : true,
          min_volume: id.includes("lcl") ? 1 : 10,
          hazmat_certified: id.includes("air") || id.includes("rail"),
        },
        leadTime: id.includes("air") ? 24 : id.includes("ocean") ? 168 : 96,
        region: {
          name:
            regionCode === "EASIA"
              ? "East Asia"
              : regionCode === "SEASIA"
                ? "Southeast Asia"
                : regionCode === "EUR"
                  ? "Europe"
                  : regionCode === "NAM"
                    ? "North America"
                    : "Unknown Region",
          code: regionCode,
          timezone:
            regionCode === "EASIA"
              ? "Asia/Shanghai"
              : regionCode === "SEASIA"
                ? "Asia/Singapore"
                : regionCode === "EUR"
                  ? "Europe/Berlin"
                  : regionCode === "NAM"
                    ? "America/New_York"
                    : "UTC",
        },
      };

      res.json(availabilityData);
    } catch (error) {
      logger.error("Error checking service availability:", error);
      res
        .status(500)
        .json({ message: "Failed to check service availability" });
    }
  },
);

router.get(
  "/regions",
  cacheMiddleware({ type: "region", ttl: CACHE_TTL.VERY_LONG }),
  (_req, res) => {
    try {
      const regions = [
        {
          id: 1,
          name: "East Asia",
          code: "EASIA",
          timezone: "Asia/Shanghai",
          active: true,
        },
        {
          id: 2,
          name: "Southeast Asia",
          code: "SEASIA",
          timezone: "Asia/Singapore",
          active: true,
        },
        {
          id: 3,
          name: "Europe",
          code: "EUR",
          timezone: "Europe/Berlin",
          active: true,
        },
        {
          id: 4,
          name: "North America",
          code: "NAM",
          timezone: "America/New_York",
          active: true,
        },
        {
          id: 5,
          name: "Middle East",
          code: "MIDEAST",
          timezone: "Asia/Dubai",
          active: true,
        },
        {
          id: 6,
          name: "Africa",
          code: "AFR",
          timezone: "Africa/Johannesburg",
          active: true,
        },
      ];
      res.json(regions);
    } catch (error) {
      logger.error("Error providing regions data:", error);
      res.status(500).json({ message: "Failed to fetch regions" });
    }
  },
);

router.get(
  "/product-types",
  cacheMiddleware({ type: "commodity", ttl: CACHE_TTL.LONG }),
  (_req, res) => {
    try {
      if (!productTypesData || !Array.isArray(productTypesData)) {
        logger.warn("productTypesData unavailable, returning empty array");
        return res.json([]);
      }
      res.json(productTypesData);
    } catch (error) {
      logger.error("Error providing product types data:", error);
      res.status(500).json({ message: "Failed to fetch product types" });
    }
  },
);

// Tracking endpoint - public access for tracking lookups
router.get(
  "/tracking/:trackingNumber",
  cacheMiddleware({
    type: "tracking",
    keyParam: "trackingNumber",
    ttl: CACHE_TTL.SHORT,
  }),
  async (req, res) => {
    try {
      const { trackingNumber } = req.params;

      const result = await db.select({
        id: shipments.id,
        trackingNumber: shipments.trackingNumber,
        status: shipments.status,
        origin: shipments.origin,
        destination: shipments.destination,
        currentLocation: shipments.currentLocation,
        estimatedDelivery: shipments.estimatedDelivery,
        createdAt: shipments.createdAt,
        updatedAt: shipments.updatedAt,
      }).from(shipments).where(eq(shipments.trackingNumber, trackingNumber)).limit(1);

      const shipment = result[0];

      if (!shipment) {
        return res.status(404).json({ 
          message: "Tracking number not found",
          trackingNumber 
        });
      }

      res.json({
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        origin: shipment.origin,
        destination: shipment.destination,
        currentLocation: shipment.currentLocation,
        estimatedDelivery: shipment.estimatedDelivery?.toISOString() || null,
        createdAt: shipment.createdAt?.toISOString(),
        updatedAt: shipment.updatedAt?.toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error processing tracking lookup:", error);
      res
        .status(500)
        .json({ message: "Failed to lookup tracking information" });
    }
  },
);

export default router;
