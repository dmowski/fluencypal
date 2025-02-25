import { SupportedLanguage } from "./lang";

export interface UserSettings {
  languageCode: SupportedLanguage | null;
  createdAt: number | null;
  lastLoginAt: number | null;
}
