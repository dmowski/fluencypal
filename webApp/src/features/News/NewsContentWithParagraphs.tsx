'use client';

import { useCallback, useMemo, useState } from 'react';
import { Stack } from '@mui/material';
import {
  ReaderParagraph,
  ReaderParagraphSelectionPayload,
} from '../Reader/components/Paragraph/ReaderParagraph';
import { splitTextIntoParagraphs } from '../Reader/utils/splitParagraphsIntoPages';
import { SupportedLanguage } from '../Lang/lang';
import { useNewsVoice } from './useNewsVoice';
import { NewsPlayButton } from './NewsPlayButton';
import { useTranslate } from '../Translation/useTranslate';
import { NewsTranslationPopover } from './NewsTranslationPopover';

interface NewsContentWithParagraphsProps {
  content: string;
  languageCode: SupportedLanguage;
}

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
}: NewsContentWithParagraphsProps) => {
  const paragraphWords = useMemo(() => splitTextIntoParagraphs(content), [content]);
  const voice = useNewsVoice(languageCode);
  const { translateText, isTranslateAvailable } = useTranslate();
  const plainText = useMemo(
    () => stripMarkdownForAudio(paragraphWords.flat().join(' ')),
    [paragraphWords],
  );

  const [popover, setPopover] = useState<TranslationPopoverState | null>(null);

  const handleSelection = useCallback(
    async (payload: ReaderParagraphSelectionPayload) => {
      const text = payload.selectionText.trim();
      if (!text) return;

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
    [isTranslateAvailable, translateText],
  );

  const closePopover = useCallback(() => setPopover(null), []);

  if (paragraphWords.length === 0) return null;

  return (
    <Stack sx={{ gap: '30px', alignItems: 'flex-start' }}>
      <NewsPlayButton text={plainText} voice={voice} />

      {paragraphWords.map((words, index) => (
        <Stack key={index} sx={{ width: '100%', alignItems: 'flex-end', gap: '4px' }}>
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
