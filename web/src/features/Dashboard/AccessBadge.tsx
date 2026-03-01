import { Button, Stack, Typography } from '@mui/material';
import { Gem, Rocket, Sparkles } from 'lucide-react';
import { useUsage } from '../Usage/useUsage';
import { useLingui } from '@lingui/react';

export const AccessBadge = ({
  title,
  subTitle,
  buttonTitle,
}: {
  title: string;
  subTitle: string;
  buttonTitle: string;
}) => {
  const { i18n } = useLingui();
  const usage = useUsage();
  return (
    <Stack
      sx={{
        marginBottom: '20px',
        alignItems: 'center',
        gap: '25px',
        flexDirection: 'row',
        justifyContent: 'space-between',

        width: '100%',
        borderRadius: '16px',
        padding: '20px',
        background: 'linear-gradient(180deg, rgba(59,130,246,0.10) 0%, rgba(139,92,246,0.06) 100%)',

        border: '1px solid rgba(138, 25, 138, 0.1)',
        flexWrap: 'wrap',
        '@media (max-width:600px)': {
          borderRadius: '0px',
          padding: '20px 10px',
          border: 'none',
        },
        position: 'relative',
        overflow: 'hidden',
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
              fontSize: '22px',
            }}
          >
            {title}
          </Typography>
        </Stack>
        <Typography
          sx={{
            opacity: 0.7,
          }}
          variant="body2"
        >
          {subTitle}
        </Typography>
      </Stack>

      <Button
        color="success"
        onClick={() => usage.togglePaymentModal(true)}
        variant="contained"
        endIcon={<Rocket size={'18px'} />}
        sx={{
          padding: '10px 30px',
          background: 'linear-gradient(90deg, rgb(250, 255, 95) 0%, rgba(6,182,212,1) 100%)',
        }}
      >
        {buttonTitle}
      </Button>
    </Stack>
  );
};
