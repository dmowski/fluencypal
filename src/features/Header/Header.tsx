"use client";

import { useState } from "react";
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
import { Languages, LogOutIcon, MessageCircleQuestion, Wallet } from "lucide-react";
import { useSettings } from "../Settings/useSettings";

import { useUsage } from "../Usage/useUsage";
import { PaymentModal } from "../Usage/PaymentModal";
import { NeedHelpModal } from "./NeedHelpModal";
import { LanguageSelectorModal } from "../Lang/LanguageSelectorModal";

interface HeaderProps {
  mode: "landing" | "practice";
}
export function Header({ mode }: HeaderProps) {
  const auth = useAuth();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isShowLangSelector, setIsShowLangSelector] = useState(false);
  const [isShowHelpModal, setIsShowHelpModal] = useState(false);
  const settings = useSettings();
  const usage = useUsage();

  const userPhoto = auth.userInfo?.photoURL || "";
  const userName = auth.userInfo?.displayName || "";

  return (
    <Stack
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
            href={auth.isAuthorized ? "/practice" : "/"}
            className="menu-link"
            style={{
              marginRight: "40px",
            }}
          >
            <img src="/logo.svg" alt="logo" width="80px" height="37px" />
          </a>

          {mode === "landing" && (
            <>
              {auth.isAuthorized && (
                <Link href={"/practice"} className="menu-link hideOnMobile">
                  Practice
                </Link>
              )}
              <Link href={"/scenarios"} className="menu-link hideOnMobile">
                Role-Play
              </Link>
              <Link href={"/contacts"} className="menu-link hideOnMobile">
                Contacts
              </Link>
              <Link href={"/pricing"} className="menu-link hideOnMobile">
                Price
              </Link>
            </>
          )}
        </Stack>

        {!auth.loading && (
          <>
            {auth.isAuthorized ? (
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {mode !== "landing" && (
                  <Button
                    variant="text"
                    startIcon={<Languages size="20px" />}
                    onClick={() => {
                      setIsShowLangSelector(true);
                      setMenuAnchor(null);
                    }}
                  >
                    {settings.fullLanguageName
                      ? `${settings.fullLanguageName}`
                      : "Set language to learn"}
                  </Button>
                )}

                {mode === "landing" && (
                  <Link href={"/practice"} className="menu-link">
                    Practice
                  </Link>
                )}

                <IconButton
                  onClick={(e) => {
                    setMenuAnchor(e.currentTarget);
                  }}
                >
                  <Avatar alt={userName} src={userPhoto} />
                </IconButton>
              </Stack>
            ) : (
              <Button href="/practice" variant="outlined">
                Sign in
              </Button>
            )}
          </>
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
              usage.setIsShowPaymentModal(true);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <Wallet size="20px" />
            </ListItemIcon>
            <ListItemText>
              Balance:{" "}
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
            <ListItemText>{`Need Help?`}</ListItemText>
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
            <ListItemText>{`Logout`}</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>

      {usage.isShowPaymentModal && <PaymentModal />}

      {isShowLangSelector && <LanguageSelectorModal onClose={() => setIsShowLangSelector(false)} />}

      {isShowHelpModal && <NeedHelpModal onClose={() => setIsShowHelpModal(false)} />}
    </Stack>
  );
}
