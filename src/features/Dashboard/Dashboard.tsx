"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";

import { Button, Card, Stack, Typography } from "@mui/material";
import { StarContainer } from "../Layout/StarContainer";
import MicIcon from "@mui/icons-material/Mic";
import { useSettings } from "../Settings/useSettings";
import { LangSelector } from "../Lang/LangSelector";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import { Homework } from "../Conversation/Homework";
import { JSX } from "react";

const InfoBlockedSection = ({
  title,
  children,
}: {
  title: string;
  children?: JSX.Element | JSX.Element[];
}) => {
  return (
    <Stack
      sx={{
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          padding: "20px",
          opacity: 0.3,
        }}
        align="center"
      >
        {title}
      </Typography>
      {children}
    </Stack>
  );
};

export function Dashboard() {
  const settings = useSettings();
  const aiConversation = useAiConversation();

  if (aiConversation.isInitializing) {
    return <InfoBlockedSection title="Loading..." />;
  }

  if (aiConversation.errorInitiating) {
    return (
      <InfoBlockedSection title="">
        <Typography color="error">{aiConversation.errorInitiating}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </InfoBlockedSection>
    );
  }

  if (!settings.language) {
    return (
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StarContainer minHeight="90vh" paddingBottom="0px">
          <Stack
            sx={{
              maxWidth: "400px",
              gap: "20px",
            }}
          >
            <Typography variant="h5">Select language to learn</Typography>
            <LangSelector
              value={settings.language}
              onDone={(lang) => settings.setLanguage(lang)}
              confirmButtonLabel="Continue"
            />
            <Typography variant="caption">
              You can change the language later in the settings
            </Typography>
          </Stack>
        </StarContainer>
      </Stack>
    );
  }

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: "1400px",
          padding: "10px",
          paddingTop: "100px",
          boxSizing: "border-box",
          gap: "20px",
        }}
      >
        <Card
          sx={{
            padding: "40px 40px 55px 40px",
            display: "flex",
            flexDirection: "column",
            gap: "40px",
          }}
        >
          <Typography variant="h4">Conversation</Typography>
          <Stack
            sx={{
              gap: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              "@media (max-width: 900px)": {
                gridTemplateColumns: "1fr",
                gap: "40px",
              },
            }}
          >
            <Stack
              gap={"20px"}
              sx={{
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <Stack>
                <Typography variant="h5">Just talk mode</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  Just talk to the AI and it will respond to you
                </Typography>
              </Stack>
              <Button
                variant="contained"
                onClick={() => aiConversation.startConversation({ mode: "talk" })}
                startIcon={
                  <MicIcon
                    sx={{
                      fontSize: "30px",
                      width: "30px",
                      height: "30px",
                    }}
                  />
                }
              >
                Start Just talk
              </Button>
            </Stack>

            <Stack
              gap={"20px"}
              sx={{
                alignItems: "flex-start",
              }}
            >
              <Stack>
                <Typography variant="h5">Talk & Correct mode</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  Talk to the AI and correct it if it makes a mistake
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                onClick={() => aiConversation.startConversation({ mode: "talk-and-correct" })}
                startIcon={
                  <TrendingUpIcon
                    sx={{
                      fontSize: "30px",
                      width: "30px",
                      height: "30px",
                    }}
                  />
                }
              >
                Start Talk & Correct
              </Button>
            </Stack>

            <Stack
              gap={"20px"}
              sx={{
                alignItems: "flex-start",
              }}
            >
              <Stack>
                <Typography variant="h5">Beginner mode</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  Easy mode for beginners
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                onClick={() => aiConversation.startConversation({ mode: "beginner" })}
                startIcon={
                  <ChildCareIcon
                    sx={{
                      fontSize: "30px",
                      width: "30px",
                      height: "30px",
                    }}
                  />
                }
              >
                Start the Beginner mode
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Stack
          sx={{
            gap: "20px",
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            boxSizing: "border-box",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          <Card
            sx={{
              padding: "40px 40px 55px 40px",
              display: "flex",
              flexDirection: "column",
              gap: "40px",
              boxSizing: "border-box",
            }}
          >
            <Typography variant="h4">Daily Tasks</Typography>
          </Card>
          <Homework />
        </Stack>
      </Stack>
    </Stack>
  );
}
