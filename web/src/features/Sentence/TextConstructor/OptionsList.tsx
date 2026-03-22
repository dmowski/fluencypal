import { useConversationAudio } from '@/features/Audio/useConversationAudio';
import { Button, Stack } from '@mui/material';

export const OptionsList = ({
  options,
  handlePick,
  wrongWord,
}: {
  options: string[];
  handlePick: (word: string) => void;
  wrongWord: string | null;
}) => {
  const audio = useConversationAudio();
  return (
    <Stack
      direction="row"
      sx={{
        gap: '8px',
        width: '100%',
        flexWrap: 'wrap',
        py: '8px',
      }}
    >
      {options.map((word) => {
        const isWrongWord = wrongWord === word;

        return (
          <Button
            key={word}
            onClick={() => {
              audio.initAudio();
              handlePick(word);
            }}
            variant={'contained'}
            color={isWrongWord ? 'error' : 'info'}
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              minHeight: '24px',
              minWidth: '40px',
              fontSize: '17px',
              padding: '5px 15px',
            }}
          >
            {word}
          </Button>
        );
      })}
    </Stack>
  );
};
