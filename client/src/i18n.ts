import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import type { InitOptions } from 'i18next';

// Configuration for i18next
const config: InitOptions = {
  fallbackLng: 'en',
  supportedLngs: ['en', 'es', 'fa', 'tr', 'ar', 'zh', 'ru'],
  interpolation: {
    escapeValue: false,
  },
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  load: 'languageOnly',
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
  react: {
    useSuspense: false
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(config);

// Helper function to determine text direction
export const getTextDirection = (language: string): 'rtl' | 'ltr' => {
  return ['ar', 'fa'].includes(language) ? 'rtl' : 'ltr';
};

export default i18n;