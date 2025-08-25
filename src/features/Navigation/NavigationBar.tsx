"use client";
import { Link, Stack, Typography } from "@mui/material";
import { Home, LucideProps, Swords, User, VenetianMask } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { SupportedLanguage } from "../Lang/lang";
import { useLingui } from "@lingui/react";
import { useWindowSizes } from "../Layout/useWindowSizes";
import { PageType } from "./types";
import { useAppNavigation } from "./useAppNavigation";

export interface IconProps {
  color?: string;
  size?: string;
}

interface NavigationItem {
  name: PageType;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
}

export interface NavigationProps {
  lang: SupportedLanguage;
}

const activeColor = "#29b6f6"; // Define the active color for the icon
const inactiveColor = "#A0A0A0"; // Define the inactive color for the icon

export const NavigationBar: React.FC<NavigationProps> = ({ lang }) => {
  const appNavigation = useAppNavigation();

  const { i18n } = useLingui();
  const { bottomOffset } = useWindowSizes();
  const navigationItems: NavigationItem[] = [
    {
      name: "home",
      icon: Home,
      title: i18n._("Home"),
    },
    {
      name: "game",
      icon: Swords,
      title: i18n._("Game"),
    },
    {
      name: "role-play",
      icon: VenetianMask,
      title: i18n._("Role Play"),
    },
    {
      name: "profile",
      icon: User,
      title: i18n._("Profile"),
    },
  ];

  const navigateTo = (e: React.MouseEvent<HTMLAnchorElement>, item: NavigationItem) => {
    e.preventDefault();
    appNavigation.setCurrentPage(item.name);
  };

  return (
    <Stack
      component={"nav"}
      sx={{
        width: "100%",

        alignItems: "center",

        backdropFilter: "blur(10px)",
        zIndex: 999,

        borderTop: "1px solid rgba(255, 255, 255, 0.07)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        marginBottom: "40px",
        "@media (max-width: 700px)": {
          backgroundColor: "rgba(20, 20, 20, 0.7)",
          borderBottom: "none",
          marginBottom: "0px",
          position: "fixed",
          bottom: 0,
          left: 0,
        },
      }}
    >
      <Stack sx={{ width: "100%", maxWidth: "700px", padding: "0 10px" }}>
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-around",
            borderLeft: "1px solid rgba(255, 255, 255, 0.07)",
            borderRight: "1px solid rgba(255, 255, 255, 0.07)",
            "@media (max-width: 900px)": {
              border: "none",
            },
          }}
        >
          {navigationItems.map((item) => {
            const isActive = appNavigation.currentPage === item.name;
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
                  href={`${appNavigation.pageUrl(item.name)}`}
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
                    paddingTop: "15px",
                    paddingBottom: `calc(10px + ${bottomOffset})`,
                    margin: "0",
                    gap: "5px",
                    transition: "background-color 0.3s ease",
                    ":hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.07)",
                    },
                    "@media (max-width: 700px)": {
                      ":hover": {
                        backgroundColor: "transparent",
                      },
                    },
                  }}
                >
                  <item.icon color={color} width={"20px"} height={"20px"} />
                  <Typography variant="caption" component={"span"} align="center">
                    {item.title}
                  </Typography>
                </Link>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
