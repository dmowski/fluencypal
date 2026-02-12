import { Stack, Typography } from '@mui/material';
import { TextConstructorPlayground } from '@/features/Sentence/TextConstructorPlayground';

export default function TextConstructorTestPage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <Stack sx={{}}>
          <TextConstructorPlayground />
        </Stack>
      </body>
    </html>
  );
}
