import { z } from 'zod';

const supportedLanguages = [
  "en", "es", "zh", "ar", "ru", "fa", "tr"
] as const;

export const languageSchema = z.enum(supportedLanguages);
export type SupportedLanguage = z.infer<typeof languageSchema>;

// Simple translation function that returns the original text
export async function translateMessage(
  text: string,
  from: SupportedLanguage,
  to: SupportedLanguage
): Promise<string> {
  // Return original text when AI translation is disabled
  return text;
}

// Simple transcription function that returns empty text
export async function transcribeAudio(_audioBuffer: Buffer): Promise<string> {
  return "Audio transcription is currently disabled";
}

// Simple language detection that defaults to English
export function detectLanguage(_text: string): Promise<SupportedLanguage> {
  return Promise.resolve("en" as const);
}