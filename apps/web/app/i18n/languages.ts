export type SupportedLanguage = "fr" | "en" | "ar";

export const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = "fr";

export const isRTL = (language: SupportedLanguage): boolean => language === "ar";
