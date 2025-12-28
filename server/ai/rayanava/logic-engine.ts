/**
 * 🧠 AI Logic Engine - Enhanced RAYANAVA Processing Pipeline
 * 
 * This service implements a complete AI logic flow:
 * 1. Natural Language Understanding (NLU)
 * 2. Intent Detection + Context Recognition
 * 3. Logic & Decision Engine
 * 4. Knowledge Base & Memory Access
 * 5. External Tools & API Interaction
 * 6. Response Generation (NLG)
 * 7. Final Output
 */

import { RayanavaMemoryManager } from './memory-manager';
import { RayanavaOpenAI } from './rayanava-openai';

export interface AIInput {
  userId?: number;
  sessionId: string;
  rawInput: string;
  inputType: 'text' | 'voice' | 'command';
  context?: {
    conversationHistory?: Array<{ role: string; message: string; timestamp: string }>;
    userPreferences?: Record<string, any>;
    currentMood?: string;
    platform?: string;
  };
}

export interface NLUResult {
  tokens: string[];
  entities: Array<{ type: string; value: string; confidence: number }>;
  sentiment: 'positive' | 'negative' | 'neutral';
  language: string;
  processingTime: number;
}

export interface IntentResult {
  primaryIntent: string;
  secondaryIntents: string[];
  confidence: number;
  context: {
    topic?: string;
    domain?: string;
    urgency?: 'low' | 'medium' | 'high';
  };
}

export interface DecisionResult {
  action: string;
  parameters: Record<string, any>;
  requiresKnowledge: boolean;
  requiresExternalTools: boolean;
  confidence: number;
}

export interface AIOutput {
  success: boolean;
  response: {
    type: 'text' | 'action' | 'suggestion' | 'error';
    content: any;
    metadata?: Record<string, any>;
    emotion?: string;
    suggestions?: string[];
  };
  processingTime: number;
  error?: string;
}

export class AILogicEngine {
  private memoryManager: RayanavaMemoryManager;
  private openAI: RayanavaOpenAI;
  
  constructor() {
    this.memoryManager = RayanavaMemoryManager.getInstance();
    this.openAI = new RayanavaOpenAI();
  }

