export interface ReaderProgressInput {
  activePage: number;
  pageCount: number;
  isTwoColumnLayout: boolean;
}

export interface ReaderProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
}

/**
 * Computes the reader progress for display.
 * In two-column layout, pages are shown as spreads, so currentPage and
 * totalPages are divided by 2 (rounded up).
 */
export function getReaderProgress({
  activePage,
  pageCount,
  isTwoColumnLayout,
}: ReaderProgressInput): ReaderProgress {
  const currentPage = isTwoColumnLayout ? Math.ceil(activePage / 2) : activePage;
  const totalPages = isTwoColumnLayout ? Math.ceil(pageCount / 2) : pageCount;
  const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return { currentPage, totalPages, percentage };
}
