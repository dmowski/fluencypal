import { SupportedLanguage } from "../features/Lang/lang";

export interface UserSettings {
  languageCode: SupportedLanguage | null;
  pageLanguageCode: SupportedLanguage | null;
  nativeLanguageCode: string | null;
  createdAt: number | null;
  currency: string | null;
  country: string | null;
  countryName: string | null;
  email: string;
  lastLoginAt: number | null;
  lastLoginAtDateTime: string | null;

  isGameOnboardingCompleted: boolean;
}
