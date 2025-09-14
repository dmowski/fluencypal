"use client";

import { Button, Stack, Typography } from "@mui/material";
import { buttonStyle } from "./landingSettings";
import { useEffect, useState } from "react";
import { getUrlStart } from "../Lang/getUrlStart";

interface FirstEnterButtonProps {
  showPricingButton?: boolean;
  openDashboardTitle: string;
  getStartedTitle: string;
  viewPricingTitle: string;
  noCreditCardNeededTitle: string;
  pricingLink: string;
  practiceLink: string;
  openMyPracticeLinkTitle: string;
}
export const FirstEnterButton: React.FC<FirstEnterButtonProps> = ({
  showPricingButton,
  openDashboardTitle,
  getStartedTitle,
  viewPricingTitle,
  noCreditCardNeededTitle,
  pricingLink,
  practiceLink,
  openMyPracticeLinkTitle,
}) => {
  const [isSignInToLanguage, setIsSignInToLanguage] = useState("");
  const openMyPracticeLink = isSignInToLanguage ? getUrlStart(isSignInToLanguage) + "practice" : "";

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;
    const storedLanguage = localStorage.getItem("pageLanguageCode");
    if (storedLanguage) {
      setTimeout(() => {
        setIsSignInToLanguage(storedLanguage);
      }, 20);
    }
  }, []);

  return (
    <>
      <Stack
        sx={{
          alignItems: "center",
          gap: "5px",
          position: "relative",
          zIndex: 1,
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
          href={openMyPracticeLink || practiceLink}
        >
          {openMyPracticeLink ? openMyPracticeLinkTitle : getStartedTitle}
        </Button>

        {!showPricingButton && !openMyPracticeLink && (
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              visibility: "visible",
            }}
          >
            <Typography variant="caption">{noCreditCardNeededTitle}</Typography>
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
            href={pricingLink}
          >
            {viewPricingTitle}
          </Button>
        </>
      )}
    </>
  );
};
