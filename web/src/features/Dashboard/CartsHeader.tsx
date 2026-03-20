import { Button, Stack, Typography } from '@mui/material';

export const SectionHeader = ({
  title,
  subTitle,
  buttonTitle,
  onButtonClick,
}: {
  title: string;
  subTitle?: string;
  buttonTitle?: string;
  onButtonClick?: () => void;
}) => {
  return (
    <Stack
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'flex-start',
        '@media (max-width: 400px)': {
          gridTemplateColumns: '1fr',
          gap: '10px',
        },
      }}
    >
      <Stack>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
        {subTitle && (
          <Typography
            variant="body1"
            sx={{
              opacity: 0.8,
            }}
          >
            {subTitle}
          </Typography>
        )}
      </Stack>

      {buttonTitle && (
        <Button
          variant="text"
          onClick={onButtonClick}
          color="info"
          sx={{
            whiteSpace: 'nowrap',
            width: 'max-content',
          }}
        >
          {buttonTitle}
        </Button>
      )}
    </Stack>
  );
};
