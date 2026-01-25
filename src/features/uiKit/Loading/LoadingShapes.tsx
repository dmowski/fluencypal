import { Stack } from '@mui/material';

export const LoadingShapes = ({
  sizes,
  containerHeight,
}: {
  sizes: string[];
  containerHeight?: string;
}) => {
  return (
    <Stack
      sx={{
        gap: '10px',
        height: containerHeight || 'auto',
      }}
    >
      {sizes.map((size, index) => (
        <Stack
          key={index}
          className="loading-shimmer-shape"
          sx={{
            minHeight: size,
            borderRadius: '6px',
          }}
        />
      ))}
    </Stack>
  );
};
