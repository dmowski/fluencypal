import { useLingui } from "@lingui/react";
import { ConversationCard } from "./ConversationCard";
import { Stack } from "@mui/material";

interface GoalCardProps {
  startOnboarding: () => void;
}
export const GoalCard: React.FC<GoalCardProps> = ({ startOnboarding }) => {
  const { i18n } = useLingui();
  return (
    <ConversationCard
      title={i18n._(`Goal`)}
      subTitle={i18n._(`Set the goal of your learning`)}
      onClick={() => startOnboarding()}
      startColor="#4F46E5"
      endColor="#A78BFA"
      bgColor="#60A5FA"
      icon={
        <Stack>
          <Stack
            style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
            className="avatar"
          >
            <img src="/avatar/map.webp" alt="AI Bot" />
          </Stack>
        </Stack>
      }
      actionLabel={i18n._(`Start | 5 min`)}
    />
  );
};
