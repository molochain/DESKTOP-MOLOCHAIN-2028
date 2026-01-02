import { useTranslation } from 'react-i18next';
import { TranslationSuggestionPanel } from "@/components/admin/TranslationSuggestionPanel";

export default function TranslationSuggestionsPage() {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto py-8">
      <TranslationSuggestionPanel />
    </div>
  );
}
