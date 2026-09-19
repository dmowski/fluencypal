export const QUIZ_TALK_MODE = 'quiz-talk' as const;
export const QUIZ_TALK_ABOUT_KEY = 'fp_quizTalkAbout';
export const MAX_QUIZ_TALK_ABOUT_CHARS = 400;

export const clipQuizTalkAbout = (raw: string | null | undefined): string => {
  const text = String(raw || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  if (text.length <= MAX_QUIZ_TALK_ABOUT_CHARS) return text;
  return `${text.slice(0, MAX_QUIZ_TALK_ABOUT_CHARS)}…`;
};

export const markQuizTalkAbout = (about: string | null | undefined): void => {
  if (typeof window === 'undefined') return;
  const clipped = clipQuizTalkAbout(about);
  if (!clipped) {
    window.sessionStorage.removeItem(QUIZ_TALK_ABOUT_KEY);
    return;
  }
  window.sessionStorage.setItem(QUIZ_TALK_ABOUT_KEY, clipped);
};

export const readQuizTalkAbout = (): string => {
  if (typeof window === 'undefined') return '';
  return clipQuizTalkAbout(window.sessionStorage.getItem(QUIZ_TALK_ABOUT_KEY));
};
