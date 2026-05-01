const FONT_SIZE_PRECISION_PX = 0.25;
const WIDTH_SAFETY_MARGIN_PX = 2;
const MAX_BOUNDARY_SEARCH_STEPS = 24;

const snapDownToPrecision = (value: number) => {
  return Math.floor(value / FONT_SIZE_PRECISION_PX) * FONT_SIZE_PRECISION_PX;
};

type FitTextToWidthParams = {
  availableWidth: number;
  measureCandidateWidth: (fontSizePx: number) => number;
  measureRenderedWidth: (fontSizePx: number) => number;
};

export const fitTextToWidth = ({
  availableWidth,
  measureCandidateWidth,
  measureRenderedWidth,
}: FitTextToWidthParams) => {
  const targetWidth = Math.max(availableWidth - WIDTH_SAFETY_MARGIN_PX, 0);

  if (!targetWidth) return undefined;

  let low = FONT_SIZE_PRECISION_PX;
  let high = FONT_SIZE_PRECISION_PX;
  let bestFit = FONT_SIZE_PRECISION_PX;

  for (let step = 0; step < MAX_BOUNDARY_SEARCH_STEPS; step += 1) {
    const width = measureCandidateWidth(high);

    if (width > targetWidth) {
      break;
    }

    bestFit = high;
    low = high;
    high *= 2;
  }

  while (high - low > FONT_SIZE_PRECISION_PX) {
    const mid = (low + high) / 2;
    const width = measureCandidateWidth(mid);

    if (width <= targetWidth) {
      bestFit = mid;
      low = mid;
      continue;
    }

    high = mid;
  }

  bestFit = snapDownToPrecision(bestFit);

  while (bestFit > FONT_SIZE_PRECISION_PX && measureRenderedWidth(bestFit) > targetWidth) {
    bestFit = Math.max(bestFit - FONT_SIZE_PRECISION_PX, FONT_SIZE_PRECISION_PX);
  }

  let growLow = bestFit;
  let growHigh = bestFit + FONT_SIZE_PRECISION_PX;

  for (let step = 0; step < MAX_BOUNDARY_SEARCH_STEPS; step += 1) {
    if (measureRenderedWidth(growHigh) > targetWidth) {
      break;
    }

    growLow = growHigh;
    growHigh *= 2;
  }

  bestFit = growLow;

  while (growHigh - growLow > FONT_SIZE_PRECISION_PX) {
    const mid = (growLow + growHigh) / 2;

    if (measureRenderedWidth(mid) <= targetWidth) {
      bestFit = mid;
      growLow = mid;
      continue;
    }

    growHigh = mid;
  }

  bestFit = snapDownToPrecision(bestFit);

  while (measureRenderedWidth(bestFit + FONT_SIZE_PRECISION_PX) <= targetWidth) {
    bestFit += FONT_SIZE_PRECISION_PX;
  }

  return bestFit;
};
