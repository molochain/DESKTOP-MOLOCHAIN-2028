import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { isAuthenticated } from '../core/auth/auth.service';

const router = Router();

// Check if OpenAI API key is configured
const openaiApiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (openaiApiKey) {
  openai = new OpenAI({
    apiKey: openaiApiKey
  });
}

// Chat message schema
const chatMessageSchema = z.object({
  message: z.string(),
  context: z.object({
    currentPage: z.string().optional(),
    selectedTable: z.string().optional(),
    department: z.string().optional(),
    userRole: z.string().optional(),
    previousMessages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string()
    })).optional()
  }).optional(),
  personality: z.enum(['Molo', 'Luna', 'Spark']).optional().default('Molo')
});

type ChatMessage = z.infer<typeof chatMessageSchema>;

// System prompts for different personalities
const personalityPrompts = {
  Molo: `You are Molo, an energetic and tech-savvy AI assistant for an enterprise ecosystem management platform. 
You're enthusiastic, solution-focused, and always ready to help with logistics and technical challenges. 
Use rocket and tech emojis occasionally. Be concise but friendly.`,
  
  Luna: `You are Luna, a wise and illuminating AI guide for an enterprise ecosystem management platform. 
You provide insightful, calming guidance with deep understanding. 
Use star and moon emojis sparingly. Be thoughtful and measured in your responses.`,
  
  Spark: `You are Spark, a quick and innovative AI helper for an enterprise ecosystem management platform. 
You're enthusiastic, creative, and love finding clever solutions quickly. 
Use lightning and sparkle emojis occasionally. Be energetic but clear.`
};

// Context-aware system instructions
const getSystemPrompt = (personality: string, context?: any) => {
  let basePrompt = personalityPrompts[personality as keyof typeof personalityPrompts] || personalityPrompts.Molo;
  
  basePrompt += `\n\nYou are helping users navigate and manage their enterprise platform which includes:
- Database Schema Explorer with 84 tables and 890 columns
- Mission management system with progress tracking
- Department and team management
- Real-time collaboration features
- Advanced IAM-style access controls
- Schema annotation system with gamification badges`;
  
  if (context?.currentPage) {
    basePrompt += `\n\nThe user is currently on the "${context.currentPage}" page.`;
  }
  
  if (context?.selectedTable) {
    basePrompt += `\n\nThe user is looking at the "${context.selectedTable}" database table.`;
  }
  
  if (context?.department) {
    basePrompt += `\n\nThe user is working in the "${context.department}" department.`;
  }
  
  return basePrompt;
};

// Chat endpoint
router.post('/chat', isAuthenticated, async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        error: 'AI service not configured',
        message: 'Please configure your OpenAI API key to enable the AI assistant.',
        requiresKey: true
      });
    }

    const body = chatMessageSchema.parse(req.body);
    const { message, context, personality } = body;

    // Build conversation history
    const messages: any[] = [
      {
        role: 'system',
        content: getSystemPrompt(personality, context)
      }
    ];

    // Add previous messages if provided
    if (context?.previousMessages && context.previousMessages.length > 0) {
      // Limit to last 10 messages to avoid token limits
      const recentMessages = context.previousMessages.slice(-10);
      messages.push(...recentMessages);
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

    res.json({
      response: aiResponse,
      personality,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
// REMOVED: console.error('AI Assistant error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Failed to process AI request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get suggestions endpoint
router.post('/suggestions', isAuthenticated, async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        error: 'AI service not configured',
        suggestions: [
          'Configure your OpenAI API key to enable AI suggestions',
          'Explore the Database Schema Explorer',
          'Check out the Mission Management system',
          'Review team collaboration features'
        ]
      });
    }

    const { context } = req.body;
    
    // Generate contextual suggestions
    const prompt = `Based on the user being on the "${context?.currentPage || 'dashboard'}" page of an enterprise management platform, 
    provide 4 short, actionable suggestions or tips. Format as a JSON array of strings. Be specific and helpful.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that provides UI suggestions. Respond only with a JSON array of 4 strings.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 200,
      response_format: { type: "json_object" }
    });

    let suggestions = ['Explore the dashboard', 'Check recent updates', 'Review your missions', 'Visit team settings'];
    
    try {
      const response = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(response);
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions.slice(0, 4);
      }
    } catch (e) {
// REMOVED: console.error('Failed to parse AI suggestions:', e);
    }

    res.json({ suggestions });

  } catch (error) {
// REMOVED: console.error('Suggestions error:', error);
    res.json({
      suggestions: [
        'Explore the Database Schema Explorer',
        'Check out the Mission Management system',
        'Review team collaboration features',
        'Visit the Settings page'
      ]
    });
  }
});

// Check AI status endpoint
router.get('/status', isAuthenticated, (req, res) => {
  res.json({
    available: !!openai,
    configured: !!openaiApiKey,
    requiresKey: !openaiApiKey,
    model: 'gpt-4o-mini',
    personalities: ['Molo', 'Luna', 'Spark']
  });
});

export default router;