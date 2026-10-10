export const INTERACTIVE_LESSON_CARD_IMAGE =
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1789848137744-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

// crow: white bg: 'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1789847063127-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

export const INTERACTIVE_LESSON_DONE_CARD_IMAGE = INTERACTIVE_LESSON_CARD_IMAGE;

export const TARGET_CONTEXT_MESSAGES = 30;
export const MIN_USEFUL_CONTEXT_MESSAGES = 8;
export const MAX_CONVERSATIONS_TO_SCAN = 8;
export const MAX_HISTORY_LESSONS = 40;
export const PROGRESS_AUDIO_SAMPLE = 10;
export const PROGRESS_MIN_AUDIO_COUNT = 100;
export const OPEN_TALK_MIN_CHARS = 80;
export const LESSON_FEEDBACK_MIN_CHARS = 8;
/** Model-written feedback prompt must be at least this long before we keep it. */
export const LESSON_FEEDBACK_PROMPT_MIN_CHARS = 40;
export const LESSON_FEEDBACK_FALLBACK_MD = `How did this lesson feel, and what should we change next time?

Say if it was too hard, too easy, boring, or useful. Then say what you want in the next lesson: a grammar form, a topic, or anything to skip. Your own language is fine.`;
export const READ_ALOUD_MIN_CHARS = 50;
/** Generated long read-aloud passage (third part), not the spoken-transcript floor. */
export const READ_ALOUD_MIN_CONTENT_CHARS = 700;

export const THINKING_LABELS = ['Thinking', 'Understanding...', 'Analyzing'] as const;

export const LESSON_AI_MODEL = 'gpt-5.4' as const;
