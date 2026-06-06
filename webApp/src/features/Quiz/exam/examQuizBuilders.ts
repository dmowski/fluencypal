import {
  FillGapDefinition,
  FillGapSegment,
  QuizOption,
} from '../types';

export const buildMcOptions = (
  questionId: string,
  choices: { label: string; correct?: boolean }[],
): { options: QuizOption[]; correctOptionId: string } => {
  let correctOptionId = '';
  const options = choices.map((choice, index) => {
    const id = `${questionId}-opt-${index}`;
    if (choice.correct) {
      correctOptionId = id;
    }
    return { id, label: choice.label };
  });

  if (!correctOptionId && options[0]) {
    correctOptionId = options[0].id;
  }

  return { options, correctOptionId };
};

export const buildFillGapOptions = (
  gapId: string,
  choices: { label: string; correct?: boolean }[],
): FillGapDefinition => {
  const { options, correctOptionId } = buildMcOptions(gapId, choices);
  return { options, correctOptionId };
};

export const buildFillGapQuestion = (
  questionId: string,
  segments: FillGapSegment[],
  gaps: Record<string, { label: string; correct?: boolean }[]>,
): {
  segments: FillGapSegment[];
  gaps: Record<string, FillGapDefinition>;
} => {
  const normalizedGaps = Object.fromEntries(
    Object.entries(gaps).map(([gapKey, choices]) => {
      const gapId = `${questionId}-gap-${gapKey}`;
      return [gapId, buildFillGapOptions(gapId, choices)];
    }),
  );

  const normalizedSegments = segments.map((segment) =>
    segment.kind === 'text'
      ? segment
      : { kind: 'gap' as const, gapId: `${questionId}-gap-${segment.gapId}` },
  );

  return { segments: normalizedSegments, gaps: normalizedGaps };
};
