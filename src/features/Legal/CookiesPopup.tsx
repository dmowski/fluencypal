"use client";
import { Button, Link, Stack, Typography } from "@mui/material";
import { setCookiesGDPR } from "../Firebase/init";
import { useLocalStorage } from "react-use";
import { useEffect, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { supportedLanguages } from "@/features/Lang/lang";
import { getUrlStart } from "../Lang/getUrlStart";
import { usePathname } from "next/navigation";

export const CookiesPopup = () => {
  const message = `We use cookies to personalize content, analyze our traffic, and provide you with a good user experience. You can accept/reject non-essential cookies.`;
  const ok = "Ok";
  const no = "No";
  const privacy = "Policy";

  const [isClosedStore, setClosedStore] = useLocalStorage("cookiesPopup_v1", false);
  const [isClosed, setClosed] = useState(true);
  const auth = useAuth();
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const langPart = pathParts[1];
  const lang = supportedLanguages.find((l) => l === langPart) || "en";

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
        padding: "1px 0px 0px 0px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderTop: "1px solid rgba(0, 0, 0, 0.4)",
        zIndex: 9999999,
        boxSizing: "border-box",
      }}
    >
      <Stack
        sx={{
          maxWidth: "1600px",
          boxSizing: "border-box",
          flexDirection: "row",
          columnGap: "20px",
          alignItems: "center",
          padding: "0px 3px",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#fff",
            maxWidth: "890px",
            lineHeight: "1.1",
            opacity: 0.8,
            fontSize: "0.7rem",
            "@media (max-width: 600px)": {
              width: "calc(100%)",
            },
          }}
        >
          {message}{" "}
          <Link
            href={`${getUrlStart(lang)}cookies`}
            target="_blank"
            rel="noreferrer"
            sx={{
              padding: "0px",
            }}
          >
            {privacy}
          </Link>
        </Typography>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "2px",
            alignItems: "center",
            position: "relative",
            zIndex: 9999999,
            "@media (max-width: 600px)": {
              flexDirection: "column",
            },
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
          <Button
            size="small"
            onClick={onReject}
            sx={{
              padding: "0px",
              fontSize: "0.7rem",
            }}
          >
            {no}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
