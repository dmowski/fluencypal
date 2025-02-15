import { Stack } from "@mui/material";

interface StarContainerProps {
  children: React.ReactNode;
}

export const StarContainer = ({ children }: StarContainerProps) => {
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: "0px",
          gap: "30px",
          top: "90px",
          boxSizing: "border-box",
          left: 0,
          right: 0,
          bottom: 0,
          height: "700px",
          width: "700px",
          backgroundImage: "url('./star.webp')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          zIndex: 1,
          opacity: 0,

          animation: "fadeIn 2s ease-in-out 0s forwards",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
};
