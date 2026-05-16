import { useUrlState } from '../Url/useUrlState';

/**
 * URL-state-backed controller for the News modal.
 *
 * Mirrors the pattern used by `useGlobalModals`: a single `newsId` query
 * parameter drives the open/closed state, so refreshing the page or sharing
 * the URL keeps the modal open on the right article.
 */
export const useNewsModal = () => {
  const [newsId, setNewsId] = useUrlState<string>('newsId', '', false);

  return {
    /** Currently selected news id, or empty string when the modal is closed. */
    newsId,
    isOpen: Boolean(newsId),
    openNews: (id: string) => {
      void setNewsId(id);
    },
    closeNews: () => {
      void setNewsId('');
    },
  };
};
