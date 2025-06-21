"use client";

import { useState, MouseEvent, useEffect } from "react";
import { useAuth } from "../Auth/useAuth";
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ChevronLeft, Crown, LogOutIcon, MessageCircleQuestion, Wallet } from "lucide-react";

import { useUsage } from "../Usage/useUsage";
import { PaymentModal } from "../Usage/PaymentModal";
import { NeedHelpModal } from "./NeedHelpModal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getUrlStart } from "../Lang/getUrlStart";
import { convertHoursToHumanFormat } from "@/libs/convertHoursToHumanFormat";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { LanguageSwitcher } from "../Lang/LanguageSwitcher";
import { useSettings } from "../Settings/useSettings";
import { useGame } from "../Game/useGame";
import { exitFullScreen } from "@/libs/fullScreen";

export function HeaderPractice({ lang }: { lang: SupportedLanguage }) {
  const auth = useAuth();
  const pathname = usePathname();
  const settings = useSettings();
  const game = useGame();
  const isGameWinner = game.isGameWinner;

  const aiConversation = useAiConversation();
  const { i18n } = useLingui();

  const isLanding = !(
    pathname.startsWith("/practice") || pathname.startsWith(`${getUrlStart(lang)}practice`)
  );

  const homeUrl = auth.isAuthorized ? `${getUrlStart(lang)}practice` : getUrlStart(lang);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isShowHelpModal, setIsShowHelpModal] = useState(false);
  const usage = useUsage();

  const searchParams = useSearchParams();
  const isPaymentModalInUrl = searchParams.get("paymentModal") === "true";
  const isSuccessPayment = searchParams.get("paymentSuccess") === "true";

  useEffect(() => {
    if (isPaymentModalInUrl && isPaymentModalInUrl !== usage.isShowPaymentModal) {
      usage.togglePaymentModal(true, isSuccessPayment);
    }
  }, [isPaymentModalInUrl]);

  const userPhoto = auth.userInfo?.photoURL || "";
  const userName = auth.userInfo?.displayName || "";
  const router = useRouter();

  const onlyNavigate = (url: string) => {
    router.push(url);
  };

  const navigateTo = (url: string, e: MouseEvent<unknown, unknown>) => {
    const isNewTab = e.ctrlKey || e.metaKey;
    if (isNewTab) {
      return;
    } else {
      e.preventDefault();
      router.push(url);
    }
  };

  const activeConversationTitle =
    aiConversation.isStarted || aiConversation.isInitializing
      ? aiConversation.currentMode || ""
      : "";
  const isActiveConversation = !!activeConversationTitle;

  const isNoBalance = usage.balanceHours <= 0.01;
  const [isInternalClosing, setIsInternalClosing] = useState(false);
  useEffect(() => {
    if (isInternalClosing) {
      setTimeout(() => {
        setIsInternalClosing(false);
      }, 3000);
    }
  }, [isInternalClosing]);

  return (
    <>
      <Stack
        component={"header"}
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",

          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          backgroundColor:
            isNoBalance && !isLanding
              ? "transparent"
              : isActiveConversation
                ? "rgba(10, 18, 30, 0.1)"
                : "rgba(10, 18, 30, 0.7)",
          backdropFilter: isActiveConversation ? "blur(0px)" : "blur(10px)",
          //borderBottom: isActiveConversation ? "1px solid rgba(255, 255, 255, 0.1)" : "none",

          ".menu-link": {
            height: "60px",
            fontWeight: 360,
            color: "#eee",
            display: "flex",
            alignItems: "center",
            minHeight: "100%",
            textDecoration: "none",
            padding: "0 20px",
            borderRadius: "5px",
            ":hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          },
          "@media (max-width: 650px)": {
            position: "absolute",
            ".hideOnMobile": {
              display: "none !important",
            },
          },
        }}
      >
        <Stack
          sx={{
            maxWidth: "1400px",
            width: "100%",
            gap: "10px",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 10px",
            boxSizing: "border-box",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              gap: "0px",
              height: "100%",
            }}
          >
            {isActiveConversation && (
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <Button
                  startIcon={<ChevronLeft color="white" size={"30px"} />}
                  disabled={
                    aiConversation.isClosing || isInternalClosing || !!aiConversation.isInitializing
                  }
                  href={"#"}
                  sx={{
                    opacity: isInternalClosing || aiConversation.isClosing ? 0.5 : 1,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsInternalClosing(true);
                    const url = `${getUrlStart(lang)}practice`;
                    onlyNavigate(url);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                    exitFullScreen();
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: aiConversation.isClosing ? "#aaa" : "#fff",
                      textDecoration: "none",
                      textTransform: "Capitalize",
                    }}
                  >
                    {aiConversation.isClosing || isInternalClosing
                      ? i18n._("Finishing...")
                      : i18n._(`Back`)}
                  </Typography>
                </Button>
              </Stack>
            )}

            {!isActiveConversation && (
              <Stack
                component={"a"}
                href={homeUrl}
                onClick={(e) => navigateTo(homeUrl, e)}
                className="menu-link"
                sx={{
                  marginRight: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ".big_logo": {
                    display: "block",
                  },
                  ".small_logo": {
                    display: "none",
                  },
                  "@media (max-width: 1000px)": {
                    marginRight: "0px",
                  },
                  "@media (max-width: 850px)": {
                    paddingLeft: "0 !important",
                    paddingRight: "0 !important",
                    ".big_logo": {
                      display: "none",
                    },
                    ".small_logo": {
                      display: "block",
                    },
                  },
                }}
              >
                <img src="/logo.svg" alt="logo" width="160px" height="67px" className="big_logo" />
                <img
                  src="/logo_small.svg"
                  alt="logo"
                  width="37px"
                  height="37px"
                  className="small_logo"
                />
              </Stack>
            )}
          </Stack>

          {!auth.loading && (
            <Stack
              sx={{
                flexDirection: "row",
                gap: "10px",
                alignItems: "center",
                height: "100%",
              }}
            >
              {auth.isAuthorized ? (
                <>
                  {!isActiveConversation && (
                    <Stack
                      sx={{
                        flexDirection: "row",
                        gap: "5px",
                        alignItems: "center",
                      }}
                    >
                      <LanguageSwitcher
                        size="large"
                        isAuth={auth.isAuthorized}
                        langToLearn={settings.languageCode || "en"}
                        setLanguageToLearn={settings.setLanguage}
                        setPageLanguage={settings.setPageLanguage}
                        nativeLang={settings.userSettings?.nativeLanguageCode || "en"}
                        setNativeLanguage={settings.setNativeLanguage}
                      />
                    </Stack>
                  )}

                  {isGameWinner && (
                    <Tooltip title={i18n._("You are in the top 5")}>
                      <Stack
                        sx={{
                          background:
                            "linear-gradient(45deg,rgba(210, 13, 220, 0.8) 0%,rgba(212, 19, 71, 0.4) 100%)",
                          borderRadius: "35px",
                          padding: "5px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "30px",
                          height: "30px",
                        }}
                      >
                        <Crown size={"20px"} />
                      </Stack>
                    </Tooltip>
                  )}

                  {(!isActiveConversation || usage.balanceHours < 0.1) && (
                    <Button
                      sx={{
                        color: usage.loading
                          ? "#fff"
                          : usage.balanceHours > 0.2
                            ? "#fff"
                            : usage.balanceHours >= 0.1
                              ? "#ff9900"
                              : "#ee2233",
                      }}
                      onClick={() => usage.togglePaymentModal(true)}
                      startIcon={<Wallet size="20px" />}
                    >
                      <Typography
                        sx={{
                          textTransform: "none",
                        }}
                      >
                        {convertHoursToHumanFormat(Math.max(0, usage.balanceHours))}
                      </Typography>
                    </Button>
                  )}
                  {!isActiveConversation && (
                    <IconButton
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                      }}
                    >
                      <Avatar alt={userName} src={userPhoto} />
                    </IconButton>
                  )}
                </>
              ) : (
                <></>
              )}
            </Stack>
          )}
        </Stack>

        {usage.isShowPaymentModal && <PaymentModal />}

        {isShowHelpModal && <NeedHelpModal onClose={() => setIsShowHelpModal(false)} lang={lang} />}
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <MenuItem
          onClick={() => {
            setIsShowHelpModal(true);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <MessageCircleQuestion size="20px" />
          </ListItemIcon>
          <ListItemText>{i18n._(`Need Help?`)}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            auth.logout();
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <LogOutIcon size="20px" />
          </ListItemIcon>
          <ListItemText>{i18n._(`Log Out`)}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
