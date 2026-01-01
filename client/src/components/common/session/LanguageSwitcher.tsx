import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Globe, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const languages = {
  en: "English",
  es: "Español",
  fa: "فارسی",
  tr: "Türkçe",
  ar: "العربية",
  zh: "中文",
  ru: "Русский"
};

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && Object.keys(languages).includes(savedLang)) {
      changeLanguage(savedLang);
    }
  }, []);

  const changeLanguage = async (lng: string) => {
    try {
      setIsChanging(true);
      await i18n.changeLanguage(lng);
      // Update document direction and lang for RTL languages and accessibility
      document.documentElement.dir = ['ar', 'fa'].includes(lng) ? 'rtl' : 'ltr';
      document.documentElement.lang = lng;
      // Save language preference
      localStorage.setItem('preferredLanguage', lng);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-10 px-0"
          disabled={isChanging}
        >
          {isChanging ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code)}
            className="flex items-center justify-between"
            disabled={isChanging}
          >
            <span className={code === 'ar' || code === 'fa' ? 'font-[arial]' : ''}>
              {name}
            </span>
            {i18n.language === code && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;