  /**
   * Main AI processing pipeline
   */
  async processInput(input: AIInput): Promise<AIOutput> {
    const startTime = Date.now();
    
    try {
      console.log(`🧠 [AI Logic Engine] Processing input for session ${input.sessionId}`);
      
      // Step 1: Natural Language Understanding (NLU)
      const nluResult = await this.performNLU(input);
      console.log(`📝 [NLU] Completed in ${nluResult.processingTime}ms`);
      
      // Step 2: Intent Detection + Context Recognition
      const intentResult = await this.detectIntent(nluResult, input);
      console.log(`🎯 [Intent] Detected: ${intentResult.primaryIntent} (${intentResult.confidence}%)`);
      
      // Step 3: Logic & Decision Engine
      const decisionResult = await this.makeDecision(intentResult, input);
      console.log(`🤔 [Decision] Action: ${decisionResult.action}`);
      
      // Step 4: Knowledge Base & Memory Access
      let knowledgeContext = {};
      if (decisionResult.requiresKnowledge) {
        knowledgeContext = await this.accessKnowledge(input, intentResult);
        console.log(`📚 [Knowledge] Retrieved context`);
      }
      
      // Step 5: External Tools & API Interaction (if needed)
      let toolResults = {};
      if (decisionResult.requiresExternalTools) {
        toolResults = await this.useExternalTools(decisionResult);
        console.log(`🔧 [Tools] Executed external tools`);
      }
      
      // Step 6: Response Generation
      const response = await this.generateResponse(
        input,
        intentResult,
        decisionResult,
        knowledgeContext,
        toolResults
      );
      console.log(`💬 [Response] Generated: ${response.type}`);
      
      // Store conversation in memory
      if (input.userId) {
        await this.memoryManager.storeConversation(
          input.userId,
          input.sessionId,
          input.rawInput,
          response.content,
          intentResult.primaryIntent,
          nluResult.sentiment
        );
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ [AI Logic Engine] Completed in ${processingTime}ms`);
      
      return {
        success: true,
        response,
        processingTime
      };
      
    } catch (error) {
      console.error('AI Logic Engine error:', error);
      return {
        success: false,
        response: {
          type: 'error',
          content: 'I encountered an error processing your request. Please try again.'
        },
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Perform Natural Language Understanding
   */
  private async performNLU(input: AIInput): Promise<NLUResult> {
    const startTime = Date.now();
    
    // Tokenize input
    const tokens = input.rawInput.toLowerCase().split(/\s+/);
    
    // Extract entities (simple pattern matching)
    const entities = this.extractEntities(input.rawInput);
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(input.rawInput);
    
    // Detect language (simplified - assumes English)
    const language = 'en';
    
    return {
      tokens,
      entities,
      sentiment,
      language,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Detect intent from NLU results
   */
  private async detectIntent(nluResult: NLUResult, input: AIInput): Promise<IntentResult> {
    const text = input.rawInput.toLowerCase();
    
    // Intent patterns
    const intents = {
      'greeting': /^(hello|hi|hey|good morning|good evening)/i,
      'help': /(help|assist|support|guide|how to)/i,
      'logistics': /(ship|deliver|route|freight|cargo|logistics|supply chain)/i,
      'analytics': /(analyz|report|metric|data|insight|performance)/i,
      'automation': /(automat|workflow|process|optimize|efficiency)/i,
      'sales': /(lead|customer|opportunity|deal|sales|revenue)/i,
      'content': /(blog|article|content|write|generate|create)/i,
      'status': /(status|check|monitor|health|running)/i,
      'question': /(\?|what|when|where|why|how|who)/i,
      'command': /(do|make|create|update|delete|execute|run)/i
    };
    
    let primaryIntent = 'general';
    let confidence = 50;
    
    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(text)) {
        primaryIntent = intent;
        confidence = 85;
        break;
      }
    }
    
    // Extract context
    const context: any = {
      domain: 'general',
      urgency: 'medium'
    };
    
    if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
      context.urgency = 'high';
    }
    
    if (primaryIntent === 'logistics') {
      context.domain = 'logistics';
    } else if (primaryIntent === 'sales') {
      context.domain = 'sales';
    } else if (primaryIntent === 'analytics') {
      context.domain = 'analytics';
    }
    
    return {
      primaryIntent,
      secondaryIntents: [],
      confidence,
      context
    };
  }

  /**
   * Make decision based on intent
   */
  private async makeDecision(intentResult: IntentResult, input: AIInput): Promise<DecisionResult> {
    let action = 'respond';
    let requiresKnowledge = false;
    let requiresExternalTools = false;
    const parameters: Record<string, any> = {};
    
    switch (intentResult.primaryIntent) {
      case 'greeting':
        action = 'greet';
        break;
      case 'help':
        action = 'provide_help';
        requiresKnowledge = true;
        break;
      case 'logistics':
        action = 'logistics_analysis';
        requiresKnowledge = true;
        requiresExternalTools = true;
        break;
      case 'analytics':
        action = 'generate_analytics';
        requiresKnowledge = true;
        break;
      case 'automation':
        action = 'suggest_automation';
        requiresKnowledge = true;
        break;
      case 'sales':
        action = 'sales_assistance';
        requiresKnowledge = true;
        break;
      case 'content':
        action = 'generate_content';
        requiresExternalTools = true;
        break;
      case 'command':
        action = 'execute_command';
        requiresExternalTools = true;
        break;
      default:
        action = 'general_response';
        requiresKnowledge = true;
    }
    
    return {
      action,
      parameters,
      requiresKnowledge,
      requiresExternalTools,
      confidence: intentResult.confidence
    };
  }

  /**
   * Access knowledge base and memory
   */
  private async accessKnowledge(input: AIInput, intentResult: IntentResult): Promise<any> {
    const knowledge: any = {};
    
    // Search knowledge base
    const relevantKnowledge = await this.memoryManager.searchKnowledgeBase(
      input.rawInput,
      intentResult.context.domain
    );
    
    if (relevantKnowledge.length > 0) {
      knowledge.knowledgeBase = relevantKnowledge;
    }
    
    // Get user context if available
    if (input.userId) {
      const userContext = await this.memoryManager.getUserContext(input.userId);
      if (userContext.length > 0) {
        knowledge.userContext = userContext;
      }
      
      // Get conversation history
      const history = await this.memoryManager.getConversationHistory(
        input.userId,
        input.sessionId,
        5
      );
      if (history.length > 0) {
        knowledge.conversationHistory = history;
      }
    }
    
    return knowledge;
  }

  /**
   * Use external tools and APIs
   */
  private async useExternalTools(decisionResult: DecisionResult): Promise<any> {
    const results: any = {};
    
    // Simulate external tool usage based on action
    switch (decisionResult.action) {
      case 'logistics_analysis':
        results.routeOptimization = {
          optimizedRoute: 'Route A -> B -> C',
          estimatedTime: '4 hours',
          costSavings: '15%'
        };
        break;
      case 'generate_content':
        // Use OpenAI if available
        if (process.env.OPENAI_API_KEY) {
          results.generatedContent = await this.openAI.generateContent({
            type: 'blog',
            topic: decisionResult.parameters.topic || 'logistics innovation'
          });
        }
        break;
      case 'execute_command':
        results.commandResult = {
          status: 'success',
          message: 'Command executed successfully'
        };
        break;
    }
    
    return results;
  }

  /**
   * Generate final response
   */
  private async generateResponse(
    input: AIInput,
    intentResult: IntentResult,
    decisionResult: DecisionResult,
    knowledgeContext: any,
    toolResults: any
  ): Promise<AIOutput['response']> {
    let content = '';
    let emotion = 'neutral';
    let suggestions: string[] = [];
    
    // Generate response based on action
    switch (decisionResult.action) {
      case 'greet':
        content = "Hello! I'm Rayanava, your AI assistant. How can I help you today?";
        emotion = 'friendly';
        suggestions = ['Tell me about automation', 'Show analytics', 'Help with logistics'];
        break;
        
      case 'provide_help':
        content = "I can help you with various aspects of logistics and business operations. ";
        if (knowledgeContext.knowledgeBase?.length > 0) {
          content += `Based on our knowledge base: ${knowledgeContext.knowledgeBase[0].answer}`;
        } else {
          content += "What specific area would you like assistance with?";
        }
        emotion = 'helpful';
        suggestions = ['Process automation', 'Data analysis', 'Route optimization'];
        break;
        
      case 'logistics_analysis':
        if (toolResults.routeOptimization) {
          content = `I've analyzed your logistics requirements. ${toolResults.routeOptimization.optimizedRoute} with an estimated time of ${toolResults.routeOptimization.estimatedTime} and potential cost savings of ${toolResults.routeOptimization.costSavings}.`;
        } else {
          content = "I can help optimize your logistics operations. Please provide more details about your requirements.";
        }
        emotion = 'analytical';
        break;
        
      case 'generate_analytics':
        content = "Here's an analysis of your operations based on current data...";
        emotion = 'focused';
        break;
        
      case 'generate_content':
        if (toolResults.generatedContent) {
          content = toolResults.generatedContent.content;
        } else {
          content = "I can help generate content for your needs. What type of content would you like?";
        }
        emotion = 'creative';
        break;
        
      default:
        // Use OpenAI for enhanced response if available
        if (process.env.OPENAI_API_KEY) {
          const enhanced = await this.openAI.enhancedChat(input.rawInput, input.context?.conversationHistory);
          content = enhanced.response || "I understand your request. Let me help you with that.";
        } else {
          content = "I understand your request. Let me help you with that.";
        }
        emotion = 'thoughtful';
    }
    
    return {
      type: 'text',
      content,
      metadata: {
        intent: intentResult.primaryIntent,
        confidence: decisionResult.confidence,
        emotion
      },
      emotion,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Extract entities from text
   */
  private extractEntities(text: string): Array<{ type: string; value: string; confidence: number }> {
    const entities: Array<{ type: string; value: string; confidence: number }> = [];
    
    // Email detection
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails) {
      emails.forEach(email => {
        entities.push({ type: 'email', value: email, confidence: 95 });
      });
    }
    
    // Number detection
    const numberRegex = /\b\d+(\.\d+)?\b/g;
    const numbers = text.match(numberRegex);
    if (numbers) {
      numbers.forEach(num => {
        entities.push({ type: 'number', value: num, confidence: 90 });
      });
    }
    
    // Date detection (simple)
    const dateRegex = /\b(today|tomorrow|yesterday|\d{1,2}\/\d{1,2}\/\d{2,4})\b/gi;
    const dates = text.match(dateRegex);
    if (dates) {
      dates.forEach(date => {
        entities.push({ type: 'date', value: date, confidence: 85 });
      });
    }
    
    return entities;
  }

  /**
   * Analyze sentiment of text
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'wonderful', 'amazing', 'love', 'perfect', 'thank'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'wrong', 'problem', 'issue', 'error', 'fail'];
    
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }
}