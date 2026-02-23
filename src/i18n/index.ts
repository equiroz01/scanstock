import { createContext, useContext } from 'react';
import { en, type Translations } from './en';
import { es } from './es';

export type Language = 'en' | 'es';

const translations: Record<Language, Translations> = {
  en,
  es,
};

// Default language
let currentLanguage: Language = 'en';

// Get current language
export function getLanguage(): Language {
  return currentLanguage;
}

// Set current language
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

// Get translations for current language
export function t(): Translations {
  return translations[currentLanguage];
}

// Get a specific translation by path (e.g., 'badges.outOfStock')
export function translate(path: string): string {
  const keys = path.split('.');
  let result: unknown = translations[currentLanguage];

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      // Fallback to English
      result = translations.en;
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = (result as Record<string, unknown>)[k];
        } else {
          return path; // Return path if translation not found
        }
      }
      break;
    }
  }

  return typeof result === 'string' ? result : path;
}

// Context for React components
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
});

export function useI18n() {
  return useContext(I18nContext);
}

// Export translations for direct access
export { en, es };
export type { Translations };
