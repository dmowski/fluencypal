import { useLingui } from '@lingui/react';
import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ArrowUp } from 'lucide-react';

export const ShowPreviousMessagesButton = ({ onClick }: { onClick: () => void }) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        padding: '0px 0 0 0px',
      }}
    >
      <Stack
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          paddingTop: '12px',
          paddingBottom: '3px',
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0px',
            cursor: 'pointer',
          }}
          onClick={onClick}
        >
          <Stack
            sx={{
              width: '65px',
              paddingLeft: '0px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '2px solid rgba(0, 0, 0, 1)',
                borderRadius: '50%',
                color: 'black',
                width: '22px',
                height: '22px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUp size={'14px'} strokeWidth={4} />
            </Stack>
          </Stack>

          <Typography
            sx={{
              opacity: 0.5,
            }}
            variant="body2"
          >
            {i18n._('Show previous')}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
