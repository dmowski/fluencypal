import { IconButton } from '@mui/material';
import { Pause, Play } from 'lucide-react';
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLingui } from '@lingui/react';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { waitForVisibleReaderPageTextFromDom } from '../utils/getVisibleReaderPageTextFromDom';

const PAGE_VOICE_OVER_ADVANCE_DELAY_MS = 1000;

type ReaderVoiceOverPageButtonProps = {
  speech: ReturnType<typeof useBrowserSpeech>;
  visible: boolean;
  activePage: number;
  isLastPage: boolean;
  getNextActivePage: () => number;
  onGoToNextPage: () => void;
};

export const ReaderVoiceOverPageButton = ({
  speech,
  visible,
  activePage,
  isLastPage,
  getNextActivePage,
  onGoToNextPage,
}: ReaderVoiceOverPageButtonProps) => {
  const { i18n } = useLingui();
  const [isPageVoiceOverPlaying, setIsPageVoiceOverPlaying] = useState(false);
  const isAutoReadingPagesRef = useRef(false);
  const autoAdvanceTargetPageRef = useRef<number | null>(null);
  const previousActivePageRef = useRef(activePage);
  const continueTimeoutRef = useRef<number | null>(null);
  const isLastPageRef = useRef(isLastPage);
  const speechRef = useRef(speech);
  speechRef.current = speech;
  isLastPageRef.current = isLastPage;

  const clearContinueTimeout = useCallback(() => {
    if (continueTimeoutRef.current == null) return;
    window.clearTimeout(continueTimeoutRef.current);
    continueTimeoutRef.current = null;
  }, []);

  const endAutoReadingSession = useCallback(() => {
    isAutoReadingPagesRef.current = false;
    autoAdvanceTargetPageRef.current = null;
    clearContinueTimeout();
    setIsPageVoiceOverPlaying(false);
  }, [clearContinueTimeout]);

  const handleUtteranceEndRef = useRef<() => void>(() => {});

  const playCurrentPage = useCallback(async () => {
    const pageText = await waitForVisibleReaderPageTextFromDom();
    if (!isAutoReadingPagesRef.current) return;

    if (!pageText.trim()) {
      endAutoReadingSession();
      return;
    }

    const didEnqueue = speechRef.current.play(pageText, null, {
      onStart: () => {
        setIsPageVoiceOverPlaying(true);
      },
      onEnd: () => {
        handleUtteranceEndRef.current();
      },
    });

    if (!didEnqueue) {
      endAutoReadingSession();
    }
  }, [endAutoReadingSession]);

  const handleUtteranceEnd = useCallback(() => {
    if (!isAutoReadingPagesRef.current) return;

    if (isLastPageRef.current) {
      endAutoReadingSession();
      return;
    }

    autoAdvanceTargetPageRef.current = getNextActivePage();
    onGoToNextPage();

    continueTimeoutRef.current = window.setTimeout(() => {
      continueTimeoutRef.current = null;
      if (!isAutoReadingPagesRef.current) return;
      void playCurrentPage();
    }, PAGE_VOICE_OVER_ADVANCE_DELAY_MS);
  }, [endAutoReadingSession, getNextActivePage, onGoToNextPage, playCurrentPage]);

  handleUtteranceEndRef.current = handleUtteranceEnd;

  useEffect(() => {
    const previousPage = previousActivePageRef.current;
    previousActivePageRef.current = activePage;

    if (previousPage === activePage) return;

    if (
      autoAdvanceTargetPageRef.current !== null &&
      activePage === autoAdvanceTargetPageRef.current
    ) {
      autoAdvanceTargetPageRef.current = null;
      return;
    }

    if (!isAutoReadingPagesRef.current) return;

    endAutoReadingSession();
    speechRef.current.stop();
  }, [activePage, endAutoReadingSession]);

  useEffect(() => {
    if (visible) return;
    endAutoReadingSession();
    speechRef.current.stop();
  }, [visible, endAutoReadingSession]);

  useEffect(() => () => clearContinueTimeout(), [clearContinueTimeout]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isAutoReadingPagesRef.current) {
      endAutoReadingSession();
      speechRef.current.stop();
      return;
    }

    isAutoReadingPagesRef.current = true;
    setIsPageVoiceOverPlaying(true);
    void playCurrentPage();
  };

  if (!visible) {
    return null;
  }

  return (
    <IconButton
      data-testid="voice-over-current-page-button"
      onClick={handleClick}
      aria-label={i18n._('Voice over current page')}
      aria-pressed={isPageVoiceOverPlaying}
      sx={{
        position: 'fixed',
        top: '113px',
        left: '5px',
        zIndex: 3,
        height: '54px',
        width: '54px',
        backgroundColor: 'transparent',
        color: isPageVoiceOverPlaying ? '#333' : 'rgba(51, 51, 51, 0.75)',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
        '@media (max-width: 700px)': {
          display: 'none',
        },
      }}
    >
      {isPageVoiceOverPlaying ? <Pause size={18} /> : <Play size={18} />}
    </IconButton>
  );
};
