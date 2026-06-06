export type ExamCefrLevel = 'a2' | 'b1' | 'b2';

export interface ExamLevelConfig {
  estimatedMinutes: number;
  readingCount: number;
  listeningCount: number;
  grammarCount: number;
  speakingCount: number;
  speakingMinWords: number;
}

export const EXAM_LEVEL_CONFIG: Record<ExamCefrLevel, ExamLevelConfig> = {
  a2: {
    estimatedMinutes: 45,
    readingCount: 6,
    listeningCount: 6,
    grammarCount: 8,
    speakingCount: 3,
    speakingMinWords: 25,
  },
  b1: {
    estimatedMinutes: 50,
    readingCount: 7,
    listeningCount: 7,
    grammarCount: 9,
    speakingCount: 4,
    speakingMinWords: 30,
  },
  b2: {
    estimatedMinutes: 60,
    readingCount: 8,
    listeningCount: 8,
    grammarCount: 10,
    speakingCount: 5,
    speakingMinWords: 35,
  },
};

export const buildManualExamId = (
  targetLanguageCode: string,
  level: ExamCefrLevel,
): string => `exam_${targetLanguageCode}_${level}`;
