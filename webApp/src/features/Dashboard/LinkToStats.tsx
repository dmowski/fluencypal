import { Button, Stack } from '@mui/material';
import { useAuth } from '../Auth/useAuth';
import { ChevronRight } from 'lucide-react';

export const LinkToStatsAdmin = () => {
  const auth = useAuth();
  const isFounder = auth.isFounder;
  if (!isFounder) {
    return null;
  }

  return (
    <Stack direction="row">
      <Button href={`/staats`} variant="contained" endIcon={<ChevronRight />}>
        View Admin Stats
      </Button>
    </Stack>
  );
};
