"use client";
import { Divider, Stack } from "@mui/material";
import { SupportedLanguage } from "@/features/Lang/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { sleep } from "@/libs/sleep";
import { ConversationCanvas2 } from "./ConversationCanvas2";
import { ChatMessage } from "@/common/conversation";
import { GuessGameStat } from "./types";
import { useEffect, useState } from "react";
import { useAiConversation } from "./useAiConversation";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { useSettings } from "../Settings/useSettings";
import { useTextAi } from "../Ai/useTextAi";
import { GoalPlan } from "../Plan/types";

interface ConversationPageTestProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

const startTestMessages: ChatMessage[] = [];

for (let i = 0; i < 7; i++) {
  startTestMessages.push({
    isBot: i % 2 === 0,
    text: `Hello, I’m Ash, your polite speech corrector. Let's start with a simple topic. What do you think about sunny days?\nHello, I’m Ash, your polite speech corrector. Let's start with a simple topic. What do you think about sunny days?\nHello, I’m Ash, your polite speech corrector. Let's start with a simple topic. What do you think about sunny days?\nHello, I’m Ash, your polite speech corrector. Let's start with a simple topic. What do you think about sunny days?\nHello, I’m Ash, your polite speech corrector. Let's start with a simple topic. What do you think about sunny days?\n`,
    id: `${i}`,
  });
}

export function ConversationPageTest({ rolePlayInfo, lang }: ConversationPageTestProps) {
  const aiUserInfo = useAiUserInfo();
  const [testMessage, setTestMessage] = useState<ChatMessage[]>(startTestMessages);

  const showGame = false;
  const gameStat: GuessGameStat | null = showGame
    ? {
        wordsUserToDescribe: [
          "Dog",
          "Cat",
          "Elephant",
          "Metal",
          "Wood",
          "Plastic",
          "Paper",
          "Rock",
        ],
        wordsAiToDescribe: ["Dog", "polite"],
      }
    : null;

  const aiConversation = useAiConversation();
  useEffect(() => {
    const isWindows = typeof window !== "undefined";
    if (!isWindows) {
      return;
    }
    setTimeout(() => {
      aiConversation.setIsStarted(true);
    }, 300);
  }, []);

  const analyzeMessage = async ({
    previousBotMessage,
    message,
  }: {
    previousBotMessage: string;
    message: string;
  }) => {
    await sleep(100);
    return {
      correctedMessage: message + ",", //"Nice to be here!",
      description: "Need to pay attention to the grammar",
      sourceMessage: message,
      newWords: ["Hello", "Amazing"],
    };
  };

  const recordVisualizerComponent = (
    <Stack
      sx={{
        width: "200px",
        height: "40px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Divider
        sx={{
          width: "100%",
        }}
      />
    </Stack>
  );

  const generateFirstMessage = async () => {
    setTestMessage([
      {
        isBot: true,
        text: `Loading...\n`,
        id: `${Date.now()}`,
      },
    ]);
    const responseString = await aiUserInfo.generateFirstMessageText("", "en");

    if (responseString) {
      setTestMessage([
        {
          isBot: true,
          text: responseString.firstMessage,
          id: `${Date.now()}`,
        },
        {
          isBot: true,
          text: responseString.potentialTopics,
          id: `${Date.now() + 2}`,
        },
      ]);
    } else {
      setTestMessage([
        {
          isBot: true,
          text: `Sorry, I couldn't generate a message. Please try again.`,
          id: `${Date.now()}`,
        },
      ]);
    }
  };

  const testGoal: GoalPlan | null = null;
  const a = {
    id: "",
    title: "Improve Spontaneous Speaking",
    elements: [
      {
        id: "1",
        title: "Public speaking",
        subTitle: "",
        mode: "conversation",
        description: "",
        startCount: 0,
        details: "",
      },

      {
        id: "1",
        title: "Software Development",
        subTitle: "",
        mode: "conversation",
        description: "",
        startCount: 0,
        details: "",
      },
    ],
    createdAt: 0,
    languageCode: "en",
  };

  return (
    <Stack>
      <ConversationCanvas2
        messagesToComplete={5}
        isOnboarding={true}
        isMuted
        conversationId="1"
        conversation={testMessage}
        analyzeUserMessage={analyzeMessage}
        isAiSpeaking={false}
        gameWords={gameStat}
        isClosed={false}
        isClosing={false}
        addUserMessage={generateFirstMessage}
        balanceHours={0.2}
        togglePaymentModal={() => alert("Payment modal toggled")}
        toggleVolume={() => {}}
        isRecording={false}
        startRecording={async () => {}}
        stopRecording={async () => {}}
        cancelRecording={async () => {}}
        isTranscribing={false}
        transcriptMessage=""
        recordingMilliSeconds={0}
        recordVisualizerComponent={recordVisualizerComponent}
        recordingError={""}
        isProcessingGoal={false}
        temporaryGoal={testGoal}
        confirmGoal={async () => {}}
        goalSettingProgress={0}
        isSavingGoal={false}
        isShowMessageProgress={true}
        conversationAnalysisResult={``}
        closeConversation={async () => {
          alert("Close conversation");
        }}
        analyzeConversation={async () => {}}
        generateHelpMessage={async () => {
          await sleep(2000);
          return "Nice to see you here";
        }}
        isCallMode={true}
        toggleCallMode={() => {}}
        isNeedToShowBalanceWarning={false}
        setIsMuted={() => {}}
        isVolumeOn={true}
        setIsVolumeOn={() => {}}
        voice="ash"
      />
    </Stack>
  );
}
