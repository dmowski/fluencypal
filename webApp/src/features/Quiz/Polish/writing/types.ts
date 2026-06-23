import { WritingTaskGenre } from '../../types';

export interface PolishB1WritingTask {
  promptText: string;
  minWords: number;
  maxWords: number;
  taskGenre: WritingTaskGenre;
  imageUrl?: string;
  imageDescription?: string;
}

export interface PolishB1WritingVariant {
  variantId: string;
  label: string;
  /** Short note for authors — which official patterns inspired this variant. */
  inspirationNote: string;
  tasks: [PolishB1WritingTask, PolishB1WritingTask];
}
