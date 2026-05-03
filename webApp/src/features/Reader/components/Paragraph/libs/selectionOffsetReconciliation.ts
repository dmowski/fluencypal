export const reconcileSelectionOffsets = ({
  paragraphText,
  selectedText,
  rawStart,
  rawEnd,
}: {
  paragraphText: string;
  selectedText: string;
  rawStart: number | null;
  rawEnd: number | null;
}): { startInclusive: number; endExclusive: number } | null => {
  const normalizedSelected = selectedText.trim();
  if (!normalizedSelected) {
    return null;
  }

  let start = rawStart;
  let end = rawEnd;

  if (start === null || end === null) {
    const fallbackStart = paragraphText.indexOf(normalizedSelected);
    if (fallbackStart < 0) {
      return null;
    }
    start = fallbackStart;
    end = fallbackStart + normalizedSelected.length;
  }

  const boundedStart = Math.max(0, Math.min(start, paragraphText.length));
  const boundedEnd = Math.max(boundedStart + 1, Math.min(end, paragraphText.length));
  start = boundedStart;
  end = boundedEnd;

  const selectedLength = normalizedSelected.length;
  const extracted = paragraphText.slice(start, end);
  if (extracted === normalizedSelected) {
    return { startInclusive: start, endExclusive: end };
  }

  if (end < start + selectedLength) {
    end = Math.min(start + selectedLength, paragraphText.length);
  }

  const adjustedExtracted = paragraphText.slice(start, end);
  if (adjustedExtracted === normalizedSelected) {
    return { startInclusive: start, endExclusive: end };
  }

  const selectedInsideAdjusted = adjustedExtracted.indexOf(normalizedSelected);
  if (selectedInsideAdjusted >= 0) {
    start += selectedInsideAdjusted;
    end = Math.min(start + selectedLength, paragraphText.length);
    return { startInclusive: start, endExclusive: end };
  }

  const occurrences: number[] = [];
  let cursor = 0;
  while (cursor <= paragraphText.length) {
    const foundAt = paragraphText.indexOf(normalizedSelected, cursor);
    if (foundAt < 0) {
      break;
    }
    occurrences.push(foundAt);
    cursor = foundAt + 1;
  }

  if (occurrences.length === 0) {
    return { startInclusive: start, endExclusive: end };
  }

  const locatedAt = occurrences.reduce((best, current) =>
    Math.abs(current - start) < Math.abs(best - start) ? current : best,
  );

  return {
    startInclusive: locatedAt,
    endExclusive: Math.min(locatedAt + selectedLength, paragraphText.length),
  };
};
