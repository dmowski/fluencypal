"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";

import { Button, Stack, Typography } from "@mui/material";
import { StarContainer } from "../Layout/StarContainer";
import MicIcon from "@mui/icons-material/Mic";
import { useSettings } from "../Settings/useSettings";
import { LangSelector } from "../Lang/LangSelector";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import { Homework } from "../Conversation/Homework";

export function Dashboard() {
  const settings = useSettings();
  const aiConversation = useAiConversation();

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StarContainer minHeight="90vh" paddingBottom="0px">
        {aiConversation.isInitializing ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            {!settings.language ? (
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
            ) : (
              <Stack
                gap={"10px"}
                sx={{
                  width: "300px",
                }}
              >
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
                  Just talk
                </Button>

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
                  Talk & Correct
                </Button>

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
                  Beginner
                </Button>
              </Stack>
            )}
          </>
        )}

        {!!aiConversation.errorInitiating && (
          <Typography color="error">{aiConversation.errorInitiating}</Typography>
        )}
      </StarContainer>
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "20px",
          padding: "0 30px 90px 30px",
          boxSizing: "border-box",
        }}
      >
        <Homework />
      </Stack>
    </Stack>
  );
}
