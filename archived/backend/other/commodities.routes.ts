import { Express } from 'express';
import { logger } from '../../utils/logger';
import { cacheMiddleware } from '../../middleware/cache';
import { CACHE_TTL } from '../config';

export function setupCommodityRoutes(app: Express) {
  // Product Types API - with caching
  app.get("/api/product-types", 
    cacheMiddleware({ type: 'commodity', ttl: CACHE_TTL.LONG }),
    (_req, res) => {
      try {
        const productTypes = [
          { 
            id: 1, 
            name: "Electronics", 
            description: "Consumer and industrial electronics", 
            handlingRequirements: "Handle with care, avoid moisture", 
            compatibleTransportModes: ["air", "ocean", "rail"] 
          },
          { 
            id: 2, 
            name: "Textiles", 
            description: "Clothing and fabric materials", 
            handlingRequirements: "Keep dry, protect from pests", 
            compatibleTransportModes: ["air", "ocean", "rail", "road"] 
          },
          { 
            id: 3, 
            name: "Automotive Parts", 
            description: "Vehicle components and spare parts", 
            handlingRequirements: "Secure packaging, prevent movement", 
            compatibleTransportModes: ["air", "ocean", "rail"] 
          },
          { 
            id: 4, 
            name: "Chemicals", 
            description: "Industrial chemicals and compounds", 
            handlingRequirements: "Hazardous materials handling, proper documentation", 
            compatibleTransportModes: ["ocean", "rail"] 
          },
          { 
            id: 5, 
            name: "Food Products", 
            description: "Processed and packaged foods", 
            handlingRequirements: "Temperature control, sanitary conditions", 
            compatibleTransportModes: ["air", "ocean", "road"] 
          }
        ];
        res.json(productTypes);
      } catch (error) {
        logger.error("Error providing product types data:", error);
        res.status(500).json({ message: "Failed to fetch product types" });
      }
    }
  );

  // Commodities endpoint
  app.get("/api/commodities", 
    cacheMiddleware({ type: 'commodity', ttl: CACHE_TTL.MEDIUM }),
    (_req, res) => {
      try {
        const commodities = [
          {
            id: 1,
            name: "Steel Coils",
            category: "Metals",
            description: "High-grade steel coils for manufacturing",
            currentPrice: 850.00,
            unit: "metric ton",
            origin: "China",
            availability: "In Stock",
            minOrder: 10
          },
          {
            id: 2,
            name: "Cotton Bales",
            category: "Textiles",
            description: "Premium quality cotton bales",
            currentPrice: 1200.00,
            unit: "bale",
            origin: "India",
            availability: "In Stock",
            minOrder: 50
          },
          {
            id: 3,
            name: "Crude Oil",
            category: "Energy",
            description: "Light sweet crude oil",
            currentPrice: 85.50,
            unit: "barrel",
            origin: "Saudi Arabia",
            availability: "Available",
            minOrder: 1000
          },
          {
            id: 4,
            name: "Wheat",
            category: "Agriculture",
            description: "Hard red winter wheat",
            currentPrice: 280.00,
            unit: "metric ton",
            origin: "USA",
            availability: "In Stock",
            minOrder: 25
          },
          {
            id: 5,
            name: "Aluminum Ingots",
            category: "Metals",
            description: "Pure aluminum ingots 99.7%",
            currentPrice: 2400.00,
            unit: "metric ton",
            origin: "Russia",
            availability: "Limited",
            minOrder: 5
          }
        ];
        
        res.json(commodities);
      } catch (error) {
        logger.error("Error fetching commodities:", error);
        res.status(500).json({ message: "Failed to fetch commodities" });
      }
    }
  );

  // Commodity details endpoint
  app.get("/api/commodities/:id", 
    cacheMiddleware({ 
      type: 'commodity', 
      keyParam: 'id', 
      ttl: CACHE_TTL.MEDIUM 
    }),
    (req, res) => {
      try {
        const commodityId = parseInt(req.params.id);
        
        const commodities: Record<number, any> = {
          1: {
            id: 1,
            name: "Steel Coils",
            category: "Metals",
            description: "High-grade steel coils for manufacturing",
            currentPrice: 850.00,
            unit: "metric ton",
            origin: "China",
            specifications: {
              grade: "Q235",
              thickness: "0.3-3.0mm",
              width: "600-1500mm",
              coating: "Galvanized"
            },
            availability: "In Stock",
            minOrder: 10,
            transportRequirements: ["Flatbed trucks", "Container shipping", "Heavy lift equipment"]
          },
          2: {
            id: 2,
            name: "Cotton Bales",
            category: "Textiles",
            description: "Premium quality cotton bales",
            currentPrice: 1200.00,
            unit: "bale",
            origin: "India",
            specifications: {
              stapleLength: "28-30mm",
              micronaire: "3.5-4.9",
              strength: "28-30 g/tex",
              moisture: "8% max"
            },
            availability: "In Stock",
            minOrder: 50,
            transportRequirements: ["Dry containers", "Climate control", "Pest protection"]
          }
        };
        
        const commodity = commodities[commodityId];
        
        if (!commodity) {
          return res.status(404).json({ message: "Commodity not found" });
        }
        
        res.json(commodity);
      } catch (error) {
        logger.error("Error fetching commodity details:", error);
        res.status(500).json({ message: "Failed to fetch commodity details" });
      }
    }
  );

  // Commodity pricing history
  app.get("/api/commodities/:id/pricing", 
    cacheMiddleware({ 
      type: 'commodity', 
      keyParam: 'id', 
      ttl: CACHE_TTL.SHORT 
    }),
    (req, res) => {
      try {
        const commodityId = parseInt(req.params.id);
        
        // Mock pricing history data
        const pricingHistory = {
          commodityId,
          current: 850.00,
          change24h: 2.5,
          change7d: -1.2,
          history: [
            { date: "2024-01-01", price: 820.00 },
            { date: "2024-01-02", price: 835.00 },
            { date: "2024-01-03", price: 840.00 },
            { date: "2024-01-04", price: 838.00 },
            { date: "2024-01-05", price: 850.00 }
          ]
        };
        
        res.json(pricingHistory);
      } catch (error) {
        logger.error("Error fetching pricing history:", error);
        res.status(500).json({ message: "Failed to fetch pricing history" });
      }
    }
  );

  logger.info('Commodity routes initialized');
}