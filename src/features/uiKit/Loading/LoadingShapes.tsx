import { Stack } from "@mui/material";

export const LoadingShapes = ({ sizes }: { sizes: string[] }) => {
  return (
    <Stack
      sx={{
        gap: "10px",
      }}
    >
      {sizes.map((size, index) => (
        <Stack
          key={index}
          className="loading-shimmer-shape"
          sx={{
            minHeight: size,
            borderRadius: "6px",
          }}
        />
      ))}
    </Stack>
  );
};
