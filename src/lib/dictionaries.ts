import 'server-only'; // Ensures this module is only used on the server

export type Locale = 'en' | 'zh';

// We enumerate all dictionaries here for better linting and typescript support
// TODO: Define a comprehensive type for the dictionary content for better type safety
const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  zh: () => import('@/locales/zh.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale] ? dictionaries[locale]() : dictionaries.en();
};
