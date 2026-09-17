import { useEffect, useRef, useState } from 'react';
import { isMicrophoneGranted } from '@/libs/mic';
import { consumeJustTalkAutoStart, peekJustTalkAutoStart } from './justTalkHandoff';

/**
 * After quiz → `/practice?justTalk=open`, start Just Talk when mic was primed
 * on the confirm click (session flag) or the Permissions API already says granted.
 * Handoff Enable-mic stays as the fallback when neither applies.
 */
export const useAutoStartJustTalk = (
  isHandoff: boolean,
  startJustTalk: () => Promise<unknown>,
) => {
  const startedRef = useRef(false);
  const startRef = useRef(startJustTalk);
  startRef.current = startJustTalk;
  const [isResolvingAutoStart, setIsResolvingAutoStart] = useState(isHandoff);

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
    setIsResolvingAutoStart(true);

    let cancelled = false;
    void (async () => {
      const fromQuizPrime = peekJustTalkAutoStart();
      const shouldStart = fromQuizPrime || (await isMicrophoneGranted());
      if (cancelled) {
        return;
      }
      if (!shouldStart) {
        setIsResolvingAutoStart(false);
        return;
      }
      if (fromQuizPrime) {
        consumeJustTalkAutoStart();
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
