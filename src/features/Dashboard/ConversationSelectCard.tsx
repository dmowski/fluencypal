import { Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { Baby, Mic, TrendingUp } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { ClickCard } from "./ClickCard";

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
        <ClickCard
          isDone={false}
          title="Just Talk Mode"
          subTitle="Talk to the AI and it will respond to you"
          buttonIcon={<Mic size={"30px"} />}
          onStart={() => aiConversation.startConversation({ mode: "talk" })}
        />

        <ClickCard
          isDone={false}
          title="Talk & Correct Mode"
          subTitle="Talk to the AI, and it will correct you if you make a mistake"
          buttonIcon={<TrendingUp size={"30px"} />}
          onStart={() => aiConversation.startConversation({ mode: "talkAndCorrect" })}
        />

        <ClickCard
          isDone={false}
          title="Beginner mode"
          subTitle="An easy mode for beginners"
          buttonIcon={<Baby size={"30px"} />}
          onStart={() => aiConversation.startConversation({ mode: "beginner" })}
        />
      </Stack>
    </DashboardCard>
  );
};
