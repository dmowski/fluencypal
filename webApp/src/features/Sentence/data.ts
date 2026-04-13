import { Mode } from 'fs';
import { StoryState } from './types';

export const defaultStoryState: StoryState = {
  progress: '',
  sentences: [],
  sentencesTranslates: [],
  isCompleted: false,
  mode: 'easy',
  allWords: [],
  badWords: [],
  translationWords: [],
};

export const numberOfOptionsMap: Record<Mode, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};
export const pointsToWinMap: Record<Mode, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};
