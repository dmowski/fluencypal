"use client";
import { useLingui } from "@lingui/react";
import Telegram from "@mui/icons-material/Telegram";
import { Button, Stack, Typography } from "@mui/material";
import { ArrowUp, Check, Compass, Copy } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useIsWebView } from "./useIsWebView";

export const WebViewWall = ({
  children,
  mode = "general",
}: {
  children: ReactNode;
  mode?: "interview" | "general";
}) => {
  const { isAndroid, inWebView, isTelegram, isTelegramApp, isTelegramAppMini } = useIsWebView();

  const { i18n } = useLingui();
  const [isShowInstruction, setIsShowInstruction] = useState(false);

  const [pageUrl, setPageUrl] = useState("");

  const openInstruction = () => {
    setIsShowInstruction(true);
    const browserFullUrl = window.location.href;
    setPageUrl(browserFullUrl);
  };

  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (!isCopied) {
      return;
    }
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, [isCopied]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      setIsCopied(true);
    } catch (err) {
      alert(i18n._("Failed to copy text. Please copy it manually."));
      console.error("Failed to copy text: ", err);
    }
  };

  const isShowWebViewWall = inWebView;
  if (!isShowWebViewWall) {
    return children;
  }

  if (isShowInstruction) {
    return (
      <Stack sx={{}}>
        <Stack sx={{ alignItems: "flex-end", gap: "10px", padding: "20px 15px 40px 10px" }}>
          <ArrowUp
            style={{
              opacity: 0.7,
            }}
          />
          <Stack
            sx={{
              paddingBottom: "20px",
            }}
          >
            <Typography align="right" sx={{ opacity: 0.8 }}>
              {isAndroid ? (
                <>
                  {i18n._("Please tap the menu ⋮ and choose")}
                  <br />
                  {i18n._("'Open in Chrome' to continue.")}
                </>
              ) : (
                <>
                  {i18n._("Please tap the menu ••• and choose")}
                  <br />
                  {i18n._("'Open in external Browser' to continue.")}
                </>
              )}
            </Typography>
          </Stack>

          <img
            src={
              isTelegram && isAndroid
                ? "/instruction/tgAndroid.png"
                : isTelegram && !isAndroid
                ? "/instruction/tgIos.png"
                : isAndroid
                ? "/instruction/instagramInstructionAndroid.png"
                : "/instruction/instagramInstruction.png"
            }
            alt="Instagram instruction"
            style={{
              width: "90%",
              boxShadow: "0px 0px 0 1px rgba(240, 240, 240, 0.7)",
              borderRadius: "10px",
              backgroundColor: "#111214",
              maxWidth: "400px",
            }}
          />

          <Stack
            sx={{
              width: "100%",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: "0px",
              paddingTop: "30px",
            }}
          >
            <Typography
              variant="caption"
              align="right"
              sx={{
                opacity: 0.7,
              }}
            >
              {pageUrl}
            </Typography>
            <Button
              color={isCopied ? "success" : "primary"}
              startIcon={isCopied ? <Check size="16px" /> : <Copy size="16px" />}
              variant="outlined"
              size="small"
              onClick={() => copyToClipboard(pageUrl)}
            >
              {isCopied ? i18n._("Copied") : i18n._("Copy page link")}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      sx={{
        gap: "0px",
        height: `calc(100dvh)`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: "0px",
          padding: "0 10px",
          minHeight: `calc(100dvh - 190px)`,
        }}
      >
        <img
          src={"/logo.jpeg"}
          style={{
            width: "180px",
            height: "30px",
          }}
        />
        <Stack
          sx={{
            alignItems: "center",
            paddingTop: "60px",
          }}
        >
          <p>isTelegram: {isTelegram ? "true" : "false"}</p>
          <p>isTelegramApp: {isTelegramApp ? "true" : "false"}</p>
          <p>isTelegramAppMini: {isTelegramAppMini ? "true" : "false"}</p>
          {mode === "general" && (
            <Typography align="center" variant="h6" component={"h1"}>
              {i18n._("AI speaking partner")}
            </Typography>
          )}

          {mode === "interview" && (
            <Typography align="center" variant="h6" component={"h1"}>
              {i18n._("Interview practice partner")}
            </Typography>
          )}

          <Typography align="center" variant="caption" sx={{ opacity: 0.7 }}>
            {i18n._("Let's choose how to start practicing")}
          </Typography>
        </Stack>
        <Stack
          sx={{
            gap: "15px",
            paddingTop: "20px",
            alignItems: "center",
          }}
        >
          {mode === "general" && (
            <Button
              variant="outlined"
              size="large"
              startIcon={<Telegram />}
              sx={{
                minWidth: "200px",
              }}
              href="https://t.me/FluencyPalBot/app"
            >
              {i18n._("Open in Telegram")}
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<Compass strokeWidth={"0.1rem"} />}
            size="large"
            sx={{
              minWidth: "200px",
            }}
            onClick={() => openInstruction()}
          >
            {i18n._("Open in Browser")}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
