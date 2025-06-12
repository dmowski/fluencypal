import { SupportedLanguage } from "../features/Lang/lang";

export interface UserSettings {
  languageCode: SupportedLanguage | null;
  createdAt: number | null;
  currency: string | null;
  country: string | null;
  email: string;
  lastLoginAt: number | null;
  lastLoginAtDateTime: string | null;
}
