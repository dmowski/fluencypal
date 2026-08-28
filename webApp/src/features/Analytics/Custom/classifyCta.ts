export const CTA_INTENTS = ['quiz', 'signin', 'practice', 'pricing', 'other'] as const;
export type CtaIntent = (typeof CTA_INTENTS)[number];

export type CtaClassification = {
  ctaId: string;
  ctaIntent: CtaIntent;
};

export const classifyCta = (input: {
  href?: string;
  buttonId?: string;
  buttonText?: string;
}): CtaClassification => {
  const buttonId = (input.buttonId || '').trim();
  const href = (input.href || input.buttonText || '').toLowerCase();
  const id = buttonId.toLowerCase();

  if (id.includes('sign-in') || id.includes('signin') || id === 'header-sign-in') {
    return { ctaId: buttonId || 'header-sign-in', ctaIntent: 'signin' };
  }
  if (id.includes('returning') || id === 'returning-practice') {
    return { ctaId: buttonId || 'returning-practice', ctaIntent: 'signin' };
  }
  if (id.includes('quiz') || href.includes('/quiz')) {
    return { ctaId: buttonId || 'quiz', ctaIntent: 'quiz' };
  }
  if (href.includes('/pricing') || href.includes('/price')) {
    return { ctaId: buttonId || 'pricing', ctaIntent: 'pricing' };
  }
  if (href.includes('/practice')) {
    return { ctaId: buttonId || 'practice', ctaIntent: 'practice' };
  }
  if (buttonId) {
    return { ctaId: buttonId, ctaIntent: 'other' };
  }
  return { ctaId: 'other', ctaIntent: 'other' };
};
