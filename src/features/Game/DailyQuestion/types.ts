export interface DailyQuestion {
  title: string;
  description: string;
  exampleAnswer: string;
  hints: string[];
  minWords: number;
}

export type DailyQuestions = Record<string, DailyQuestion>;
