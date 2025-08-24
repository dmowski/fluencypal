import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const useUrlParam = (paramName: string) => {
  const [internalValue, setInternalValue] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const isUrlValue = searchParams.get(paramName) === "true";
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
      searchParams.set(paramName, "true");
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
