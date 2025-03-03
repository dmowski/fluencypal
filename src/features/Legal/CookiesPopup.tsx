"use client";
import { Button, Stack, Typography } from "@mui/material";
import { setCookiesGDPR } from "../Firebase/init";
import { useLocalStorage } from "react-use";

export const CookiesPopup = () => {
  const [isClosed, setClosed] = useLocalStorage("cookiesPopup", false);

  if (isClosed) return null;

  const onReject = () => {
    setCookiesGDPR(false);
    setClosed(true);
  };

  const onAccept = () => {
    setCookiesGDPR(true);
    setClosed(true);
  };

  return (
    <Stack
      sx={{
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        padding: "5px 0px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderTop: "1px solid rgba(255, 255, 255, 0.4)",
        zIndex: 9999999,
        boxSizing: "border-box",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1400px",
          boxSizing: "border-box",
          flexDirection: "row",
          columnGap: "20px",

          alignItems: "center",
          padding: "2px 10px",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="caption" sx={{ color: "#fff" }}>
          We use cookies to ensure that we give you the best experience on our website. If you
          continue to use this site we will assume that you are happy with it
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              onAccept();
            }}
          >
            Ok
          </Button>
          <Button size="small" onClick={onReject}>
            No
          </Button>
          <Button href="/privacy" size="small">
            Privacy Policy
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
