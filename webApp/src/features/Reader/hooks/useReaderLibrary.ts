import { useEffect, useState } from 'react';
import { ReaderLibraryCategory } from '../model/library';

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

        const response = await fetch('/api/reader/library', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load library.');
        }

        const data = (await response.json()) as {
          categories?: ReaderLibraryCategory[];
        };

        setCategories(Array.isArray(data.categories) ? data.categories : []);
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
