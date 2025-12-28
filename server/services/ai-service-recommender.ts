import OpenAI from 'openai';
import { servicesData } from '../data/services-data';
import { logger } from '../utils/logger';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI with better error handling
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.warn("OpenAI API key is missing. AI service recommendations will be disabled.");
    return null;
  }
  
  try {
    return new OpenAI({
      apiKey,
      maxRetries: 3,
      timeout: 30000 // 30 seconds timeout
    });
  } catch (error) {
    logger.error("Failed to initialize OpenAI client:", error);
    return null;
  }
}

const openai = getOpenAIClient();

interface RecommendationParams {
  businessType: string;
  cargoType: string;
  requirementsDescription: string;
  specificRequirements?: string;
}

interface ServiceRecommendation {
  serviceId: string;
  serviceName: string;
  matchScore: number; // 0.0 to 1.0
  reason: string;
}

// Get service recommendations based on user requirements
export async function getServiceRecommendations(params: RecommendationParams): Promise<ServiceRecommendation[]> {
  try {
    // Check if OpenAI is available
    if (!openai) {
      logger.warn("OpenAI client not available. Returning fallback recommendations.");
      return getFallbackRecommendations(params);
    }
    
    // Create a system message with data about available services and recommendation instructions
    const systemMessage = createSystemMessage();
    
    // Create a user message containing the requirements to analyze
    const userMessage = createUserMessage(params);
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    });
    
    // Extract and parse the AI response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI service");
    }
    
    const parsedResponse = JSON.parse(content);
    
    // Validate and return the recommendations
    if (!Array.isArray(parsedResponse.recommendations)) {
      throw new Error("Invalid recommendation format");
    }
    
    return validateAndNormalizeRecommendations(parsedResponse.recommendations);
    
  } catch (error) {
    // Error getting service recommendations - handled by error response
    throw error;
  }
}

// Create the system message with all service information and instructions
function createSystemMessage(): string {
  // Prepare service data in a format that's easy for the model to process
  const serviceInfoList = servicesData.map(service => {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      tags: service.tags,
      businessTypes: service.businessTypes,
      cargoTypes: service.cargoTypes,
      capabilities: service.capabilities
    };
  });
  
  return `
You are a sophisticated logistics and transportation AI assistant that analyzes customer requirements and recommends the most appropriate services from our catalog.

# Available Services
${JSON.stringify(serviceInfoList, null, 2)}

# Your Task
1. Analyze the user's business type, cargo type, and detailed requirements.
2. Identify the most relevant services that meet their needs.
3. For each recommended service, provide:
   - A match score (0.0 to 1.0) indicating the relevance to their needs
   - A detailed explanation of why this service matches their requirements

# Response Format
Respond with a JSON object containing an array of recommended services like this:
{
  "recommendations": [
    {
      "serviceId": "container",
      "serviceName": "Container Services",
      "matchScore": 0.95,
      "reason": "This service is highly relevant because..."
    },
    ...
  ]
}

Important guidelines:
- Recommend 3-5 services maximum, prioritizing the most relevant ones
- Make sure match scores accurately reflect relevance (higher = better match)
- Provide thoughtful, specific reasons that reference the user's requirements
- Only recommend services from the provided list
`;
}

// Create the user message containing the requirements
function createUserMessage(params: RecommendationParams): string {
  let message = `
I need logistics service recommendations for my business with the following details:

- Business Type: ${params.businessType}
- Cargo Type: ${params.cargoType}
- Requirements: ${params.requirementsDescription}
`;

  if (params.specificRequirements) {
    message += `\n- Specific Priorities: ${params.specificRequirements}`;
  }
  
  message += `\n\nPlease analyze these requirements and recommend the most appropriate services from your catalog.`;
  
  return message;
}

// Fallback recommendations when OpenAI is not available
function getFallbackRecommendations(params: RecommendationParams): ServiceRecommendation[] {
  logger.info("Providing fallback service recommendations based on business type and cargo type");
  
  const fallbackRecommendations: ServiceRecommendation[] = [];
  const businessType = params.businessType.toLowerCase();
  const cargoType = params.cargoType.toLowerCase();
  
  // Basic logic for fallback recommendations
  if (businessType.includes('manufacturing') || cargoType.includes('container')) {
    fallbackRecommendations.push({
      serviceId: 'container',
      serviceName: 'Container Services',
      matchScore: 0.8,
      reason: 'Container services are commonly needed for manufacturing businesses and containerized cargo.'
    });
  }
  
  if (businessType.includes('retail') || businessType.includes('ecommerce')) {
    fallbackRecommendations.push({
      serviceId: 'ecommerce',
      serviceName: 'E-commerce & Retail',
      matchScore: 0.9,
      reason: 'E-commerce services are essential for retail businesses.'
    });
  }
  
  if (cargoType.includes('perishable') || cargoType.includes('food')) {
    fallbackRecommendations.push({
      serviceId: 'cold-chain',
      serviceName: 'Cold Chain Logistics',
      matchScore: 0.95,
      reason: 'Cold chain services are crucial for perishable goods and food products.'
    });
  }
  
  // Default recommendations if no specific matches
  if (fallbackRecommendations.length === 0) {
    fallbackRecommendations.push(
      {
        serviceId: 'general-freight',
        serviceName: 'General Freight Services',
        matchScore: 0.7,
        reason: 'General freight services are suitable for most cargo types and business needs.'
      },
      {
        serviceId: 'tracking',
        serviceName: 'Shipment Tracking',
        matchScore: 0.8,
        reason: 'Tracking services provide visibility and control over shipments for all businesses.'
      }
    );
  }
  
  return fallbackRecommendations.slice(0, 5); // Limit to 5 recommendations
}

// Validate and normalize the recommendations
function validateAndNormalizeRecommendations(rawRecommendations: any[]): ServiceRecommendation[] {
  return rawRecommendations
    .filter(rec => {
      // Ensure all required fields are present
      return rec.serviceId && rec.serviceName && 
             typeof rec.matchScore === 'number' &&
             rec.reason;
    })
    .map(rec => {
      // Normalize the match score to ensure it's between 0 and 1
      const normalizedScore = Math.max(0, Math.min(1, rec.matchScore));
      
      return {
        serviceId: rec.serviceId,
        serviceName: rec.serviceName,
        matchScore: normalizedScore,
        reason: rec.reason
      };
    })
    // Sort by match score (highest first)
    .sort((a, b) => b.matchScore - a.matchScore);
}