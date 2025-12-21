import { NativeLangCode } from "@/libs/language/type";
import { SupportedLanguage } from "../features/Lang/lang";
import { UserSource } from "./analytics";

export interface InitUserSettings {
  createdAt: number | null;
  createdAtIso: string | null;
  currency: string | null;
  email: string | null;
  country: string | null;
  countryName: string | null;
  userSource: UserSource | null;
}

export type AppMode = "interview" | "learning";

export interface UserSettings extends InitUserSettings {
  languageCode: SupportedLanguage | null;
  pageLanguageCode: SupportedLanguage | null;
  nativeLanguageCode: NativeLangCode | null;
  lastLoginAtDateTime: string | null;

  isGameOnboardingCompleted: boolean;

  photoUrl: string | null;
  displayName: string | null;

  isCreditCardConfirmed: boolean | null;

  appMode: AppMode | null;
}

export interface UserSettingsWithId extends UserSettings {
  id: string;
}
