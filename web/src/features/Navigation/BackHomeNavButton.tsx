import { useLingui } from '@lingui/react';
import { Button, Stack } from '@mui/material';
import { useAppNavigation } from './useAppNavigation';
import { ChevronLeft } from 'lucide-react';

export const BackHomeNavButton = () => {
  const { i18n } = useLingui();
  const appNavigation = useAppNavigation();

  return (
    <Stack
      component={'nav'}
      sx={{
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        zIndex: 999,
        marginBottom: '40px',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: '700px',
          padding: '10px',
          position: 'relative',
          alignItems: 'flex-start',
        }}
      >
        <Button
          variant="outlined"
          onClick={() => appNavigation.setCurrentPage('home')}
          color="info"
          startIcon={<ChevronLeft size={18} />}
        >
          {i18n._('Back')}
        </Button>
      </Stack>
    </Stack>
  );
};
