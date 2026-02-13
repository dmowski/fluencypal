import { Stack, Typography } from '@mui/material';
import { TextConstructorPlayground } from '@/features/Sentence/TextConstructorPlayground';
import { PracticeProvider } from '../practiceProvider';

export default function TextConstructorTestPage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <Stack sx={{}}>
          <PracticeProvider>
            <TextConstructorPlayground />
          </PracticeProvider>
        </Stack>
      </body>
    </html>
  );
}
