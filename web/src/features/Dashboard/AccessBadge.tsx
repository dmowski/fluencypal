import { Button, Stack, Typography } from '@mui/material';
import { EyeClosed, EyeOff, Gem, MicOff, Rocket, Sparkles, VolumeOff } from 'lucide-react';
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
        zIndex: 2,
      }}
    >
      <Stack gap="5px">
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            //justifyContent: "center",
            gap: '10px',
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
          <VolumeOff size={'18px'} color={'#fff'} />
        </Stack>
        <Typography
          sx={{
            opacity: 1,
          }}
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
          fontWeight: 500,
          background: 'linear-gradient(90deg, rgb(54, 243, 63) 0%, rgb(85, 212, 6) 100%)',
        }}
      >
        {buttonTitle}
      </Button>
    </Stack>
  );
};
