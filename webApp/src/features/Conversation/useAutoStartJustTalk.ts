import { useEffect, useRef } from 'react';
import { isMicrophoneGranted } from '@/libs/mic';

export const useAutoStartJustTalk = (
  isHandoff: boolean,
  startJustTalk: () => Promise<unknown>,
) => {
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isHandoff) {
      startedRef.current = false;
      return;
    }
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    void isMicrophoneGranted().then((granted) => {
      if (granted) {
        void startJustTalk();
      }
    });
  }, [isHandoff, startJustTalk]);
};
