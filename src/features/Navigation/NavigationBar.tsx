"use client";
import { Link, Stack, Typography } from "@mui/material";
import { Home, LucideProps, Swords, User, VenetianMask } from "lucide-react";
import { useRouter } from "next/navigation";
import { ForwardRefExoticComponent, JSX, RefAttributes, useEffect, useState } from "react";
import { SupportedLanguage } from "../Lang/lang";
import { getUrlStart } from "../Lang/getUrlStart";
import { useLingui } from "@lingui/react";
import { useWindowSizes } from "../Layout/useWindowSizes";

type PageType = "home" | "role-play" | "game" | "profile";

export interface IconProps {
  color?: string;
  size?: string;
}

export interface NavigationProps {
  currentPage: PageType;
}

interface NavigationItem {
  name: PageType;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
}

export interface NavigationProps {
  currentPage: PageType;
  lang: SupportedLanguage;
}

const activeColor = "#29b6f6"; // Define the active color for the icon
const inactiveColor = "#A0A0A0"; // Define the inactive color for the icon
const size = "23px"; // Define the size of the icon

export const NavigationBar: React.FC<NavigationProps> = ({ currentPage, lang }) => {
  const { i18n } = useLingui();
  const { bottomOffset } = useWindowSizes();
  const navigationItems: NavigationItem[] = [
    {
      name: "home",
      href: `${getUrlStart(lang)}practice`,
      icon: Home,
      title: i18n._("Home"),
    },
    {
      name: "game",
      href: `${getUrlStart(lang)}practice?gamePage=true`,
      icon: Swords,
      title: i18n._("Game"),
    },
    {
      name: "role-play",
      href: `${getUrlStart(lang)}practice?rolePlayList=true`,
      icon: VenetianMask,
      title: i18n._("Role Play"),
    },
    {
      name: "profile",
      href: `${getUrlStart(lang)}practice?profile=true`,
      icon: User,
      title: i18n._("Profile"),
    },
  ];

  const [showLoader, setShowLoader] = useState(false);
  const [internalCurrentPage, setInternalCurrentPage] = useState(currentPage || "home");

  useEffect(() => {
    setInternalCurrentPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (!showLoader) {
      return;
    }
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showLoader]);

  const router = useRouter();
  const navigateTo = (e: React.MouseEvent<HTMLAnchorElement>, item: NavigationItem) => {
    setShowLoader(true);
    setInternalCurrentPage(item.name);
    e.preventDefault();
    if (internalCurrentPage !== item.name) {
      router.push(item.href);
    }
  };

  return (
    <Stack
      component={"nav"}
      sx={{
        width: "100%",
        position: "fixed",
        bottom: 0,
        left: 0,
        alignItems: "center",
        backgroundColor: "rgba(20, 20, 20, 0.7)",
        backdropFilter: "blur(10px)",
        zIndex: 999,
        borderTop: "1px solid rgba(255, 255, 255, 0.07)",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: "700px",
          padding: "0",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        {navigationItems.map((item) => {
          const isActive = internalCurrentPage === item.name;
          const color = isActive ? activeColor : inactiveColor;
          return (
            <Stack
              key={item.name}
              sx={{
                listStyle: "none",
                color: color,
                height: "100%",
                padding: "0",
                margin: "0",
                width: "100%",
                textDecoration: "none",

                ...(isActive
                  ? {
                      fontWeight: "bold",
                    }
                  : {}),
              }}
            >
              <Link
                href={item.href}
                onClick={(e) => navigateTo(e, item)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  height: "100%",
                  width: "100%",
                  background: "none",
                  color: "inherit",
                  textDecoration: "none",
                  padding: "0",
                  boxSizing: "border-box",
                  paddingTop: "20px",
                  paddingBottom: `calc(20px + ${bottomOffset})`,
                  margin: "0",
                  gap: "5px",
                  transition: "background-color 0.3s ease",
                  ":hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                }}
              >
                <item.icon color={color} width={size} height={size} />
                <Typography variant="caption" component={"span"}>
                  {item.title}
                </Typography>
              </Link>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
