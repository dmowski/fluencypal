import { scrollTopFast } from '@/libs/scroll';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useUrlState = <T,>(paramName: string, defaultValue: T, scrollToTop: boolean) => {
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const urlPage = (searchParams.get(paramName) || defaultValue) as T;
  const router = useRouter();

  useEffect(() => {
    if (urlPage !== internalValue) {
      setInternalValue(urlPage);
    }
  }, [urlPage]);

  const setValue = async (value: T) => {
    if (value == internalValue) return;

    setInternalValue(value);
    const isDefault = value === defaultValue;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsLoading(true);

        const newSearchParams = new URLSearchParams(window.location.search);
        if (!isDefault) {
          newSearchParams.set(paramName, `${value}`);
        } else {
          newSearchParams.delete(paramName);
        }
        const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;

        router.push(`${newUrl}`, { scroll: false });
        scrollToTop && scrollTopFast();

        setTimeout(() => {
          setIsLoading(false);
          resolve();
        }, 200);
      }, 20);
    });
  };

  return [internalValue, setValue, isLoading] as const;
};
