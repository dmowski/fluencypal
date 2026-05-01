import { HighlightedText } from './types';

type MousePositionLike = {
  clientX: number;
  clientY: number;
};

export const getPointerPosition = (
  event: MousePositionLike,
  offsetX: number,
  offsetY: number,
): { x: number; y: number } => ({
  x: event.clientX + offsetX,
  y: event.clientY + offsetY,
});

export const getPopoverPositionFromRect = (rect: DOMRect): { top: number; left: number } => ({
  // MUI Popover anchorPosition expects viewport (client) coordinates.
  top: rect.bottom + 8,
  left: rect.left + rect.width / 2,
});

export const createSelectionFromRange = ({
  paragraphIndex,
  rawStart,
  rawEnd,
}: {
  paragraphIndex: number;
  rawStart: number;
  rawEnd: number;
}): HighlightedText => {
  // Selection API uses exclusive end offset.
  const inclusiveEnd = rawEnd - 1;

  return {
    paragraphIndex,
    startIndex: Math.min(rawStart, inclusiveEnd),
    endIndex: Math.max(rawStart, inclusiveEnd),
    color: '',
  };
};
