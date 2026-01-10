import { useAuth } from "@/features/Auth/useAuth";
import { ChatSection } from "@/features/Chat/ChatSection";
import { ChatProvider, useChat } from "@/features/Chat/useChat";
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
  const myUserIds = auth.uid;

  const isSendMessage = chat.messages.some(
    (msg) => msg.senderId === myUserIds && msg.content.trim().length > 0
  );

  const exampleToRecord = props.exampleToRecord ? (
    <Stack
      sx={{
        flexDirection: "row",
        alignItems: "center",
        padding: "15px 15px",
        borderRadius: "8px",
        gap: "12px",
        backgroundColor: "rgba(99, 177, 135, 0.1)",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
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

      <Stack
        sx={{
          gap: "2px",
        }}
      >
        <Typography
          sx={{
            opacity: 0.7,
          }}
          variant="body2"
        >
          {i18n._(`Example:`)}
        </Typography>
        <Typography>{props.exampleToRecord}</Typography>
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
          {exampleToRecord}
          <ChatSection
            contextForAiAnalysis=""
            limitTopMessages={3}
            titleContent={exampleToRecord}
          />
        </Stack>
      }
      disabled={props.isLoading || !isSendMessage}
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
