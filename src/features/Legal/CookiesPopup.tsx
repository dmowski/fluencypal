"use client";
import { Button, Stack, Typography } from "@mui/material";
import { setCookiesGDPR } from "../Firebase/init";
import { useLocalStorage } from "react-use";
import { useEffect, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { SupportedLanguage } from "@/common/lang";

interface CookiesPopupProps {
  message: string;
  ok: string;
  no: string;
  privacy: string;
  lang: SupportedLanguage;
}
export const CookiesPopup = ({ message, ok, no, privacy, lang }: CookiesPopupProps) => {
  const [isClosedStore, setClosedStore] = useLocalStorage("cookiesPopup", false);
  const [isClosed, setClosed] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    setClosed(isClosedStore || false);
  }, [isClosedStore]);

  if (isClosed || auth.isAuthorized || auth.loading) return <></>;

  const onReject = () => {
    console.log("onReject CookiesPopup");
    setCookiesGDPR(false);
    setClosedStore(true);
  };

  const onAccept = () => {
    console.log("onAccept CookiesPopup");
    setCookiesGDPR(true);
    setClosedStore(true);
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
        <Typography variant="caption" sx={{ color: "#fff", maxWidth: "800px", lineHeight: "1.2" }}>
          {message}
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            position: "relative",
            zIndex: 9999999,
          }}
        >
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              onAccept();
            }}
          >
            {ok}
          </Button>
          <Button size="small" onClick={onReject}>
            {no}
          </Button>
          <Button href={`/${lang}/privacy`} size="small">
            {privacy}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
