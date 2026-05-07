import { useEffect } from 'react';

export const useDocumentTitle = (title: string | null | undefined) => {
  useEffect(() => {
    if (!title || typeof document === 'undefined') {
      return;
    }

    const previousTitle = document.title;
    const applyTitle = () => {
      if (document.title !== title) {
        document.title = title;
      }
    };

    applyTitle();

    const observer = new MutationObserver(() => {
      applyTitle();
    });
    observer.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      document.title = previousTitle;
    };
  }, [title]);
};