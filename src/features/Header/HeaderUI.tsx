"use client";

import { useState, MouseEvent, useEffect, ForwardRefExoticComponent, RefAttributes } from "react";
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
import { LucideProps, X } from "lucide-react";

import { useRouter } from "next/navigation";
import { SupportedLanguage } from "@/features/Lang/lang";
import { LanguageSwitcher } from "../Lang/LanguageSwitcher";
import { getUrlStart, getUrlStartWithoutLastSlash } from "../Lang/getUrlStart";
import MenuIcon from "@mui/icons-material/Menu";

export interface HeaderLink {
  title: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export interface HeaderButton {
  title: string;
  href: string;
  isSolid: boolean;
}

export interface HeaderUIProps {
  lang: SupportedLanguage;
  links: HeaderLink[];
  buttons: HeaderButton[];
  transparentOnTop?: boolean;
  logoHref: string;
}
export function HeaderUI({ lang, links, buttons, transparentOnTop, logoHref }: HeaderUIProps) {
  const [isOpenMainMenu, setIsOpenMainMenu] = useState(false);
  const [isHighlightJoin, setIsHighlightJoin] = useState(false);
  const [isBlurHeader, setIsBlurHeader] = useState(false);
  const [isFixedHeader, setIsFixedHeader] = useState(true);

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) {
      return;
    }

    const urlsForNormalHeader = [getUrlStart(lang) + "blog", getUrlStart(lang) + "scenarios"];

    const urlPath = location.pathname;
    const isStaticHeader = !urlsForNormalHeader.find((url) => urlPath.startsWith(url));
    setIsFixedHeader(isStaticHeader);

    const onScrollHandler = () => {
      if (window.scrollY > 200) {
        setIsBlurHeader(true);
      } else {
        setIsBlurHeader(false);
      }

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

  const homeUrl = `${getUrlStartWithoutLastSlash(lang)}${logoHref}`;

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

          position: isFixedHeader ? "fixed" : "absolute",
          top: 0,
          left: 0,
          zIndex: 999,
          //backgroundColor: "rgba(10, 18, 30, 0.7)",
          backgroundColor:
            transparentOnTop && !isBlurHeader ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.6)",
          backdropFilter: transparentOnTop && !isBlurHeader ? "blur(0px)" : "blur(10px)",
          //borderBottom: isActiveConversation ? "1px solid rgba(255, 255, 255, 0.1)" : "none",

          transition: "all 0.3s ease-in-out",

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
            position: isFixedHeader ? "fixed" : "absolute",
            ".hideOnMobile": {
              display: "none !important",
            },
          },
        }}
      >
        <Stack
          sx={{
            maxWidth: "1300px",
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
              <img src="/logo.svg" alt="logo" width="112px" height="47px" className="small_logo" />
            </Stack>

            {links.map((link) => (
              <Link
                key={link.href}
                href={`${getUrlStart(lang)}${link.href}`}
                onClick={(e) => navigateTo(`${getUrlStart(lang)}${link.href}`, e)}
                className="menu-link hideOnMobile"
              >
                {link.title}
              </Link>
            ))}
          </Stack>

          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              height: "100%",
            }}
          >
            <LanguageSwitcher />

            {buttons.map((button) => (
              <Button
                key={button.href}
                href={`${getUrlStart(lang)}${button.href}`}
                onClick={(e) => navigateTo(`${getUrlStart(lang)}${button.href}`, e)}
                variant={isHighlightJoin ? "contained" : "outlined"}
                color="info"
                className="hideOnMobile"
                sx={{
                  minWidth: "max-content",
                }}
              >
                {button.title}
              </Button>
            ))}

            <IconButton
              onClick={() => setIsOpenMainMenu(true)}
              title="Open main menu"
              sx={{
                display: "none",
                "@media (max-width: 650px)": {
                  display: "block",
                  marginTop: "3px",
                  marginRight: "10px",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      <Drawer open={isOpenMainMenu} onClose={() => setIsOpenMainMenu(false)} anchor="right">
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
          <Stack
            sx={{
              alignItems: "flex-end",
            }}
          >
            <IconButton onClick={() => setIsOpenMainMenu(false)} title="Close main menu" sx={{}}>
              <X />
            </IconButton>
          </Stack>

          <List sx={{}}>
            {links.map((link) => (
              <ListItem disablePadding key={link.href}>
                <ListItemButton
                  onClick={() => {
                    onlyNavigate(`${getUrlStart(lang)}${link.href}`);
                    setIsOpenMainMenu(false);
                  }}
                >
                  <ListItemIcon>
                    <link.icon />
                  </ListItemIcon>
                  <ListItemText primary={link.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Stack sx={{}}>
            {buttons.map((button) => (
              <Button
                key={button.href}
                href={`${getUrlStart(lang)}${button.href}`}
                onClick={(e) => {
                  setIsOpenMainMenu(false);
                  navigateTo(`${getUrlStart(lang)}${button.href}`, e);
                }}
                sx={{
                  padding: "10px 20px",
                }}
                variant="contained"
              >
                {button.title}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
