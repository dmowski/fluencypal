import Stack from '@mui/material/Stack';
import { useTranslate } from '../../Translation/useTranslate';
import { Markdown } from '../../uiKit/Markdown/Markdown';

export const StoryContent = ({
  text,
  onPlayAudio,
  onTranslationWord,
  size = 'large',
}: {
  text: string;
  onPlayAudio?: (audioText: string, alternativeVoice: boolean) => void;
  onTranslationWord?: (word: string) => void;
  size?: 'normal' | 'large';
}) => {
  const translator = useTranslate();

  return (
    <Stack
      className="progress"
      sx={{
        '* p': {
          fontWeight: size === 'large' ? '700 !important' : '600 !important',
          lineHeight: '1.5 !important',
          textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
          fontSize: size === 'large' ? '38px !important' : '26px !important',

          '@media (max-width:600px)': {
            fontSize: size === 'large' ? '28px !important' : '24px !important',
          },
        },
      }}
    >
      {translator.translateModal}
      <Markdown
        onWordClick={
          translator.isTranslateAvailable
            ? (word, element) => {
                translator.translateWithModal(word, element);
                onPlayAudio?.(word, true);
                onTranslationWord?.(word);
              }
            : onPlayAudio
              ? (word) => {
                  onPlayAudio(word, true);
                  onTranslationWord?.(word);
                }
              : undefined
        }
        variant="conversation"
      >
        {text ? `\n${text}` : '...'}
      </Markdown>
    </Stack>
  );
};
