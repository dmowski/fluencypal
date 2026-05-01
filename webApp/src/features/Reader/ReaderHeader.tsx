import { Stack, Typography } from '@mui/material';

export const ReaderHeader = ({
  title,
  subtitle,
  activePage,
  pageCount,
  category,
}: {
  title: string;
  subtitle: string;
  activePage: number;
  pageCount: number;
  category: string;
}) => {
  return (
    <Stack
      sx={{
        width: '100%',
        '*': {
          fontFamily: 'serif',
        },
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {`${activePage} of ${pageCount}`}
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'right' }}>
          {category}
        </Typography>
      </Stack>

      <Stack>
        <Typography variant="h2" sx={{ fontWeight: 500, textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{}}>
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  );
};
