import { SupportedLanguage } from '@/features/Lang/lang';
import { QuizDocument } from '../types';

export interface PolishB1VariantOption {
  variantId: string;
  label: string;
  quiz: QuizDocument;
}

export interface PolishB1VariantExamGroup {
  kind: 'writing-group' | 'speaking-group';
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  targetLanguageCode: SupportedLanguage;
  variants: PolishB1VariantOption[];
  /** Shown in variant picker helper text. */
  taskSummary: string;
}
