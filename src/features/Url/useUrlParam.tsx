import { scrollTopFast } from '@/libs/scroll';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useUrlParam = (paramName: string) => {
  const [internalValue, setInternalValue] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const isUrlValue = searchParams.get(paramName) === 'true';
  const router = useRouter();

  useEffect(() => {
    if (isUrlValue && !internalValue) {
      setInternalValue(true);
      return;
    }

    if (!isUrlValue && internalValue) {
      setInternalValue(false);
    }
  }, [isUrlValue]);

  const setValue = (value: boolean) => {
    setInternalValue(value);
    setIsLoading(true);

    const searchParams = new URLSearchParams(window.location.search);
    if (value) {
      searchParams.set(paramName, 'true');
    } else {
      searchParams.delete(paramName);
    }
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;

    router.push(`${newUrl}`, { scroll: false });

    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  return [internalValue, setValue, isLoading] as const;
};

export interface SetUrlStateOptions {
  redirect?: boolean;
}

export const useUrlMapState = (defaultValue: Record<string, string>, scrollToTop: boolean) => {
  const [internalValue, setInternalValue] = useState<Record<string, string>>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const urlPage = useMemo(
    () => convertSearchParamToMap(searchParams, defaultValue),
    [searchParams.toString(), defaultValue],
  );
  const router = useRouter();

  useEffect(() => {
    if (!isEqualMaps(urlPage, internalValue)) {
      setInternalValue(urlPage);
    }
  }, [urlPage]);

  const setValue = useCallback(
    async (patchValue: Record<string, string>, options?: SetUrlStateOptions) => {
      const value = { ...internalValue, ...patchValue };
      if (isEqualMaps(value, internalValue)) return Promise.resolve(null);
      setInternalValue(value);
      setIsLoading(true);

      return new Promise<string>((resolve) => {
        setTimeout(() => {
          const newUrl = convertMapToNewUrl(value, defaultValue);

          if (options?.redirect !== false) {
            router.push(`${newUrl}`, { scroll: false });
          }

          scrollToTop && scrollTopFast();
          setTimeout(() => {
            setIsLoading(false);
            resolve(newUrl);
          }, 10);
        }, 20);
      });
    },
    [internalValue, router, defaultValue, scrollToTop],
  );

  return [internalValue, setValue, isLoading] as const;
};

const isEqualMaps = (map1: Record<string, string>, map2: Record<string, string>) => {
  const keys1 = Object.keys(map1);
  const keys2 = Object.keys(map2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (map1[key] !== map2[key]) return false;
  }
  return true;
};

const convertSearchParamToMap = (
  searchParams: ReadonlyURLSearchParams,
  defaultMap: Record<string, string>,
) => {
  const keys = Object.keys(defaultMap);

  const urlMap: Record<string, string> = { ...defaultMap };

  for (const key of keys) {
    urlMap[key] = (searchParams.get(key) || defaultMap[key]) as string;
  }

  return urlMap;
};

const convertMapToNewUrl = (record: Record<string, string>, defaultMap: Record<string, string>) => {
  const newSearchParams = new URLSearchParams(window.location.search);
  for (const key in record) {
    const isDefault = record[key] === defaultMap[key];
    if (!isDefault) {
      newSearchParams.set(key, String(record[key]));
    } else {
      newSearchParams.delete(key);
    }
  }

  const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
  return newUrl;
};
