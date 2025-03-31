"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { useAuth } from "../Auth/useAuth";
import { Stack, Typography } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { NoBalanceBlock } from "../Usage/NoBalanceBlock";
import { ConversationCanvas } from "./ConversationCanvas";
import { Dashboard } from "../Dashboard/Dashboard";
import { SupportedLanguage } from "@/common/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { useTextAi } from "../Ai/useTextAi";

interface ConversationPageProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPage({ rolePlayInfo, lang }: ConversationPageProps) {
  const auth = useAuth();
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const usage = useUsage();
  const textAi = useTextAi();
  if (settings.loading || auth.loading)
    return (
      <Stack
        sx={{
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            padding: "20px",
            opacity: 0.3,
          }}
          align="center"
        >
          {auth.loading ? "Loading..." : "Loading."}
        </Typography>
      </Stack>
    );
  if (!auth.isAuthorized) return <SignInForm rolePlayInfo={rolePlayInfo} lang={lang} />;
  if (!usage.loading && usage.balanceHours <= 0.01) return <NoBalanceBlock />;

  return (
    <Stack>
      {aiConversation.isStarted ? (
        <ConversationCanvas
          conversation={aiConversation.conversation}
          isAiSpeaking={aiConversation.isAiSpeaking}
          gameWords={aiConversation.gameWords}
          isShowUserInput={aiConversation.isShowUserInput}
          setIsShowUserInput={aiConversation.setIsShowUserInput}
          isMuted={aiConversation.isMuted}
          isVolumeOn={aiConversation.isVolumeOn}
          toggleVolume={aiConversation.toggleVolume}
          isClosed={aiConversation.isClosed}
          isClosing={aiConversation.isClosing}
          isSavingHomework={aiConversation.isSavingHomework}
          isUserSpeaking={aiConversation.isUserSpeaking}
          toggleMute={aiConversation.toggleMute}
          finishLesson={aiConversation.finishLesson}
          doneConversation={aiConversation.doneConversation}
          addUserMessage={aiConversation.addUserMessage}
          fullLanguageName={settings.fullLanguageName || "English"}
          generateText={textAi.generate}
          balanceHours={usage.balanceHours}
          togglePaymentModal={usage.togglePaymentModal}
        />
      ) : (
        <Dashboard rolePlayInfo={rolePlayInfo} />
      )}
    </Stack>
  );
}
