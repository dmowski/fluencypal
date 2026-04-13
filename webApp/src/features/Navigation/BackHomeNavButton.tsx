import { useLingui } from '@lingui/react';
import { Button, Stack } from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const BackHomeNavButton = () => {
  const { i18n } = useLingui();

  const router = useRouter();
  const close = async () => {
    const searchParams = new URLSearchParams();
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    router.push(newUrl, {
      scroll: true,
    });
  };

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
          onClick={close}
          color="info"
          startIcon={<ChevronLeft size={18} />}
        >
          {i18n._('Back')}
        </Button>
      </Stack>
    </Stack>
  );
};
