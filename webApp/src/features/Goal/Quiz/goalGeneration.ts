import { fnv1aHash } from '@/libs/hash';

const inFlightGoalHashes = new Set<string>();

export const goalAboutHash = (about: string): string => {
  const trimmed = about.trim();
  if (!trimmed) return '';
  return fnv1aHash(trimmed);
};

/**
 * One plan per about-you text. A second call while that text is already
 * generating, or after its plan is saved, does not start another request.
 * Returns the hash to generate, or null when generation should not start.
 */
export const claimGoalGeneration = (
  about: string,
  savedGoalHash: string | null | undefined,
): string | null => {
  const hash = goalAboutHash(about);
  if (!hash) return null;
  if (hash === (savedGoalHash || '')) return null;
  if (inFlightGoalHashes.has(hash)) return null;
  inFlightGoalHashes.add(hash);
  return hash;
};

export const releaseGoalGeneration = (hash: string): void => {
  inFlightGoalHashes.delete(hash);
};

export const resetGoalGenerationClaims = (): void => {
  inFlightGoalHashes.clear();
};
