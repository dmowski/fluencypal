'use client';

import { useCallback, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Stack } from '@mui/material';
import {
  ReaderParagraph,
  ReaderParagraphSelectionPayload,
} from '../Reader/components/Paragraph/ReaderParagraph';
import { splitTextIntoParagraphs } from '../Reader/utils/splitParagraphsIntoPages';
import { SupportedLanguage } from '../Lang/lang';
import { useNewsVoice, type NewsVoiceApi } from './useNewsVoice';
import { NewsPlayButton } from './NewsPlayButton';
import { useTranslate } from '../Translation/useTranslate';
import { NewsTranslationPopover } from './NewsTranslationPopover';

export type NewsArticleVoiceOverlay = {
  pauseForTranslation: () => void;
  resumeAfterTranslation: () => void;
};

interface NewsContentWithParagraphsProps {
  content: string;
  languageCode: SupportedLanguage;
  /** Imperative pause/resume for title translate modal in `NewsModal`. */
  translationVoiceRef?: MutableRefObject<NewsArticleVoiceOverlay | null>;
}

const useNewsTranslationVoiceOverlay = (voice: NewsVoiceApi): NewsArticleVoiceOverlay => {
  const pausedByOverlayRef = useRef(false);
  const overlayCountRef = useRef(0);

  const pauseForTranslation = useCallback(() => {
    overlayCountRef.current += 1;
    if (overlayCountRef.current === 1 && voice.isPlaying) {
      pausedByOverlayRef.current = true;
      voice.pause();
    }
  }, [voice.isPlaying, voice.pause]);

  const resumeAfterTranslation = useCallback(() => {
    overlayCountRef.current = Math.max(0, overlayCountRef.current - 1);
    if (overlayCountRef.current === 0 && pausedByOverlayRef.current) {
      pausedByOverlayRef.current = false;
      voice.resume();
    }
  }, [voice.resume]);

  return { pauseForTranslation, resumeAfterTranslation };
};

function stripMarkdownForAudio(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

type TranslationPopoverState = {
  anchorPosition: { top: number; left: number };
  translatedText: string | null;
  isLoading: boolean;
};

export const NewsContentWithParagraphs = ({
  content,
  languageCode,
  translationVoiceRef,
}: NewsContentWithParagraphsProps) => {
  const paragraphWords = useMemo(() => splitTextIntoParagraphs(content), [content]);
  const voice = useNewsVoice(languageCode);
  const translationVoiceOverlay = useNewsTranslationVoiceOverlay(voice);
  const { translateText, isTranslateAvailable } = useTranslate();
  const plainText = useMemo(
    () => stripMarkdownForAudio(paragraphWords.flat().join(' ')),
    [paragraphWords],
  );

  const [popover, setPopover] = useState<TranslationPopoverState | null>(null);

  if (translationVoiceRef) {
    translationVoiceRef.current = translationVoiceOverlay;
  }

  const handleSelection = useCallback(
    async (payload: ReaderParagraphSelectionPayload) => {
      const text = payload.selectionText.trim();
      if (!text) return;

      translationVoiceOverlay.pauseForTranslation();

      setPopover({
        anchorPosition: payload.anchorPosition,
        translatedText: null,
        isLoading: true,
      });

      if (!isTranslateAvailable) {
        setPopover((prev) => prev && { ...prev, isLoading: false });
        return;
      }

      try {
        const translated = await translateText({ text });
        setPopover((prev) =>
          prev ? { ...prev, translatedText: translated, isLoading: false } : null,
        );
      } catch {
        setPopover((prev) => prev && { ...prev, isLoading: false });
      }
    },
    [isTranslateAvailable, translateText, translationVoiceOverlay],
  );

  const closePopover = useCallback(() => {
    translationVoiceOverlay.resumeAfterTranslation();
    setPopover(null);
  }, [translationVoiceOverlay]);

  if (paragraphWords.length === 0) return null;

  return (
    <Stack sx={{ gap: '30px', alignItems: 'flex-start' }}>
      <NewsPlayButton text={plainText} voice={voice} />

      {paragraphWords.map((words, index) => (
        <Stack key={index} sx={{ width: '100%', alignItems: 'flex-start', gap: '4px' }}>
          <ReaderParagraph
            paragraphIndex={index}
            paragraphStartCharOffset={0}
            words={words}
            fontSize={30}
            lineHeight={1.5}
            justifyText={false}
            playText={() => undefined}
            onSelection={handleSelection}
            highlights={[]}
            onWordHover={undefined}
            hoverBgColor="rgba(255, 255, 255, 0.1)"
            textIndentDefault={0}
          />
        </Stack>
      ))}

      {popover && (
        <NewsTranslationPopover
          anchorPosition={popover.anchorPosition}
          isLoading={popover.isLoading}
          isTranslateAvailable={!!isTranslateAvailable}
          translatedText={popover.translatedText}
          onClose={closePopover}
        />
      )}
    </Stack>
  );
};
