import { Router } from 'express';
import { getServiceRecommendations } from '../services/ai-service-recommender';
import { servicesData } from '../data/services-data';
import { isAuthenticated } from '../core/auth/auth.service';

const router = Router();

// Endpoint to get service recommendations based on user requirements
router.post("/service-recommendation", isAuthenticated, async (req, res) => {
  try {
    // Validate required fields
    const { businessType, cargoType, requirementsDescription, specificRequirements } = req.body;
    
    if (!businessType || !cargoType || !requirementsDescription) {
      return res.status(400).json({ 
        error: "Missing required fields. Please provide businessType, cargoType, and requirementsDescription." 
      });
    }
    
    // Call the AI service to get recommendations
    const recommendations = await getServiceRecommendations({
      businessType,
      cargoType,
      requirementsDescription,
      specificRequirements
    });
    
    // Return the recommendations
    return res.json(recommendations);
    
  } catch (error) {
    // Error in service recommendation endpoint - handled by error response
    return res.status(500).json({ 
      error: "An error occurred while processing your request. Please try again." 
    });
  }
});

export default router;