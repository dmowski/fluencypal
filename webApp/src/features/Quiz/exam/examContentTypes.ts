export interface ExamMcChoice {
  label: string;
  correct?: boolean;
}

export interface ExamReadingPassage {
  passageText: string;
  questions: {
    questionText: string;
    choices: ExamMcChoice[];
    maxScore?: number;
  }[];
}

export interface ExamListeningItem {
  audioText: string;
  questionText: string;
  choices: ExamMcChoice[];
  maxScore?: number;
}

export interface ExamGrammarItem {
  segments: ({ kind: 'text'; text: string } | { kind: 'gap'; gapId: string })[];
  gaps: Record<string, ExamMcChoice[]>;
  maxScore?: number;
}

export interface ExamSpeakingImage {
  imageUrl: string;
  imageDescription: string;
  promptText: string;
}
