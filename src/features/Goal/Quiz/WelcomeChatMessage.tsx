import { useAuth } from "@/features/Auth/useAuth";
import { ChatSection } from "@/features/Chat/ChatSection";
import { ChatProvider, useChat } from "@/features/Chat/useChat";
import { GameMyAvatar } from "@/features/Game/GameMyAvatar";
import { GameMyUsername } from "@/features/Game/GameMyUsername";
import { useGame } from "@/features/Game/useGame";
import { InfoStep } from "@/features/Survey/InfoStep";
import { useLingui } from "@lingui/react";
import { Stack, Typography } from "@mui/material";
import { Crown, Origami, PawPrint } from "lucide-react";

interface WelcomeChatMessageProps {
  done: () => void;
  exampleToRecord?: string;
  isLoading: boolean;
  title: string;
  subTitle: string;
  actionButtonTitle: string;
}

const WelcomeChatMessageComponent = (props: WelcomeChatMessageProps) => {
  const { i18n } = useLingui();
  const chat = useChat();
  const auth = useAuth();
  const game = useGame();
  const myPoints = game.myPoints || 0;
  const myUserIds = auth.uid;

  const isDone =
    myPoints > 1 ||
    chat.messages.some((msg) => msg.senderId === myUserIds && msg.content.trim().length > 0);

  const exampleToRecord = props.exampleToRecord ? (
    <Stack
      sx={{
        alignItems: "center",
        padding: "15px 15px",
        borderRadius: "15px",
        gap: "15px",
        backgroundColor: "rgba(99, 177, 135, 0.1)",
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          gridTemplateColumns: "auto 1fr",
          gap: "15px",
        }}
      >
        <Stack
          sx={{
            background: "linear-gradient(45deg, rgba(99, 177, 135, 1) 0%, #7bd5a1 100%)",
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PawPrint color="#fff" size={"21px"} strokeWidth={"2px"} />
        </Stack>
        <Typography variant="h6">{i18n._(`Example:`)}</Typography>
      </Stack>

      <Stack
        sx={{
          gap: "2px",
        }}
      >
        <Typography>{props.exampleToRecord}</Typography>
        <Typography
          sx={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {i18n._(`You can also share fun facts about yourself or your goals!`)}
        </Typography>
      </Stack>
    </Stack>
  ) : null;

  return (
    <InfoStep
      title={props.title}
      subTitle={props.subTitle}
      onClick={props.done}
      subComponent={
        <Stack
          sx={{
            paddingTop: "20px",
            gap: "20px",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "15px",
              width: "max-content",
            }}
          >
            <GameMyAvatar avatarSize="45px" />
            <GameMyUsername align={"flex-start"} />
          </Stack>
          {exampleToRecord}
          <ChatSection
            contextForAiAnalysis=""
            limitTopMessages={4}
            titleContent={exampleToRecord}
          />
        </Stack>
      }
      disabled={props.isLoading || !isDone}
      actionButtonTitle={props.actionButtonTitle}
      isStepLoading={props.isLoading}
    />
  );
};

export const WelcomeChatMessage = (props: WelcomeChatMessageProps) => {
  return (
    <ChatProvider
      metadata={{
        spaceId: "global",
        allowedUserIds: null,
        isPrivate: false,
        type: "global",
      }}
    >
      <WelcomeChatMessageComponent {...props} />
    </ChatProvider>
  );
};
