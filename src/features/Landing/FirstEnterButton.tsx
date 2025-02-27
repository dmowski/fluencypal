"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useAuth } from "../Auth/useAuth";
import { useEffect, useState } from "react";

export const FirstEnterButton = () => {
  const auth = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (auth.loading) return;
    setTimeout(() => setIsVisible(true), 140);
  }, [auth.loading]);

  return (
    <Stack
      sx={{
        alignItems: "center",
        gap: "5px",
        position: "relative",
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 1s",
      }}
    >
      <Button
        sx={{
          padding: "15px 80px",
        }}
        variant="contained"
        size="large"
        href={"/practice"}
      >
        {auth.isAuthorized ? "Open Dashboard" : "Get started free"}
      </Button>

      <Stack
        sx={{
          flexDirection: "row",
          gap: "10px",
          alignItems: "center",
          visibility: auth.isAuthorized ? "hidden" : "visible",
        }}
      >
        <Typography variant="caption">No credit card needed</Typography>
      </Stack>
    </Stack>
  );
};
