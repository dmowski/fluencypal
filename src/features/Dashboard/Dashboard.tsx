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
import { GradientCard } from "../Card/GradientCard";
import { Badge, BadgeCheck, BookOpenText, GraduationCap, Mic } from "lucide-react";
import { TalkingWaves } from "../Animations/TalkingWaves";
import { ProgressGrid } from "./ProgressGrid";
import { InfoBlockedSection } from "./InfoBlockedSection";
import { DashboardCard } from "../Card/DashboardCard";
import { useTasks } from "../Tasks/useTasks";
import { TaskCard } from "./TaskCard";

export function Dashboard() {
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const tasks = useTasks();

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
        paddingBottom: "70px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: "1400px",
          padding: "10px",
          paddingTop: "100px",
          boxSizing: "border-box",
          gap: "40px",
        }}
      >
        <DashboardCard>
          <Stack>
            <Typography variant="h2" className="decor-title">
              Conversation
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              Start a conversation with the AI
            </Typography>
          </Stack>
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
                <Typography>Just talk mode</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  Talk to the AI and it will respond to you
                </Typography>
              </Stack>
              <Button
                variant="contained"
                onClick={() => aiConversation.startConversation({ mode: "talk" })}
                size="large"
                startIcon={
                  <MicIcon
                    sx={{
                      width: "20px",
                      height: "20px",
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
                <Typography>Talk & Correct mode</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  Talk to the AI and it will correct you if you make a mistake
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                size="large"
                onClick={() => aiConversation.startConversation({ mode: "talk-and-correct" })}
                startIcon={
                  <TrendingUpIcon
                    sx={{
                      width: "20px",
                      height: "20px",
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
                <Typography>Beginner mode</Typography>
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
                size="large"
                onClick={() => aiConversation.startConversation({ mode: "beginner" })}
                startIcon={
                  <ChildCareIcon
                    sx={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                }
              >
                Start the Beginner mode
              </Button>
            </Stack>
          </Stack>
        </DashboardCard>

        <Stack
          sx={{
            gap: "40px",
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            boxSizing: "border-box",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          <DashboardCard>
            <Stack>
              <Typography variant="h2" className="decor-title">
                Daily Tasks
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                Complete daily tasks to improve your English
              </Typography>
            </Stack>
            <Stack
              sx={{
                flexDirection: "row",
                gap: "20px",
              }}
            >
              <TaskCard isDone={tasks.todayStats.lesson}>
                <Stack>
                  <Typography>Small conversation</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    Start talk to learn something new
                  </Typography>
                </Stack>
                <Stack
                  gap={"10px"}
                  sx={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    startIcon={<Mic size={"20px"} />}
                    onClick={() => aiConversation.startConversation({ mode: "talk" })}
                    variant="outlined"
                  >
                    Just a Talk
                  </Button>
                </Stack>
              </TaskCard>

              <TaskCard isDone={tasks.todayStats.ruleOfDay}>
                <Stack>
                  <Typography>Rule of the day</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    Get a personal rule to learn
                  </Typography>
                </Stack>
                <Button
                  startIcon={<BookOpenText size={"20px"} />}
                  variant="outlined"
                  onClick={() => tasks.completeTask("ruleOfDay")}
                >
                  Get a rule
                </Button>
              </TaskCard>

              <TaskCard isDone={tasks.todayStats["workOfDay"]}>
                <Stack>
                  <Typography>New words</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    Practice new words with the AI
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  startIcon={<GraduationCap size={"20px"} />}
                  onClick={() => tasks.completeTask("workOfDay")}
                >
                  Get new words
                </Button>
              </TaskCard>
            </Stack>
          </DashboardCard>
          <DashboardCard>
            <Homework />
          </DashboardCard>
        </Stack>

        <Stack
          sx={{
            gap: "20px",
            display: "grid",
            gridTemplateColumns: "1fr",
            boxSizing: "border-box",
          }}
        >
          <DashboardCard>
            <Stack>
              <Typography variant="h2" className="decor-title">
                Progress
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                Your Daily Progress
              </Typography>
            </Stack>

            <ProgressGrid
              startDateTimeStamp={settings.userCreatedAt || Date.now()}
              currentDateTimeStamp={Date.now()}
              getDateStat={(date) => {
                const dayStat = tasks.daysTasks?.[date] || [];
                return dayStat.length;
              }}
            />
          </DashboardCard>
        </Stack>
      </Stack>

      <Stack
        sx={{
          position: "absolute",
          bottom: "0",
          right: "0",
          padding: "20px",
          zIndex: -9999,
          opacity: 0.3,
        }}
      >
        <TalkingWaves />
      </Stack>
    </Stack>
  );
}
