import { SupportedLanguage } from "./lang";

export interface UserSettings {
  language: SupportedLanguage | null;
  createdAt: number | null;
  lastLoginAt: number | null;
}
