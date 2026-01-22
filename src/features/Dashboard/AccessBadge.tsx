import { Button, Stack, Typography } from '@mui/material';
import { Gem } from 'lucide-react';
import { useUsage } from '../Usage/useUsage';
import { useLingui } from '@lingui/react';

export const AccessBadge = ({ title, subTitle }: { title: string; subTitle: string }) => {
  const { i18n } = useLingui();
  const usage = useUsage();
  return (
    <Stack
      sx={{
        marginBottom: '20px',
        alignItems: 'center',
        gap: '10px',
        flexDirection: 'row',
        justifyContent: 'space-between',

        width: '100%',
        borderRadius: '16px',
        padding: '20px',
        backgroundColor: 'rgba(138, 25, 138, 0.099)',
        border: '1px solid rgba(138, 25, 138, 0.2)',
        flexWrap: 'wrap',
        '@media (max-width:600px)': {
          borderRadius: '0px',
          padding: '20px 10px',
          border: 'none',
        },
      }}
    >
      <Stack>
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            //justifyContent: "center",
            gap: '15px',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
        </Stack>
        <Typography
          sx={{
            opacity: 0.7,
          }}
          variant="caption"
        >
          {subTitle}
        </Typography>
      </Stack>
      <Button
        color="warning"
        onClick={() => usage.togglePaymentModal(true)}
        variant="contained"
        endIcon={<Gem />}
        sx={{
          padding: '10px 30px',
        }}
      >
        {i18n._('Upgrade Now')}
      </Button>
    </Stack>
  );
};
