import { Stack, Typography } from "@mui/material";

export const WebCamFooter = ({ name }: { name: string }) => {
  return (
    <>
      <Stack
        sx={{
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "100%",
          height: "80px",
          background: "linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0,0,0,0))",
        }}
      ></Stack>

      <Stack
        sx={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          gap: "1px",
        }}
      >
        <Typography variant="body2" sx={{ color: "#fff", opacity: 0.9 }}>
          {name}
        </Typography>
      </Stack>
    </>
  );
};
