"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useAuth } from "../Auth/useAuth";
import { useEffect, useState } from "react";
import { buttonStyle } from "./landingSettings";

interface FirstEnterButtonProps {
  showPricingButton?: boolean;
}
export const FirstEnterButton: React.FC<FirstEnterButtonProps> = ({ showPricingButton }) => {
  const auth = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (auth.loading) return;
    setTimeout(() => setIsVisible(true), 140);
  }, [auth.loading]);

  return (
    <Stack
      sx={{
        flexDirection: "row",
        gap: "10px",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "5px",
          position: "relative",
          zIndex: 1,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 1s",
        }}
      >
        <Button
          sx={{
            ...buttonStyle,
            padding: "10px 70px",
            color: "#000",
            backgroundColor: "#05acff",
          }}
          variant="contained"
          size="large"
          href={"/practice"}
        >
          {auth.isAuthorized ? "Open Dashboard" : "Get started free"}
        </Button>

        {!showPricingButton && (
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
        )}
      </Stack>
      {showPricingButton && (
        <>
          <Button
            sx={{
              ...buttonStyle,
              padding: "10px 70px",
              color: "#fff",
              borderColor: "#fff",
              borderWidth: "1px",
              backgroundColor: "transparent",
            }}
            variant="outlined"
            size="large"
            href={"/pricing"}
          >
            View pricing
          </Button>
        </>
      )}
    </Stack>
  );
};
