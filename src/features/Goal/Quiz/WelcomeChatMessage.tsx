import { useAuth } from "@/features/Auth/useAuth";
import { ChatSection } from "@/features/Chat/ChatSection";
import { ChatProvider, useChat } from "@/features/Chat/useChat";
import { GameMyAvatar } from "@/features/Game/GameMyAvatar";
import { GameMyUsername } from "@/features/Game/GameMyUsername";
import { useGame } from "@/features/Game/useGame";
import { ColorIconTextList } from "@/features/Survey/ColorIconTextList";
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
        alignItems: "flex-start",
        padding: "15px 15px",
        borderRadius: "15px",
        gap: "5px",
        backgroundColor: "rgba(99, 177, 135, 0.1)",
      }}
    >
      <Typography variant="h6">{i18n._(`Hint:`)}</Typography>
      <ColorIconTextList
        gap="10px"
        listItems={[
          {
            title: i18n._(`You can use any language.`),
            iconName: "languages",
            iconColor: "#a8f3cbff",
          },
          {
            title: i18n._(`Share fun facts about yourself`),
            iconName: "crown",
            iconColor: "#a8f3cbff",
          },
          {
            title: i18n._(`What recently made you happy?`),
            iconName: "paw-print",
            iconColor: "#a8f3cbff",
          },
        ]}
      />
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
