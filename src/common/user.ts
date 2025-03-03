import { SupportedLanguage } from "./lang";

export interface UserSettings {
  languageCode: SupportedLanguage | null;
  createdAt: number | null;
  email: string;
  lastLoginAt: number | null;
  lastLoginAtDateTime: string | null;
}
