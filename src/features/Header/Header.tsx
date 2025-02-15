"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "../Auth/useAuth";
import { Button, Stack } from "@mui/material";

export function Header() {
  const auth = useAuth();

  if (!auth.isAuthorized) {
    return <></>;
  }
  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",

        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <Stack
        sx={{
          padding: "10px",
          maxWidth: "1400px",
          width: "100%",
          gap: "10px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="/">
          <img
            src="./logo.png"
            alt="logo"
            style={{
              maxWidth: "100px",
              height: "auto",
            }}
          />
        </a>

        {auth.isAuthorized && (
          <Button onClick={() => auth.logout()} startIcon={<LogOut size="20" />}>
            Logout
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
