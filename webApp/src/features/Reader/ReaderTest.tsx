import { Stack } from '@mui/material';
import { Reader } from './Reader';
import { ReaderData } from './types';

export const ReaderTest = () => {
  const data: ReaderData = {
    title: 'The Great Gatsby',
    subtitle: 'A novel by F. Scott Fitzgerald',
    category: 'Story',
    content: `The desert had always belonged to the twin suns.
Every morning, they rose together — one golden and bright, the other pale and silver. The villagers believed the two suns kept balance in the world. If one ever disappeared, the elders said, the desert would wake up.
Arin did not fully believe the old stories, but he respected them. Each evening, he climbed the tallest dune outside the village to watch the twin sunsets. The golden sun set first, painting the sand in fire. The silver sun followed slowly, covering the desert in soft blue light.
That was how it had always been.
Until the day the silver sun stopped moving.
Arin noticed it first. The golden sun slipped below the horizon as usual, but the silver one remained in the sky — frozen, unmoving, trembling like a reflection in disturbed water.`,
  };

  return (
    <Stack
      sx={{
        padding: '40px',
      }}
    >
      <Stack
        sx={{
          borderRadius: '10px',
          overflow: 'hidden',
          minHeight: '900px',
          flex: '1 1 0',
        }}
      >
        <Reader data={data} />
      </Stack>
    </Stack>
  );
};
