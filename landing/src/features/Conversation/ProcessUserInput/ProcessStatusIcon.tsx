import { Stack } from '@mui/material';
import { Loader, ShieldAlert, Check } from 'lucide-react';

export const ProcessStatusIcon = ({ state }: { state: 'loading' | 'correct' | 'incorrect' }) => {
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
            : state === 'incorrect'
              ? 'linear-gradient(45deg, #2b3cadff 0%, #4e5ec3ff 100%)'
              : 'linear-gradient(45deg, #63b187 0%, #7bd5a1 100%)',
      }}
    >
      {state === 'loading' && <Loader color="#fff" size={'21px'} strokeWidth={'4px'} />}
      {state === 'incorrect' && <ShieldAlert color="#fff" size={'21px'} strokeWidth={'2.3px'} />}
      {state === 'correct' && <Check color="#fff" size={'21px'} strokeWidth={'4px'} />}
    </Stack>
  );
};
