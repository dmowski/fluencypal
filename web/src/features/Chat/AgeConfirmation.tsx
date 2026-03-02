import { useLingui } from '@lingui/react';
import { Stack, Typography, Button } from '@mui/material';

export const AgeConfirmationChatBlock = ({
  onConfirmed,
  onRefused,
}: {
  onConfirmed: () => void;
  onRefused: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: 'max-content',
        height: '100%',
        backgroundColor: 'rgba(4, 22, 43, 0.82)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(5px)',
        borderRadius: '12px',
        zIndex: 10,
        alignItems: 'center',
      }}
    >
      <Stack
        sx={{
          alignItems: 'center',
          padding: '60px 20px 60px 20px',

          gap: '20px',
          position: 'sticky',
          top: '0px',
        }}
      >
        <Stack
          sx={{
            gap: '10px',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800 }} textAlign={'center'}>
            {i18n._('Age Confirmation Required')}
          </Typography>
          <Typography
            align="center"
            sx={{
              textWrap: 'balance',
            }}
          >
            {i18n._(
              'This content may contain material that is not suitable for all ages. Please confirm that you are over 18 years old to proceed.',
            )}
          </Typography>
        </Stack>
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '20px',
            flexWrap: 'wrap',
          }}
        >
          <Button size="large" variant="contained" color="info" onClick={onConfirmed}>
            {i18n._('Yes, 18+ years old')}
          </Button>
          <Button size="large" variant="outlined" color="inherit" onClick={onRefused}>
            {i18n._('No, take me back')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
