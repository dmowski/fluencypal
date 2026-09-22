import { useEffect, useRef, useState } from 'react';
import { peekJustTalkAutoStart } from './justTalkHandoff';

/**
 * After quiz → `/practice?justTalk=open`, start Just Talk only when mic was
 * primed on the confirm click (`fp_justTalkAutoStart` or consume-once
 * `autoStart=1` on the practice URL). Cold visits and sticky browser grants
 * alone do not auto-start — handoff Enable-mic is the fallback so
 * `/practice?justTalk=open` does not pop a permission dialog.
 */
export const useAutoStartJustTalk = (
  isHandoff: boolean,
  startJustTalk: () => Promise<unknown>,
) => {
  const startedRef = useRef(false);
  const startRef = useRef(startJustTalk);
  startRef.current = startJustTalk;
  const [isResolvingAutoStart, setIsResolvingAutoStart] = useState(false);

  useEffect(() => {
    if (!isHandoff) {
      startedRef.current = false;
      setIsResolvingAutoStart(false);
      return;
    }
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    if (!peekJustTalkAutoStart()) {
      setIsResolvingAutoStart(false);
      return;
    }

    setIsResolvingAutoStart(true);

    let cancelled = false;
    void (async () => {
      if (cancelled) {
        return;
      }
      try {
        await startRef.current();
      } finally {
        if (!cancelled) setIsResolvingAutoStart(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHandoff]);

  return { isResolvingAutoStart };
};
