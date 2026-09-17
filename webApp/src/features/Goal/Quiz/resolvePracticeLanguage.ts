import { SupportedLanguage } from '@/features/Lang/lang';

export const resolvePracticeLanguage = ({
  explicitLanguage,
  settingsLanguage,
  pendingLanguage,
  pageLanguage,
}: {
  explicitLanguage?: SupportedLanguage | null;
  settingsLanguage: SupportedLanguage | null | undefined;
  pendingLanguage: SupportedLanguage | null | undefined;
  pageLanguage?: SupportedLanguage | null;
}): SupportedLanguage =>
  explicitLanguage || settingsLanguage || pendingLanguage || pageLanguage || 'en';
