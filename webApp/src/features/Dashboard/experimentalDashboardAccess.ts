import { isDev } from '../Analytics/isDev';

export const EXPERIMENTAL_DASHBOARD_USERNAMES: readonly string[] = [
  'Alex',
  'PluckySycamoreAssassin',
  'DynamicLagoonThinker',
  // Add game usernames here to enable the experimental dashboard section.
];

export const hasExperimentalDashboardAccess = (username: string | null | undefined) => {
  if (isDev()) return true;
  if (!username) return false;
  return EXPERIMENTAL_DASHBOARD_USERNAMES.includes(username);
};
