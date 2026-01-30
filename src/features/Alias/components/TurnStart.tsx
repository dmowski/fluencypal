'use client';

import { Container, Stack, Typography } from '@mui/material';

export const TurnStart = () => {
  return (
    <Container maxWidth="md" data-testid="turn-start">
      <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h4">Turn Start</Typography>
        <Typography variant="body1" color="text.secondary">
          Coming soon...
        </Typography>
      </Stack>
    </Container>
  );
};
