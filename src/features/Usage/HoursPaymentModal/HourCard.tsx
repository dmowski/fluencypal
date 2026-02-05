import { Stack, Typography, Button } from '@mui/material';

export const HourCard = ({
  onClick,
  label,
  content,
  buttonTitle,
  isRecommended,
  footnote,
}: {
  onClick: () => void;
  label: string;
  buttonTitle: string;
  content: string;
  isRecommended?: boolean;
  footnote: string;
}) => {
  return (
    <Stack
      sx={{
        width: '100%',
        backgroundColor: 'rgba(32, 137, 241, 0.1)',
        borderRadius: '7px',
      }}
    >
      <Stack
        sx={{
          backgroundColor: '#2089f1f7',
          borderRadius: '7px 7px 0 0',
          padding: '10px',
          alignItems: 'center',
          fontWeight: 600,
        }}
      >
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 500,
            color: '#fff',
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Stack
        sx={{
          alignItems: 'center',
          gap: '10px',
          padding: '40px 10px 30px 10px',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
          }}
        >
          {content}
        </Typography>
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 20px',
            width: '100%',
          }}
        >
          <Button
            fullWidth
            color="info"
            variant={isRecommended ? 'contained' : 'outlined'}
            onClick={onClick}
            size="large"
            sx={{
              padding: '10px 0',
            }}
          >
            {buttonTitle}
          </Button>
        </Stack>

        <Typography
          sx={{
            //width: '100%',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: '14px',
          }}
        >
          {footnote}
        </Typography>
      </Stack>
    </Stack>
  );
};
