'use client';

import { Container, Stack, Typography } from '@mui/material';

export const RoundSettings = () => {
  return (
    <Container maxWidth="md" data-testid="round-settings">
      <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h4">Round Settings</Typography>
        <Typography variant="body1" color="text.secondary">
          Coming soon...
        </Typography>
      </Stack>
    </Container>
  );
};
