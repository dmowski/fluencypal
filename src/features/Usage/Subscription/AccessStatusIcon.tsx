import { Stack } from '@mui/material';
import { Loader, X, Check, MicOff } from 'lucide-react';

export const AccessStatusIcon = ({ state }: { state: 'loading' | 'full-access' | 'no-access' }) => {
  return (
    <Stack
      sx={{
        height: '40px',
        width: '40px',
        borderRadius: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          state === 'loading'
            ? 'rgba(255, 255, 255, 0.06)'
            : state === 'no-access'
              ? 'linear-gradient(120deg, rgb(164, 17, 64) 0%, rgb(161, 51, 139) 100%)'
              : 'linear-gradient(45deg, #63b187 0%, #7bd5a1 100%)',
      }}
    >
      {state === 'loading' && <Loader color="#fff" size={'21px'} strokeWidth={'4px'} />}
      {state === 'no-access' && <MicOff color="#fff" size={'21px'} strokeWidth={'2.5px'} />}
      {state === 'full-access' && <Check color="#fff" size={'21px'} strokeWidth={'4px'} />}
    </Stack>
  );
};
