import { useUrlState } from '../Url/useUrlState';

/**
 * URL-state-backed controller for the News feed modal and article modal.
 *
 * Two URL params:
 * - `newsFeed=open`  — the feed list modal is open
 * - `newsId={id}`   — a specific article is open (implies feed is also open)
 */
export const useNewsModal = () => {
  const [newsId, setNewsId] = useUrlState<string>('newsId', '', false);
  const [newsFeedParam, setNewsFeedParam] = useUrlState<string>('newsFeed', '', false);

  return {
    /** Currently selected news id, or empty string when the article modal is closed. */
    newsId,
    /** Whether the article modal is open. */
    isOpen: Boolean(newsId),
    /** Whether the feed list modal is open (true when article is open too). */
    isFeedOpen: newsFeedParam === 'open' || Boolean(newsId),
    openNews: (id: string) => {
      void setNewsFeedParam('open');
      void setNewsId(id);
    },
    /** Close only the article modal; the feed stays open. */
    closeNews: () => {
      void setNewsId('');
    },
    openFeed: () => {
      void setNewsFeedParam('open');
    },
    /** Close the feed (and the article if open). */
    closeFeed: () => {
      void setNewsFeedParam('');
      void setNewsId('');
    },
  };
};
