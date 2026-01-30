'use client';

import { Stack, Typography, Container } from '@mui/material';

export const CategorySelection = () => {
  return (
    <Container maxWidth="md" data-testid="category-selection">
      <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h4">Category Selection</Typography>
        <Typography variant="body1" color="text.secondary">
          Coming soon...
        </Typography>
      </Stack>
    </Container>
  );
};
