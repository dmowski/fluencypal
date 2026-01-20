import { Stack } from "@mui/material";

interface StarContainerProps {
  children: React.ReactNode;
  minHeight?: string;
  paddingBottom?: string;
}

export const StarContainer = ({
  children,
  paddingBottom,
  minHeight,
}: StarContainerProps) => {
  return (
    <Stack
      sx={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10",
        paddingTop: "0px",
        minHeight: minHeight || "80vh",
        position: "relative",
        zIndex: 222,
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: paddingBottom || "120px",
          gap: "30px",
          top: "0px",
          boxSizing: "border-box",
          left: 0,
          right: 0,
          bottom: 0,
          height: "700px",

          width: "700px",
          maxWidth: "100vw",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          position: "relative",
          opacity: 0,

          animation: "fadeIn 2s ease-in-out 0s forwards",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        <Stack
          sx={{
            position: "absolute",
            top: "0px",
            width: "100%",
            height: "100%",
            zIndex: -2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            opacity: 1,
          }}
        >
          <img
            src="/star.webp"
            alt=""
            style={{ width: "100%", minWidth: "700px" }}
          />
        </Stack>
        {children}
      </Stack>
    </Stack>
  );
};
