import { Stack, Typography } from '@mui/material';

export const SectionHeader = ({ title, subTitle }: { title: string; subTitle?: string }) => {
  return (
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
  );
};
