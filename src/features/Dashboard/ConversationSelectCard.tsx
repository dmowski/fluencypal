import { Button, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { Baby, Mic, TrendingUp } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";

export const ConversationSelectCard = () => {
  const aiConversation = useAiConversation();
  return (
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
            <Typography>Just Talk Mode</Typography>
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
              <Mic
                style={{
                  width: "20px",
                  height: "20px",
                }}
              />
            }
          >
            Start a talk
          </Button>
        </Stack>

        <Stack
          gap={"20px"}
          sx={{
            alignItems: "flex-start",
          }}
        >
          <Stack>
            <Typography>Talk & Correct Mode</Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              Talk to the AI, and it will correct you if you make a mistake
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            size="large"
            onClick={() => aiConversation.startConversation({ mode: "talkAndCorrect" })}
            startIcon={
              <TrendingUp
                style={{
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
              An easy mode for beginners
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            size="large"
            onClick={() => aiConversation.startConversation({ mode: "beginner" })}
            startIcon={
              <Baby
                style={{
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
  );
};
