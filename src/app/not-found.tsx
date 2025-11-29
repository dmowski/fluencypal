import { allMessages } from "@/appRouterI18n";
import { HeaderStatic } from "@/features/Header/HeaderStatic";
import { maxLandingWidth } from "@/features/Landing/landingSettings";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { initLingui } from "@/initLingui";
import { Button, Stack, Typography } from "@mui/material";
import { Suspense } from "react";

export const metadata = {
  title: "Not Found",
  description: "Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const supportedLang = "en";
  initLingui(supportedLang);
  return (
    <LinguiClientProvider
      initialLocale={supportedLang}
      initialMessages={allMessages[supportedLang]!}
    >
      <Suspense>
        <div>
          <HeaderStatic lang="en" />
          <Stack
            sx={{
              alignItems: "center",
              paddingTop: "120px",
            }}
          >
            <Stack
              sx={{
                maxWidth: maxLandingWidth,
                width: "100%",
                alignItems: "flex-start",
              }}
            >
              <Typography variant="h1">Not Found</Typography>
              <p>Could not find page</p>
              <Button
                variant="contained"
                href="/"
                sx={{
                  padding: "20px 60px",
                }}
              >
                Go to the main page
              </Button>
            </Stack>
          </Stack>
        </div>
      </Suspense>
    </LinguiClientProvider>
  );
}
