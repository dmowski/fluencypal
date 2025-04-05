import { Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import {
  Baby,
  BicepsFlexed,
  Flag,
  GraduationCap,
  MapPinCheckInside,
  Mic,
  MoveRight,
  TrendingUp,
} from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { ClickCard } from "./ClickCard";
import { useLingui } from "@lingui/react";
import { GradientBgCard } from "../uiKit/Card/GradientBgCard";

export const ConversationSelectCard = () => {
  const aiConversation = useAiConversation();
  const { i18n } = useLingui();
  return (
    <DashboardCard>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          gap: "15px",
          paddingBottom: "10px",
        }}
      >
        <Stack
          sx={{
            borderRadius: "50%",
            background: "linear-gradient(45deg,rgb(25, 78, 142) 0%,rgb(109, 209, 151) 100%)",
            height: "50px",
            width: "50px",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <GraduationCap size={"25px"} />
        </Stack>
        <Typography variant="h6">{i18n._(`Practice`)}</Typography>
      </Stack>
      <Stack
        sx={{
          gap: "20px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          "@media (max-width: 850px)": {
            gridTemplateColumns: "1fr",
            gap: "40px",
          },
        }}
      >
        <GradientBgCard
          title={i18n._(`Introduce yourself`)}
          subTitle={i18n._(`Set the goal of your learning`)}
          onClick={() => aiConversation.startConversation({ mode: "beginner" })}
          value={""}
          startColor="#FF512F"
          endColor="#43C6AC"
          bgColor="#FFE259"
          actionButton={
            <Stack
              sx={{
                paddingTop: "70px",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "flex-end",
                flexDirection: "row",
              }}
            >
              <Flag size={40} />
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                  padding: "10px 14px 10px 10px",
                  borderRadius: "8px",
                }}
              >
                <Typography variant="body2">{i18n._(`Start`)}</Typography>
                <MoveRight size="10px" />
              </Stack>
            </Stack>
          }
        />

        <GradientBgCard
          title={i18n._(`Conversation practice`)}
          subTitle={i18n._(`Talk to the AI and it will respond to you`)}
          onClick={() => aiConversation.startConversation({ mode: "talk" })}
          value={""}
          startColor="#43C6AC"
          endColor="#191654"
          bgColor="#ff22ee"
          actionButton={
            <Stack
              sx={{
                paddingTop: "70px",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "flex-end",
                flexDirection: "row",
              }}
            >
              <Mic size={40} />
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                  padding: "10px 14px 10px 10px",
                  borderRadius: "8px",
                }}
              >
                <Typography variant="body2">{i18n._(`Start Talking`)}</Typography>
                <MoveRight size="10px" />
              </Stack>
            </Stack>
          }
        />

        <GradientBgCard
          title={i18n._(`Beginner mode`)}
          subTitle={i18n._(`AI will lead you through the conversation`)}
          onClick={() => aiConversation.startConversation({ mode: "beginner" })}
          value={""}
          startColor="#5F0A87"
          endColor="#A4508B"
          bgColor="#FFB199"
          actionButton={
            <Stack
              sx={{
                paddingTop: "70px",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "flex-end",
                flexDirection: "row",
              }}
            >
              <MapPinCheckInside size={40} />
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                  padding: "10px 14px 10px 10px",
                  borderRadius: "8px",
                }}
              >
                <Typography variant="body2">{i18n._(`Guide me`)}</Typography>
                <MoveRight size="10px" />
              </Stack>
            </Stack>
          }
        />
      </Stack>
    </DashboardCard>
  );
};
