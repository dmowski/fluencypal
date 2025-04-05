"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { useAuth } from "../Auth/useAuth";
import { Stack, Typography } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { NoBalanceBlock } from "../Usage/NoBalanceBlock";
import { Dashboard } from "../Dashboard/Dashboard";
import { SupportedLanguage } from "@/common/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";

import { ConversationCanvas2 } from "./ConversationCanvas2";
import { useAudioRecorder } from "../Audio/useAudioRecorder";
import { useCorrections } from "../Corrections/useCorrections";

interface ConversationPageProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPage({ rolePlayInfo, lang }: ConversationPageProps) {
  const auth = useAuth();
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const usage = useUsage();
  const recorder = useAudioRecorder();
  const corrections = useCorrections();

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
        <ConversationCanvas2
          conversation={aiConversation.conversation}
          isAiSpeaking={aiConversation.isAiSpeaking}
          gameWords={aiConversation.gameWords}
          isClosed={aiConversation.isClosed}
          isClosing={aiConversation.isClosing}
          isSavingHomework={aiConversation.isSavingHomework}
          addUserMessage={async (message) => {
            recorder.removeTranscript();
            await aiConversation.addUserMessage(message);
          }}
          balanceHours={usage.balanceHours}
          conversationId={aiConversation.conversationId}
          togglePaymentModal={usage.togglePaymentModal}
          analyzeUserMessage={corrections.analyzeUserMessage}
          transcriptMessage={recorder.transcription || ""}
          startRecording={recorder.startRecording}
          stopRecording={recorder.stopRecording}
          cancelRecording={recorder.cancelRecording}
          isTranscribing={recorder.isTranscribing}
          isRecording={recorder.isRecording}
          recordingMilliSeconds={recorder.recordingMilliSeconds}
          recordVisualizerComponent={recorder.visualizerComponent}
          recordingError={recorder.error}
        />
      ) : (
        <Dashboard rolePlayInfo={rolePlayInfo} />
      )}
    </Stack>
  );
}
