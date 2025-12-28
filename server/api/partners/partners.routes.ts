import { Router } from 'express';
import { partnersData, getPartnerById, getRelatedPartners } from '../../data/partners-data';
import { logger } from '../../utils/logger';

const router = Router();

router.get("/", (_req, res) => {
  try {
    if (!partnersData || !Array.isArray(partnersData)) {
      logger.warn("partnersData unavailable, returning empty array");
      return res.json([]);
    }
    res.json(partnersData);
  } catch (error) {
    logger.error("Error fetching partners:", error);
    res.status(500).json({ error: "Failed to fetch partners" });
  }
});

router.get("/:id", (req, res) => {
  try {
    const partnerId = parseInt(req.params.id);
    const partner = getPartnerById(partnerId);

    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    res.json(partner);
  } catch (error) {
    logger.error("Error fetching partner details:", error);
    res.status(500).json({ error: "Failed to fetch partner details" });
  }
});

router.get("/:id/related", (req, res) => {
  try {
    const partnerId = parseInt(req.params.id);
    
    const partner = getPartnerById(partnerId);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    
    const relatedPartners = getRelatedPartners(partnerId);
    res.json(relatedPartners);
  } catch (error) {
    logger.error("Error fetching related partners:", error);
    res.status(500).json({ error: "Failed to fetch related partners" });
  }
});

export default router;
