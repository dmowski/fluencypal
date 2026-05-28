'use client';

import { useMemo } from 'react';
import { Stack } from '@mui/material';
import { ReaderParagraph } from '../Reader/components/Paragraph/ReaderParagraph';
import { splitTextIntoParagraphs } from '../Reader/utils/splitParagraphsIntoPages';
import { SupportedLanguage } from '../Lang/lang';
import { useNewsVoice } from './useNewsVoice';
import { NewsPlayButton } from './NewsPlayButton';

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

export const NewsContentWithParagraphs = ({
  content,
  languageCode,
}: NewsContentWithParagraphsProps) => {
  const paragraphWords = useMemo(() => splitTextIntoParagraphs(content), [content]);
  const voice = useNewsVoice(languageCode);
  const plainText = useMemo(
    () => stripMarkdownForAudio(paragraphWords.flat().join(' ')),
    [paragraphWords],
  );
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
            onSelection={(payload) => {
              console.log(payload);
            }}
            highlights={[]}
            onWordHover={undefined}
          />
        </Stack>
      ))}
    </Stack>
  );
};
