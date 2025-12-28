import OpenAI from "openai";

// Type definitions
interface TranslationSuggestion {
  originalText: string;
  suggestedTranslation: string;
  targetLanguage: string;
  confidence: number;
}

// Type guard for OpenAI API errors
type OpenAIError = {
  statusCode?: number;
  message?: string;
};

// Error type checking helper
const isOpenAIError = (err: unknown): err is OpenAIError => {
  return err !== null && typeof err === 'object' && ('statusCode' in err || 'message' in err);
};

// Initialize OpenAI client with better error handling
function initializeOpenAIClient() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    // OpenAI API key not configured
    return null;
  }
  
  try {
    return new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
      maxRetries: 2,
      timeout: 20000
    });
  } catch (error) {
    // Failed to initialize OpenAI client
    return null;
  }
}

const openai = initializeOpenAIClient();

export async function suggestTranslation(
  text: string,
  targetLanguage: string,
  context?: string
): Promise<TranslationSuggestion> {
  // Check if OpenAI client is available
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please check your API key.');
  }
  
  try {
    // Update to use latest gpt-4o model
    const prompt = `Translate the following text to ${targetLanguage}. 
    ${context ? `Context: ${context}\n` : ''}
    Original text: "${text}"
    Provide a natural and culturally appropriate translation.`;

    // Using non-null assertion since we've checked for null above
    const completion = await openai!.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o", // Use the latest model
      temperature: 0.3,
      max_tokens: 200,
    });

    const suggestedTranslation = completion.choices[0]?.message?.content?.trim() || '';

    return {
      originalText: text,
      suggestedTranslation,
      targetLanguage,
      confidence: calculateConfidence(completion),
    };
  } catch (error: unknown) {
    // Translation suggestion error handled
    
    if (isOpenAIError(error)) {
      // Handle specific OpenAI error codes
      if (error.statusCode === 401) {
        throw new Error('Authentication failed with the OpenAI API. Please check your API key.');
      } else if (error.statusCode === 429) {
        throw new Error('Rate limit exceeded with the OpenAI API. Please try again later.');
      }
      
      // Use error message if available
      if (error.message) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
    }
    
    // Generic error fallback
    throw new Error(`Failed to generate translation suggestion: ${
      error instanceof Error ? error.message : 'Unknown error'
    }`);
  }
}

function calculateConfidence(completion: OpenAI.Chat.ChatCompletion): number {
  // Simple confidence calculation based on the completion
  // Could be enhanced with more sophisticated metrics
  return completion.choices[0]?.message?.content ? 0.85 : 0;
}

export async function batchSuggestTranslations(
  texts: string[],
  targetLanguage: string,
  context?: string
): Promise<TranslationSuggestion[]> {
  const suggestions = await Promise.all(
    texts.map(text => suggestTranslation(text, targetLanguage, context))
  );
  return suggestions;
}
