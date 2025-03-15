"use client";

import { useState, MouseEvent, useEffect } from "react";
import { useAuth } from "../Auth/useAuth";
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { BookMarked, Gem, LogOutIcon, MessageCircleQuestion, Rss, Wallet } from "lucide-react";

import { useUsage } from "../Usage/useUsage";
import { PaymentModal } from "../Usage/PaymentModal";
import { NeedHelpModal } from "./NeedHelpModal";
import { LanguageSelectorModal } from "../Lang/LanguageSelectorModal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SupportedLanguage } from "@/common/lang";
import { LanguageSwitcher } from "../Lang/LanguageSwitcher";
import { getUrlStart } from "../Lang/getUrlStart";
import MenuIcon from "@mui/icons-material/Menu";

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
  blogTitle: string;
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
  blogTitle,
  logOutTitle,
}: HeaderProps) {
  const auth = useAuth();
  const pathname = usePathname();

  const [isOpenMainMenu, setIsOpenMainMenu] = useState(false);

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
          "@media (max-width: 650px)": {
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
            <IconButton
              size="large"
              onClick={() => setIsOpenMainMenu(true)}
              title="Open main menu"
              sx={{
                display: "none",
                "@media (max-width: 650px)": {
                  display: auth.isAuthorized && mode !== "landing" ? "none" : "block",
                },
              }}
            >
              <MenuIcon />
            </IconButton>

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
                  href={`${getUrlStart(lang)}blog`}
                  onClick={(e) => navigateTo(`${getUrlStart(lang)}blog`, e)}
                  className="menu-link hideOnMobile"
                >
                  {blogTitle}
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
              <LanguageSwitcher />
              {auth.isAuthorized ? (
                <>
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
        </Stack>

        {usage.isShowPaymentModal && <PaymentModal />}

        {isShowLangSelector && (
          <LanguageSelectorModal onClose={() => setIsShowLangSelector(false)} />
        )}

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

      <Drawer open={isOpenMainMenu} onClose={() => setIsOpenMainMenu(false)}>
        <Stack
          sx={{
            width: "300px",
            height: "100vh",
            maxWidth: "80vw",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "20px",
          }}
          onClick={() => setIsOpenMainMenu(false)}
        >
          <Stack component={"a"} href={homeUrl}>
            <img src="/logo.svg" alt="logo" width="160px" height="67px" />
          </Stack>

          <List sx={{}}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  onlyNavigate(`${getUrlStart(lang)}scenarios`);
                  setIsOpenMainMenu(false);
                }}
              >
                <ListItemIcon>
                  <BookMarked />
                </ListItemIcon>
                <ListItemText primary={rolePlayTitle} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  onlyNavigate(`${getUrlStart(lang)}contacts`);
                  setIsOpenMainMenu(false);
                }}
              >
                <ListItemIcon>
                  <MessageCircleQuestion />
                </ListItemIcon>
                <ListItemText primary={contactsTitle} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  onlyNavigate(`${getUrlStart(lang)}blog`);
                  setIsOpenMainMenu(false);
                }}
              >
                <ListItemIcon>
                  <Rss />
                </ListItemIcon>
                <ListItemText primary={blogTitle} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  onlyNavigate(`${getUrlStart(lang)}pricing`);
                  setIsOpenMainMenu(false);
                }}
              >
                <ListItemIcon>
                  <Gem />
                </ListItemIcon>
                <ListItemText primary={priceTitle} />
              </ListItemButton>
            </ListItem>
          </List>

          <Stack sx={{}}>
            <Button
              href={`${getUrlStart(lang)}practice`}
              onClick={(e) => {
                setIsOpenMainMenu(false);
                navigateTo(`${getUrlStart(lang)}practice`, e);
              }}
              sx={{
                padding: "10px 20px",
              }}
              variant="contained"
            >
              {auth.isAuthorized ? practiceTitle : signInTitle}
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
