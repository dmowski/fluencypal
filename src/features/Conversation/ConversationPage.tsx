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
import { useTextAi } from "../Ai/useTextAi";
import { MODELS } from "@/common/ai";
import { ConversationCanvas2 } from "./ConversationCanvas2";
import { useAudioRecorder } from "../Audio/useAudioRecorder";
import { useWords } from "../Words/useWords";

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
  const recorder = useAudioRecorder();
  const words = useWords();

  const analyzeUserMessage = async ({
    previousBotMessage,
    message,
  }: {
    previousBotMessage: string;
    message: string;
  }) => {
    try {
      const newWordsStatsRequest = words.addWordsStatFromText(message);
      const aiResult = await textAi.generate({
        systemMessage: `You are grammar checker system.
Student gives a message, your role is to analyze it from the grammar prospective.

Return your result in JSON format.
Structure of result: {
"correctedMessage": string,
"suggestion": string (use ${lang} language)
}

correctedMessage - return corrected message if need to correct, or return empty string if no correction is needed.
suggestion: A direct message to the student explaining the corrections or empty string if no correction is needed.

Return info in JSON format.
Do not wrap answer with any wrappers like "answer": "...". Your response will be sent to JSON.parse() function.

For context, here is the previous bot message: "${previousBotMessage}".
`,
        userMessage: message,
        model: MODELS.gpt_4o,
      });

      const parsedResult = JSON.parse(aiResult);

      const correctedMessage = parsedResult ? parsedResult?.correctedMessage || message : message;
      const suggestion = parsedResult ? parsedResult?.suggestion || "" : "";

      return {
        correctedMessage: correctedMessage,
        description: suggestion,
        sourceMessage: message,
        newWords: await newWordsStatsRequest,
      };
    } catch (error) {
      console.error("Error analyzing message:", error);
      return {
        correctedMessage: message,
        description: "",
        sourceMessage: message,
        newWords: [],
      };
    }
  };
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
          togglePaymentModal={usage.togglePaymentModal}
          analyzeUserMessage={analyzeUserMessage}
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
