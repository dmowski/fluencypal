import { IconButton } from '@mui/material';
import { CirclePlay, CircleStop, Pause, Play } from 'lucide-react';
import { type MouseEvent, useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { getVisibleReaderPageTextFromDom } from '../utils/getVisibleReaderPageTextFromDom';

type ReaderVoiceOverPageButtonProps = {
  speech: ReturnType<typeof useBrowserSpeech>;
  visible: boolean;
  activePage: number;
};

export const ReaderVoiceOverPageButton = ({
  speech,
  visible,
  activePage,
}: ReaderVoiceOverPageButtonProps) => {
  const { i18n } = useLingui();
  const [isPageVoiceOverPlaying, setIsPageVoiceOverPlaying] = useState(false);

  useEffect(() => {
    if (!speech.isPlaying) {
      setIsPageVoiceOverPlaying(false);
    }
  }, [speech.isPlaying]);

  useEffect(() => {
    if (!isPageVoiceOverPlaying) return;
    speech.stop();
    setIsPageVoiceOverPlaying(false);
  }, [activePage]);

  useEffect(() => {
    if (visible) return;
    setIsPageVoiceOverPlaying(false);
    speech.stop();
  }, [visible, speech]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isPageVoiceOverPlaying) {
      speech.stop();
      setIsPageVoiceOverPlaying(false);
      return;
    }

    const pageText = getVisibleReaderPageTextFromDom();
    if (!pageText.trim()) return;

    speech.play(pageText);
    setIsPageVoiceOverPlaying(true);
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
