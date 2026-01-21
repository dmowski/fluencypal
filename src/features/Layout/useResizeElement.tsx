import { useEffect, useRef, useState } from 'react';

export const useResizeElement = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const checkSize = (component: T) => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect && entry.contentRect.height) {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    observer.observe(component);

    return () => {
      observer.disconnect();
    };
  };

  const isExists = ref.current !== null;

  useEffect(() => {
    if (!ref.current) return;

    const disconnect = checkSize(ref.current);

    return () => {
      disconnect();
    };
  }, [isExists]);

  return { ref, size };
};
