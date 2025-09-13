import { NativeLangCode } from "@/libs/language/type";
import { SupportedLanguage } from "../features/Lang/lang";

export interface UserSettings {
  languageCode: SupportedLanguage | null;
  pageLanguageCode: SupportedLanguage | null;
  nativeLanguageCode: NativeLangCode | null;
  createdAt: number | null;
  createdAtIso: string | null;
  currency: string | null;
  country: string | null;
  countryName: string | null;
  email: string;
  lastLoginAtDateTime: string | null;

  isGameOnboardingCompleted: boolean;

  photoUrl: string | null;
  displayName: string | null;
}

export interface UserSettingsWithId extends UserSettings {
  id: string;
}
