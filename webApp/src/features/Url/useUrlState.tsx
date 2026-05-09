import { scrollTopFast } from '@/libs/scroll';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUrlStateContext } from './UrlStateContext';

export const useUrlState = <T,>(paramName: string, defaultValue: T, scrollToTop: boolean) => {
  const { urlStateMap, setUrlState } = useUrlStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const urlPage = (searchParams.get(paramName) || defaultValue) as T;
  const router = useRouter();

  const internalValue = (urlStateMap[paramName] || defaultValue) as T;

  useEffect(() => {
    if (urlPage !== internalValue) {
      setUrlState(paramName, urlPage);
    }
  }, [urlPage]);

  const setValue = async (value: T) => {
    if (value == internalValue) return;

    const isDefault = value === defaultValue;

    // Update the URL synchronously BEFORE notifying the context so the
    // `useEffect` below — which re-reads `searchParams` — never observes the
    // stale URL while internal state has already moved on. Without this, the
    // effect would copy the still-present query value back into the context
    // and resurrect the previous state (e.g. `activeBookId` lingering after
    // closing a book).
    setUrlState(paramName, value);

    const newSearchParams = new URLSearchParams(window.location.search);
    if (!isDefault) {
      newSearchParams.set(paramName, `${value}`);
    } else {
      newSearchParams.delete(paramName);
    }

    const urlSearchParams = newSearchParams.toString() ? '?' + newSearchParams.toString() : '';
    const newUrl = `${window.location.pathname}${urlSearchParams}`;

    const currentUrl = window.location.pathname + window.location.search;

    if (currentUrl !== newUrl) {
      router.push(`${newUrl}`, { scroll: false });
    }

    scrollToTop && scrollTopFast();

    return new Promise<void>((resolve) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        resolve();
      }, 200);
    });
  };

  return [internalValue, setValue, isLoading] as const;
};
