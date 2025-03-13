"use client";

import { useState, MouseEvent, useEffect } from "react";
import { useAuth } from "../Auth/useAuth";
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { LogOutIcon, MessageCircleQuestion, Wallet } from "lucide-react";
import { useSettings } from "../Settings/useSettings";

import { useUsage } from "../Usage/useUsage";
import { PaymentModal } from "../Usage/PaymentModal";
import { NeedHelpModal } from "./NeedHelpModal";
import { LanguageSelectorModal } from "../Lang/LanguageSelectorModal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SupportedLanguage } from "@/common/lang";
import { LanguageSwitcher } from "../Lang/LanguageSwitcher";
import { getUrlStart } from "../Lang/getUrlStart";

export type HeaderMode = "landing" | "practice";

export interface HeaderProps {
  mode: HeaderMode;
  lang: SupportedLanguage;
  practiceTitle: string;
  rolePlayTitle: string;
  contactsTitle: string;
  priceTitle: string;
  signInTitle: string;
  balanceTitle: string;
  needHelpTitle: string;
  logOutTitle: string;
}
export function HeaderComponent({
  mode,
  lang,
  practiceTitle,
  rolePlayTitle,
  contactsTitle,
  priceTitle,
  signInTitle,
  balanceTitle,
  needHelpTitle,
  logOutTitle,
}: HeaderProps) {
  const auth = useAuth();
  const pathname = usePathname();

  const isLanding = !(
    pathname.startsWith("/practice") || pathname.startsWith(`${getUrlStart(lang)}practice`)
  );
  const homeUrl = isLanding
    ? `${getUrlStart(lang)}`
    : auth.isAuthorized
      ? `${getUrlStart(lang)}practice`
      : getUrlStart(lang);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isShowLangSelector, setIsShowLangSelector] = useState(false);
  const [isShowHelpModal, setIsShowHelpModal] = useState(false);
  const settings = useSettings();
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

  const navigateTo = (url: string, e: MouseEvent<unknown, unknown>) => {
    const isNewTab = e.ctrlKey || e.metaKey;
    if (isNewTab) {
      return;
    } else {
      e.preventDefault();
      router.push(url);
    }
  };

  return (
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
        backgroundColor: "rgba(10, 18, 30, 0.9)",
        backdropFilter: "blur(10px)",

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
        "@media (max-width: 600px)": {
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
          <a
            href={homeUrl}
            onClick={(e) => navigateTo(homeUrl, e)}
            className="menu-link"
            style={{
              marginRight: "40px",
            }}
          >
            <img src="/logo.svg" alt="logo" width="160px" height="67px" />
          </a>

          {mode === "landing" && (
            <>
              <Link
                href={`${getUrlStart(lang)}scenarios`}
                onClick={(e) => navigateTo(`${getUrlStart(lang)}scenarios`, e)}
                className="menu-link hideOnMobile"
              >
                {rolePlayTitle}
              </Link>
              <Link
                href={`${getUrlStart(lang)}contacts`}
                onClick={(e) => navigateTo(`${getUrlStart(lang)}contacts`, e)}
                className="menu-link hideOnMobile"
              >
                {contactsTitle}
              </Link>
              <Link
                href={`${getUrlStart(lang)}pricing`}
                onClick={(e) => navigateTo(`${getUrlStart(lang)}pricing`, e)}
                className="menu-link hideOnMobile"
              >
                {priceTitle}
              </Link>
            </>
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
                {mode === "landing" && (
                  <Link
                    href={`${getUrlStart(lang)}practice`}
                    onClick={(e) => navigateTo(`${getUrlStart(lang)}practice`, e)}
                    className="menu-link"
                  >
                    {practiceTitle}
                  </Link>
                )}
                <LanguageSwitcher />

                <IconButton
                  onClick={(e) => {
                    setMenuAnchor(e.currentTarget);
                  }}
                >
                  <Avatar alt={userName} src={userPhoto} />
                </IconButton>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Button
                  href={`${getUrlStart(lang)}practice`}
                  onClick={(e) => navigateTo(`${getUrlStart(lang)}practice`, e)}
                  variant="outlined"
                >
                  {signInTitle}
                </Button>
              </>
            )}
          </Stack>
        )}

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
              usage.togglePaymentModal(true);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <Wallet size="20px" />
            </ListItemIcon>
            <ListItemText>
              {balanceTitle}:{" "}
              <Typography
                component={"span"}
                sx={{
                  backgroundColor:
                    usage.balance > 2
                      ? "rgba(0, 220, 0, 0.4)"
                      : usage.balance >= 0
                        ? "rgba(219, 241, 15, 0.2)"
                        : "rgba(220, 0, 0, 0.7)",
                  padding: "2px 10px",
                  borderRadius: "5px",
                  marginLeft: "5px",
                }}
              >
                {usage.balance > 0 ? "+ " : usage.balance == 0 ? "" : "- "}$
                {new Intl.NumberFormat().format(Math.abs(usage.balance))}
              </Typography>
            </ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              setIsShowHelpModal(true);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <MessageCircleQuestion size="20px" />
            </ListItemIcon>
            <ListItemText>{needHelpTitle}</ListItemText>
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
            <ListItemText>{logOutTitle}</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>

      {usage.isShowPaymentModal && <PaymentModal />}

      {isShowLangSelector && <LanguageSelectorModal onClose={() => setIsShowLangSelector(false)} />}

      {isShowHelpModal && <NeedHelpModal onClose={() => setIsShowHelpModal(false)} lang={lang} />}
    </Stack>
  );
}
