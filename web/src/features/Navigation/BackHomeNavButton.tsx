import { useLingui } from '@lingui/react';
import { Button, Stack } from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const BackHomeNavButton = () => {
  const { i18n } = useLingui();
  const router = useRouter();

  const backHome = async () => {
    const searchParams = new URLSearchParams();

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl === newUrl) {
      return;
    }
    router.push(newUrl);
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
          onClick={backHome}
          color="info"
          startIcon={<ChevronLeft size={18} />}
        >
          {i18n._('Back')}
        </Button>
      </Stack>
    </Stack>
  );
};
