import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validate';
import { isAuthenticated } from '../core/auth/auth.service';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.enum(['general', 'logistics', 'tracking', 'quote']).optional().default('general'),
  history: z.array(z.object({
    type: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().default([])
});

// AI Chat endpoint
router.post('/chat', isAuthenticated, async (req, res) => {
  try {
    const validatedData = chatRequestSchema.parse(req.body);
    const { message, context, history } = validatedData;

    // Build conversation context
    const systemPrompt = getSystemPrompt(context);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
      functions: getFunctions(context),
      function_call: 'auto'
    });

    const assistantMessage = completion.choices[0]?.message;
    
    if (!assistantMessage) {
      throw new Error('No response from AI');
    }

    // Handle function calls
    let responseData: any = {
      message: assistantMessage.content || "I'm sorry, I couldn't process that request.",
      suggestions: generateSuggestions(context, message)
    };

    if (assistantMessage.function_call) {
      const functionResult = await handleFunctionCall(
        assistantMessage.function_call,
        context
      );
      responseData = { ...responseData, ...functionResult };
    }

    res.json(responseData);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request format. Please check your input.",
        suggestions: ['Try again', 'Check input format', 'Contact support']
      });
    }
    
    logger.error('AI chat error:', error);
    res.status(500).json({
      message: "I'm experiencing technical difficulties. Please try again or contact support.",
      suggestions: ['Try again', 'Contact support', 'Get help']
    });
  }
});

function getSystemPrompt(context: string): string {
  const basePrompt = `You are an AI assistant for Molochain, a global logistics and supply chain management platform. You are helpful, professional, and knowledgeable about shipping, freight, logistics, and supply chain operations.

Key capabilities:
- Track shipments and provide delivery updates
- Calculate shipping costs and provide quotes
- Recommend optimal shipping methods and routes
- Explain logistics processes and terminology
- Help with documentation and compliance requirements
- Provide real-time market insights

Always be concise, accurate, and actionable in your responses. If you don't know something specific, be honest and suggest alternative ways to help.`;

  const contextPrompts = {
    logistics: basePrompt + `\n\nYou are specifically focused on logistics operations, shipping solutions, and supply chain optimization. Help users find the best shipping methods, calculate costs, and optimize their logistics processes.`,
    
    tracking: basePrompt + `\n\nYou are focused on shipment tracking and delivery management. Help users track their shipments, understand delivery statuses, and resolve shipping issues.`,
    
    quote: basePrompt + `\n\nYou are focused on providing shipping quotes and cost estimates. Help users understand pricing, compare service options, and find cost-effective shipping solutions.`,
    
    general: basePrompt
  };

  return contextPrompts[context as keyof typeof contextPrompts] || contextPrompts.general;
}

function getFunctions(context: string) {
  const baseFunctions = [
    {
      name: 'get_shipping_quote',
      description: 'Get a shipping quote for specific requirements',
      parameters: {
        type: 'object',
        properties: {
          origin: { type: 'string', description: 'Origin location' },
          destination: { type: 'string', description: 'Destination location' },
          weight: { type: 'number', description: 'Package weight in kg' },
          service_type: { 
            type: 'string', 
            enum: ['express', 'standard', 'economy'],
            description: 'Type of shipping service'
          }
        },
        required: ['origin', 'destination']
      }
    },
    {
      name: 'track_shipment',
      description: 'Track a shipment by tracking number',
      parameters: {
        type: 'object',
        properties: {
          tracking_number: { type: 'string', description: 'Shipment tracking number' }
        },
        required: ['tracking_number']
      }
    },
    {
      name: 'recommend_service',
      description: 'Recommend a logistics service based on requirements',
      parameters: {
        type: 'object',
        properties: {
          service_category: {
            type: 'string',
            enum: ['ocean', 'air', 'rail', 'trucking', 'customs', 'warehousing'],
            description: 'Category of logistics service needed'
          },
          requirements: { type: 'string', description: 'Specific requirements or constraints' }
        },
        required: ['service_category']
      }
    }
  ];

  return baseFunctions;
}

async function handleFunctionCall(functionCall: any, context: string) {
  const { name, arguments: args } = functionCall;
  const parsedArgs = JSON.parse(args);

  switch (name) {
    case 'get_shipping_quote':
      return await getShippingQuote(parsedArgs);
    
    case 'track_shipment':
      return await trackShipment(parsedArgs);
    
    case 'recommend_service':
      return await recommendService(parsedArgs);
    
    default:
      return {};
  }
}

async function getShippingQuote(args: any) {
  // In a real implementation, this would integrate with shipping APIs
  const estimatedCost = Math.floor(Math.random() * 500) + 50;
  const estimatedDays = Math.floor(Math.random() * 10) + 1;

  return {
    quote: {
      origin: args.origin,
      destination: args.destination,
      estimatedCost,
      estimatedDays,
      serviceType: args.service_type || 'standard'
    },
    suggestions: [
      'Get detailed quote',
      'Compare services',
      'Book shipment',
      'Contact sales'
    ]
  };
}

async function trackShipment(args: any) {
  // In a real implementation, this would query tracking APIs
  const statuses = ['In Transit', 'Delivered', 'Out for Delivery', 'Processing'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    tracking: {
      trackingNumber: args.tracking_number,
      status: randomStatus,
      lastUpdate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    suggestions: [
      'Get delivery updates',
      'Change delivery address',
      'Contact carrier',
      'View full tracking'
    ]
  };
}

async function recommendService(args: any) {
  const serviceRecommendations = {
    ocean: 'container',
    air: 'airfreight',
    rail: 'rail',
    trucking: 'trucking',
    customs: 'customs',
    warehousing: 'warehousing'
  };

  const recommendedService = serviceRecommendations[args.service_category as keyof typeof serviceRecommendations];

  return {
    serviceRecommendation: recommendedService,
    suggestions: [
      `Learn about ${args.service_category} services`,
      'Get service quote',
      'View service details',
      'Contact specialist'
    ]
  };
}

function generateSuggestions(context: string, message: string): string[] {
  const contextSuggestions = {
    logistics: [
      'Calculate shipping cost',
      'Find best shipping method',
      'Track my shipment',
      'Optimize delivery route'
    ],
    tracking: [
      'Check delivery status',
      'Update delivery address',
      'Get delivery notification',
      'Contact carrier'
    ],
    quote: [
      'Compare shipping options',
      'Get bulk shipping rates',
      'Find express delivery',
      'Calculate total costs'
    ],
    general: [
      'Get shipping quote',
      'Track my order',
      'Find services',
      'Contact support'
    ]
  };

  const suggestions = contextSuggestions[context as keyof typeof contextSuggestions] || contextSuggestions.general;
  
  // Return random subset of suggestions
  return suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
}

export default router;