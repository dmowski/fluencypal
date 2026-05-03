import { HighlightedText } from '../../../model/types';

export const createSelectionFromRange = ({
  paragraphIndex,
  rawStart,
  rawEnd,
}: {
  paragraphIndex: number;
  rawStart: number;
  rawEnd: number;
}): HighlightedText => {
  const inclusiveEnd = rawEnd - 1;

  return {
    paragraphIndex,
    startIndex: Math.min(rawStart, inclusiveEnd),
    endIndex: Math.max(rawStart, inclusiveEnd),
    color: '',
  };
};
