import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import esTranslation from './locales/es/translation.json';
import ruTranslation from './locales/ru/translation.json';

// initialize i18next with resources and useful defaults
// Spanish will be the primary language, Russian is available as an alternate

i18n
  .use(LanguageDetector) // detect language from browser / localStorage
  .use(initReactI18next)
  .init({
    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    resources: {
      es: { translation: esTranslation },
      ru: { translation: ruTranslation },
    },
    lng: 'es',              // default language when the app loads
    fallbackLng: 'es',      // if a key is missing in the current language
    interpolation: {
      escapeValue: false,   // react already protects from xss
    },
  });

export default i18n;
