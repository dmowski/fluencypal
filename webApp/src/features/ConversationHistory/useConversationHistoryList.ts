'use client';

import { useCallback, useState } from 'react';
import { Conversation } from '@/features/Conversation/conversation';
import { useChatHistory } from './useChatHistory';

export const useConversationHistoryList = () => {
  const chatHistory = useChatHistory();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadInitialPage = useCallback(async () => {
    setLoading(true);
    setHasError(false);

    try {
      const page = await chatHistory.getConversationsPage({});
      setConversations(page.conversations);
      setHasMore(page.hasMore);
      setNextCursor(page.nextCursor);
      setIsLoaded(true);
    } catch (loadError) {
      console.error('Error loading conversation history:', loadError);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [chatHistory]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || nextCursor === null) {
      return;
    }

    setLoadingMore(true);
    setHasError(false);

    try {
      const page = await chatHistory.getConversationsPage({ cursor: nextCursor });
      setConversations((current) => [...current, ...page.conversations]);
      setHasMore(page.hasMore);
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      console.error('Error loading more conversation history:', loadError);
      setHasError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [chatHistory, hasMore, loadingMore, nextCursor]);

  const reset = useCallback(() => {
    setConversations([]);
    setLoading(false);
    setLoadingMore(false);
    setHasMore(false);
    setNextCursor(null);
    setHasError(false);
    setIsLoaded(false);
  }, []);

  return {
    conversations,
    hasError,
    hasMore,
    isLoaded,
    loadInitialPage,
    loadMore,
    loading,
    loadingMore,
    reset,
  };
};
