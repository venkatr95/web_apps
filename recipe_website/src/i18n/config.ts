export type Locale = "en" | "de" | "es" | "hi" | "te" | "kn" | "ta";

export const locales: Locale[] = ["en", "de", "es", "hi", "te", "kn", "ta"];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  hi: "हिन्दी",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  ta: "தமிழ்",
};
