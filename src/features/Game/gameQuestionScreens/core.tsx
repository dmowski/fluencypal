import { Stack } from "@mui/material";

export const GameContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack
      sx={{
        gap: "25px",
        width: "100%",
        height: "100%",
        maxWidth: "600px",
        padding: "0px 10px",
        "@media (max-width: 600px)": {
          padding: "30px 10px 90px 10px",
        },
      }}
    >
      {children}
    </Stack>
  );
};
