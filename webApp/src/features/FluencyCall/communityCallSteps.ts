import { supportedLanguages } from '@/features/Lang/lang';

export const communityCallStepIds = [
  'language',
  'calls',
  'native',
  'pageLanguage',
  'account',
  'membership',
  'waiting',
] as const;

export type CommunityCallStep = (typeof communityCallStepIds)[number];

export function communityCallPath({
  includePageLanguage,
  includeAccount,
  includeMembership,
}: {
  includePageLanguage: boolean;
  includeAccount: boolean;
  includeMembership: boolean;
}): CommunityCallStep[] {
  return communityCallStepIds.filter((step) => {
    if (step === 'pageLanguage') return includePageLanguage;
    if (step === 'account') return includeAccount;
    if (step === 'membership') return includeMembership;
    return true;
  });
}

/** A native language that is already a site language does not need a page-language step. */
export function needsCommunityCallPageLanguage(nativeLanguage: string): boolean {
  if (!nativeLanguage) return false;
  return !(supportedLanguages as readonly string[]).includes(nativeLanguage);
}

export function resolveCommunityCallStep(
  step: string,
  path: readonly CommunityCallStep[],
): CommunityCallStep {
  if (path.includes(step as CommunityCallStep)) return step as CommunityCallStep;
  const requestedIndex = communityCallStepIds.indexOf(step as CommunityCallStep);
  if (requestedIndex === -1) return path[0] ?? 'language';
  const next = communityCallStepIds.slice(requestedIndex + 1).find((item) => path.includes(item));
  return next ?? path[path.length - 1] ?? 'language';
}

export function nextCommunityCallStep(
  step: CommunityCallStep,
  path: readonly CommunityCallStep[],
): CommunityCallStep | null {
  const index = path.indexOf(step);
  if (index < 0 || index >= path.length - 1) return null;
  return path[index + 1] ?? null;
}

export function previousCommunityCallStep(
  step: CommunityCallStep,
  path: readonly CommunityCallStep[],
): CommunityCallStep | null {
  const index = path.indexOf(step);
  if (index <= 0) return null;
  return path[index - 1] ?? null;
}
