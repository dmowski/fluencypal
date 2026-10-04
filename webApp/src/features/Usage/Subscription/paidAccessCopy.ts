import { I18n } from '@lingui/core';

export const formatPaidAccessHours = (hours: number, i18n: I18n): string => {
  if (hours === 0.5) return i18n._('30 minutes');
  if (hours === 1) return i18n._('1 hour');
  return i18n._('{count} hours', { count: hours });
};
