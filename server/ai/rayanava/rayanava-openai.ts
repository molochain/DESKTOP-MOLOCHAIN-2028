/**
 * Rayanava OpenAI Integration
 * Enhances Rayanava with real OpenAI capabilities
 */

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export class RayanavaOpenAI {
  private systemPrompt = `You are Rayanava, an advanced AI assistant for MoloChain's global logistics platform.
    
Your personality:
- Highly intelligent and analytical
- Proactive and solution-oriented
- Professional yet friendly
- Creative and innovative

Your expertise includes:
- Logistics automation and supply chain optimization
- Business intelligence and data analysis
- Content creation and marketing
- Sales automation and CRM
- Risk management and decision support

Always provide actionable, specific insights relevant to logistics and business operations.
When discussing MoloChain, emphasize its cutting-edge features and benefits.`;

  /**
   * Enhanced chat with OpenAI
   */
  async enhancedChat(message: string, history?: any[]): Promise<any> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.log('OpenAI API key not configured, using fallback');
        return this.fallbackResponse(message);
      }

      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...(history || []).map((h: any) => ({
          role: h.role || 'user',
          content: h.content || h.message
        })),
        { role: 'user', content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 600,
      });

      const response = completion.choices[0]?.message?.content || 'I can help you with logistics optimization.';
      
      return {
        response,
        emotion: this.detectEmotion(response),
        suggestions: this.generateSuggestions(message, response)
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.fallbackResponse(message);
    }
  }

  /**
   * Generate content with OpenAI
   */
  async generateContent(request: {
    type: string;
    topic?: string;
    keywords?: string[];
    tone?: string;
    length?: string;
  }): Promise<any> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.fallbackContent(request);
      }

      const prompt = this.buildContentPrompt(request);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a professional content creator for MoloChain logistics platform.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: request.length === 'long' ? 1500 : request.length === 'medium' ? 800 : 400,
      });

      const content = completion.choices[0]?.message?.content || '';
      return this.formatContent(content, request);
    } catch (error) {
      console.error('Content generation error:', error);
      return this.fallbackContent(request);
    }
  }

  /**
   * Business intelligence analysis with OpenAI
   */
  async analyzeBusinessIntelligence(query: string, data?: any): Promise<any> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.fallbackAnalysis(query);
      }

      const prompt = `As Rayanava, analyze this business query for MoloChain:
Query: ${query}
${data ? `Context: ${JSON.stringify(data)}` : ''}

Provide:
1. Key insights
2. Strategic recommendations
3. Action items
4. Potential risks and opportunities`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 800,
      });

      const analysis = completion.choices[0]?.message?.content || '';
      return this.formatAnalysis(analysis);
    } catch (error) {
      console.error('BI analysis error:', error);
      return this.fallbackAnalysis(query);
    }
  }

  private buildContentPrompt(request: any): string {
    const { type, topic, keywords, tone, length } = request;
    
    let prompt = `Create ${type} content for MoloChain logistics platform.`;
    
    if (topic) prompt += `\nTopic: ${topic}`;
    if (keywords?.length) prompt += `\nKeywords to include: ${keywords.join(', ')}`;
    if (tone) prompt += `\nTone: ${tone}`;
    if (length) prompt += `\nLength: ${length} (${length === 'short' ? '200-400 words' : length === 'medium' ? '400-800 words' : '800-1500 words'})`;
    
    prompt += `\n\nFormat the response as structured content with title, introduction, main points, and conclusion.`;
    
    return prompt;
  }

  private formatContent(content: string, request: any): any {
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      type: request.type,
      content: {
        title: lines[0]?.replace(/^#+ /, '') || `${request.topic || 'MoloChain'} - ${request.type}`,
        introduction: lines[1] || 'Discover how MoloChain transforms logistics operations.',
        body: lines.slice(2, -2) || ['MoloChain provides cutting-edge solutions.'],
        conclusion: lines[lines.length - 2] || 'Start your logistics transformation with MoloChain today.',
        cta: lines[lines.length - 1] || 'Get Started Now'
      },
      keywords: request.keywords || ['logistics', 'MoloChain', 'automation'],
      tone: request.tone || 'professional',
      length: request.length || 'medium',
      generated_at: new Date().toISOString()
    };
  }

  private formatAnalysis(analysis: string): any {
    const sections = analysis.split(/\d+\.\s+/);
    
    return {
      insights: sections[1]?.split('\n').filter(s => s.trim()) || ['Market analysis indicates growth opportunities'],
      recommendations: sections[2]?.split('\n').filter(s => s.trim()) || ['Implement automation strategies'],
      actionItems: sections[3]?.split('\n').filter(s => s.trim()) || ['Review current processes'],
      risks: sections[4]?.split('\n').filter(s => s.trim()) || ['Monitor market conditions']
    };
  }

  private detectEmotion(response: string): string {
    if (response.includes('excited') || response.includes('great')) return 'enthusiastic';
    if (response.includes('concern') || response.includes('careful')) return 'thoughtful';
    if (response.includes('success') || response.includes('achieve')) return 'confident';
    return 'friendly';
  }

  private generateSuggestions(message: string, response: string): string[] {
    const suggestions = [];
    
    if (message.toLowerCase().includes('automat')) {
      suggestions.push('Show automation examples', 'Calculate ROI', 'Start implementation');
    } else if (message.toLowerCase().includes('analyz')) {
      suggestions.push('View detailed analytics', 'Generate report', 'Compare metrics');
    } else if (message.toLowerCase().includes('sale')) {
      suggestions.push('Qualify leads', 'Track opportunities', 'View pipeline');
    } else {
      suggestions.push('Learn more', 'See examples', 'Get started');
    }
    
    return suggestions;
  }

  private fallbackResponse(message: string): any {
    return {
      response: `I'm Rayanava, your AI assistant for MoloChain logistics. I can help with automation, analysis, and optimization. What specific area would you like to explore?`,
      emotion: 'friendly',
      suggestions: ['Process automation', 'Data analysis', 'Route optimization']
    };
  }

  private fallbackContent(request: any): any {
    return {
      type: request.type,
      content: {
        title: `${request.topic || 'MoloChain Solutions'}`,
        introduction: 'MoloChain revolutionizes logistics with AI-powered automation.',
        body: [
          'Our platform provides comprehensive supply chain management.',
          'Real-time tracking and analytics drive operational excellence.',
          'Automated workflows reduce costs and improve efficiency.'
        ],
        conclusion: 'Transform your logistics operations with MoloChain.',
        cta: 'Start Free Trial'
      },
      keywords: request.keywords || ['logistics', 'automation'],
      generated_at: new Date().toISOString()
    };
  }

  private fallbackAnalysis(query: string): any {
    return {
      insights: ['Market trends indicate growth in automation', 'Digital transformation is accelerating'],
      recommendations: ['Implement phased automation', 'Focus on high-impact areas first'],
      actionItems: ['Assess current processes', 'Define automation priorities'],
      risks: ['Change management challenges', 'Initial investment requirements']
    };
  }
}

export const rayanavaOpenAI = new RayanavaOpenAI();