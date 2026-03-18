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
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
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
        <Button variant="text" onClick={onButtonClick} color="info">
          {buttonTitle}
        </Button>
      )}
    </Stack>
  );
};
