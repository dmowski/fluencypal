"use client";

import { useState, MouseEvent, useEffect } from "react";
import {
  Button,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { BookMarked, Gem, MessageCircleQuestion, Rss } from "lucide-react";

import { useRouter } from "next/navigation";
import { SupportedLanguage } from "@/features/Lang/lang";
import { LanguageSwitcher } from "../Lang/LanguageSwitcher";
import { getUrlStart, getUrlStartWithoutLastSlash } from "../Lang/getUrlStart";
import MenuIcon from "@mui/icons-material/Menu";

export interface HeaderStaticProps {
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
export function HeaderComponentStatic({
  lang,
  rolePlayTitle,
  contactsTitle,
  priceTitle,
  signInTitle,
  blogTitle,
}: HeaderStaticProps) {
  const [isOpenMainMenu, setIsOpenMainMenu] = useState(false);
  const [isHighlightJoin, setIsHighlightJoin] = useState(false);

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) {
      return;
    }

    const onScrollHandler = () => {
      if (window.scrollY > 800) {
        setIsHighlightJoin(true);
      } else {
        setIsHighlightJoin(false);
      }
    };

    window.addEventListener("scroll", onScrollHandler);
    return () => {
      window.removeEventListener("scroll", onScrollHandler);
    };
  }, []);

  const homeUrl = `${getUrlStartWithoutLastSlash(lang)}`;

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
          backgroundColor: "rgba(10, 18, 30, 0.7)",
          backdropFilter: "blur(10px)",
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
            position: "fixed",
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
              onClick={() => setIsOpenMainMenu(true)}
              title="Open main menu"
              sx={{
                display: "none",
                "@media (max-width: 650px)": {
                  display: "block",
                },
              }}
            >
              <MenuIcon fontSize="small" />
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
          </Stack>

          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              height: "100%",
            }}
          >
            <LanguageSwitcher
              isAuth={false}
              setLanguageToLearn={() => {}}
              setPageLanguage={() => {}}
            />
            <Button
              href={`${getUrlStart(lang)}practice`}
              onClick={(e) => navigateTo(`${getUrlStart(lang)}practice`, e)}
              variant={isHighlightJoin ? "contained" : "outlined"}
              color="info"
              sx={{
                minWidth: "max-content",
              }}
            >
              {signInTitle}
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Drawer open={isOpenMainMenu} onClose={() => setIsOpenMainMenu(false)}>
        <Stack
          sx={{
            width: "220px",
            height: "100svh",
            boxSizing: "border-box",
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
              {signInTitle}
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
