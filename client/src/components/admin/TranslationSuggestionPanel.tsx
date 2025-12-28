import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { suggestTranslation } from "@/services/translationSuggestion";

const supportedLanguages = {
  ar: "العربية",
  en: "English",
  es: "Español",
  fa: "فارسی",
  tr: "Türkçe",
  zh: "中文",
  ru: "Русский"
};

export function TranslationSuggestionPanel() {
  const [originalText, setOriginalText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    text: string;
    confidence: number;
  } | null>(null);
  const { toast } = useToast();

  const handleSuggest = async () => {
    if (!originalText || !targetLanguage) {
      toast({
        title: "Error",
        description: "Please provide both text and target language",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await suggestTranslation(originalText, targetLanguage, context);
      setSuggestion({
        text: result.suggestedTranslation,
        confidence: result.confidence,
      });
      toast({
        title: "Success",
        description: "Translation suggestion generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate translation suggestion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Translation Suggestions</h2>
        <p className="text-muted-foreground">
          Get AI-powered translation suggestions for your content
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="original">Original Text</Label>
          <Textarea
            id="original"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Enter the text to translate..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Context (Optional)</Label>
          <Input
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Provide any relevant context for better translation..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Target Language</Label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select target language" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(supportedLanguages).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSuggest}
          disabled={isLoading || !originalText || !targetLanguage}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Generating Suggestion..." : "Get Translation Suggestion"}
        </Button>

        {suggestion && (
          <div className="space-y-2 pt-4 border-t">
            <Label>Suggested Translation</Label>
            <div className="p-4 rounded-md bg-muted">
              <p className="mb-2">{suggestion.text}</p>
              <p className="text-sm text-muted-foreground">
                Confidence: {(suggestion.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
