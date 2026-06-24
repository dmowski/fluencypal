export type BookLandingFeature = {
  title: string;
  description: string;
  icon: 'book' | 'translate' | 'highlight' | 'speech' | 'library' | 'sync';
};

export type BookLandingStep = {
  step: string;
  title: string;
  description: string;
};

export const bookLandingFeatures: BookLandingFeature[] = [
  {
    icon: 'book',
    title: 'Bring your own books',
    description:
      'Upload EPUB files or convert PDF and DOCX. Your library stays in your account and syncs across devices.',
  },
  {
    icon: 'translate',
    title: 'Instant word translation',
    description:
      'Click any word to see a translation, or enable hover translation while you read. Built for language learners.',
  },
  {
    icon: 'highlight',
    title: 'Highlights and notes',
    description:
      'Select passages, color-code highlights, and jump back to them later from the highlights panel.',
  },
  {
    icon: 'speech',
    title: 'Listen as you read',
    description:
      'Hear words and sentences spoken aloud with browser text-to-speech. Pick a voice that matches your study language.',
  },
  {
    icon: 'library',
    title: 'Free classics from Gutenberg',
    description:
      'Browse curated public-domain titles and add them to your shelf in one click — no file hunt required.',
  },
  {
    icon: 'sync',
    title: 'Progress that follows you',
    description:
      'Reading position, highlights, and your library sync so you can pick up on another device right where you left off.',
  },
];

export const bookLandingSteps: BookLandingStep[] = [
  {
    step: '1',
    title: 'Add a book',
    description: 'Drop an EPUB, import from the Gutenberg library, or convert a PDF or Word document.',
  },
  {
    step: '2',
    title: 'Read and explore',
    description:
      'Click words for translation, highlight passages, listen with text-to-speech, and navigate by chapter.',
  },
  {
    step: '3',
    title: 'Keep learning',
    description: 'Your progress and notes are saved automatically so every reading session builds on the last.',
  },
];
