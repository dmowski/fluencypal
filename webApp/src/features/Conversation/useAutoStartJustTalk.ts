import { useEffect, useRef } from 'react';
import { useUrlState } from '@/features/Url/useUrlState';
import { isJustTalkHandoff, JUST_TALK_HANDOFF_PARAM } from './justTalkHandoff';

export const useAutoStartJustTalk = (startJustTalk: () => Promise<void>) => {
  const [justTalk, setJustTalk] = useUrlState(JUST_TALK_HANDOFF_PARAM, '', false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isJustTalkHandoff(justTalk) || startedRef.current) {
      return;
    }
    startedRef.current = true;
    void setJustTalk('').then(() => startJustTalk());
  }, [justTalk, setJustTalk, startJustTalk]);
};
