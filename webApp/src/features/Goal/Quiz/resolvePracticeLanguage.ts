import { SupportedLanguage } from '@/features/Lang/lang';

export const resolvePracticeLanguage = ({
  settingsLanguage,
  pendingLanguage,
  pageLanguage,
}: {
  settingsLanguage: SupportedLanguage | null | undefined;
  pendingLanguage: SupportedLanguage | null | undefined;
  pageLanguage?: SupportedLanguage | null;
}): SupportedLanguage => settingsLanguage || pendingLanguage || pageLanguage || 'en';
