import { useEffect, useState } from 'react';
import { ReaderLibraryCategory } from '../model/library';
import { fetchReaderLibraryCategories } from '../api/libraryRequests';

export const useReaderLibrary = () => {
  const [categories, setCategories] = useState<ReaderLibraryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadLibrary = async () => {
      try {
        setIsLoading(true);
        setError('');

        const categoriesResponse = await fetchReaderLibraryCategories({ signal: controller.signal });
        setCategories(categoriesResponse);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setError(error instanceof Error ? error.message : 'Failed to load library.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadLibrary();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    categories,
    isLoading,
    error,
  };
};
