export interface Story {
  id: string;
  title: string;
  subtitle: string | null;

  videoUrl: string | null;
  originalVideoUrl: string | null;

  audioUrl: string | null;
  imageUrl: string;

  storySystemInstruction: string | null;
  textEn: string;
  sunoPrompt: string | null;
  videoDescription: string | null;

  isPublished: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

export type Mode = 'easy' | 'medium' | 'hard';

export interface StoryState {
  progress: string;
  sentences: string[];
  sentencesTranslates: string[];
  isCompleted: boolean;
  mode: Mode;
  allWords: string[];
  badWords: string[];
  translationWords: string[];
}

export interface StoryStat {
  viewsUserIds: string[];
}
