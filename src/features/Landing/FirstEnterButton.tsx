"use client";

import { Button, Stack } from "@mui/material";
import { buttonStyle } from "./landingSettings";
import { useEffect, useState } from "react";
import { getUrlStart } from "../Lang/getUrlStart";

interface FirstEnterButtonProps {
  getStartedTitle: string;
  practiceLink: string;
  openMyPracticeLinkTitle: string;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
}

export const FirstEnterButton: React.FC<FirstEnterButtonProps> = ({
  getStartedTitle,
  practiceLink,
  openMyPracticeLinkTitle,
  endIcon,
  startIcon,
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
        endIcon={endIcon}
        startIcon={startIcon}
      >
        {openMyPracticeLink ? openMyPracticeLinkTitle : getStartedTitle}
      </Button>
    </Stack>
  );
};

export const WelcomeScreenButton: React.FC<FirstEnterButtonProps> = ({
  getStartedTitle,
  practiceLink,
  openMyPracticeLinkTitle,
  endIcon,
  startIcon,
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
          backgroundColor: "#3dbeffff",
          color: "#111",
          fontSize: "1.2rem",
          fontWeight: 600,
        }}
        variant="contained"
        size="large"
        href={openMyPracticeLink || practiceLink}
        endIcon={endIcon}
        startIcon={startIcon}
      >
        {openMyPracticeLink ? openMyPracticeLinkTitle : getStartedTitle}
      </Button>
    </Stack>
  );
};
