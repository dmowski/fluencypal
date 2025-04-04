import { Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { Baby, Mic, TrendingUp } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { ClickCard } from "./ClickCard";
import { useLingui } from "@lingui/react";

export const ConversationSelectCard = () => {
  const aiConversation = useAiConversation();
  const { i18n } = useLingui();
  return (
    <DashboardCard>
      <Stack>
        <Typography variant="h2" className="decor-title">
          {i18n._(`Conversation`)}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          {i18n._(`Start a conversation with the AI`)}
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
          title={i18n._(`Conversation practice`)}
          subTitle={i18n._(`Talk to the AI and it will respond to you`)}
          buttonIcon={<Mic size={"30px"} />}
          onStart={() => aiConversation.startConversation({ mode: "talk" })}
        />

        <ClickCard
          isDone={false}
          title={i18n._(`Beginner mode`)}
          subTitle={i18n._(`An easy mode for beginners`)}
          buttonIcon={<Baby size={"30px"} />}
          onStart={() => aiConversation.startConversation({ mode: "beginner" })}
        />
      </Stack>
    </DashboardCard>
  );
};
