export const bookLandingTitle = 'FluencyPal Books – Read, Translate & Learn English';

export const bookLandingDescription =
  'Upload EPUBs, translate words instantly, highlight passages, listen with text-to-speech, and sync your reading library across devices. A focused reader built for language learners.';

export const bookLandingIntroParagraph =
  'FluencyPal Books is a web-based EPUB reader for language learners. Upload your own ebooks, import free classics from Project Gutenberg, translate words with a click, highlight passages, listen with text-to-speech, and pick up on any device where you left off.';

export type BookLandingFaqItem = {
  question: string;
  answer: string;
};

export const bookLandingFaqItems: BookLandingFaqItem[] = [
  {
    question: 'What file formats does FluencyPal Books support?',
    answer:
      'You can upload EPUB files directly. PDF and Word (DOCX) documents can be converted into a readable format inside the app. Your library syncs across devices once you sign in.',
  },
  {
    question: 'Can I translate words while reading?',
    answer:
      'Yes. Click any word to see an instant translation, or turn on hover translation to preview meanings as you move through the text. It is designed for reading in English while learning.',
  },
  {
    question: 'Is FluencyPal Books free to use?',
    answer:
      'FluencyPal Books is free to use. You can upload your own books, browse public-domain titles from the Gutenberg library, and use core reading features including translation, highlights, and text-to-speech.',
  },
  {
    question: 'Does my reading progress sync across devices?',
    answer:
      'Yes. Your library, reading position, and highlights sync when you are signed in, so you can start on one device and continue on another.',
  },
  {
    question: 'How is FluencyPal Books different from FluencyPal speaking practice?',
    answer:
      'FluencyPal Books is a focused ebook reader for learning through reading — translate words, highlight passages, and listen aloud. The main FluencyPal app at app.fluencypal.com is for AI speaking practice and conversation.',
  },
  {
    question: 'Can I try the reader before signing up?',
    answer:
      'Yes. The landing page includes a live demo of the real reader with a public-domain excerpt from The Great Gatsby. Open the demo to click words, highlight text, and try text-to-speech without creating an account.',
  },
];

export const landingDemoExcerpt =
  'In my younger and more vulnerable years my father gave me some advice that I\'ve been turning over in my mind ever since. "Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven\'t had the advantages that you\'ve had."';

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
