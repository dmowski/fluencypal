export const CTA_INTENTS = ['quiz', 'signin', 'practice', 'pricing', 'other'] as const;
export type CtaIntent = (typeof CTA_INTENTS)[number];

export type CtaClassification = {
  ctaId: string;
  ctaIntent: CtaIntent;
};

const pathOfHref = (href: string): string => {
  const raw = href.trim();
  if (!raw) return '';
  try {
    if (/^https?:\/\//i.test(raw)) return new URL(raw).pathname.toLowerCase();
    return raw.split('?')[0].toLowerCase();
  } catch {
    return raw.split('?')[0].toLowerCase();
  }
};

const pathHasSegment = (path: string, segment: string): boolean => {
  return new RegExp(`(^|/)${segment}(/|$)`, 'i').test(path);
};

export const classifyCta = (input: { href?: string; buttonId?: string }): CtaClassification => {
  const buttonId = (input.buttonId || '').trim();
  const path = pathOfHref(input.href || '');
  const id = buttonId.toLowerCase();

  if (id.includes('sign-in') || id.includes('signin') || id === 'header-sign-in') {
    return { ctaId: buttonId || 'header-sign-in', ctaIntent: 'signin' };
  }
  if (id.includes('returning') || id === 'returning-practice') {
    return { ctaId: buttonId || 'returning-practice', ctaIntent: 'signin' };
  }
  if (id.includes('quiz') || pathHasSegment(path, 'quiz')) {
    return { ctaId: buttonId || 'quiz', ctaIntent: 'quiz' };
  }
  if (pathHasSegment(path, 'pricing') || pathHasSegment(path, 'price')) {
    return { ctaId: buttonId || 'pricing', ctaIntent: 'pricing' };
  }
  if (pathHasSegment(path, 'practice')) {
    return { ctaId: buttonId || 'practice', ctaIntent: 'practice' };
  }
  if (buttonId) {
    return { ctaId: buttonId, ctaIntent: 'other' };
  }
  return { ctaId: 'other', ctaIntent: 'other' };
};
