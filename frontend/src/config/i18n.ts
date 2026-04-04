/**
 * i18n Configuration — Multilingual support using react-i18next
 * Supports English (default), Hindi, and Punjabi
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import pa from '../locales/pa.json';

i18n
  .use(LanguageDetector) // Auto-detect language from localStorage/browser
  .use(initReactI18next)  // Pass i18n to react-i18next
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      pa: { translation: pa },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already handles XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'samadhan_language',
    },
  });

export default i18n;
