"use client";
import { Divider, Stack } from "@mui/material";
import { SupportedLanguage } from "@/common/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { sleep } from "openai/core.mjs";
import { ConversationCanvas2 } from "./ConversationCanvas2";
import { ChatMessage } from "@/common/conversation";
import { GuessGameStat } from "./types";
import { useEffect, useState } from "react";
import { useAiConversation } from "./useAiConversation";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { useSettings } from "../Settings/useSettings";
import { useTextAi } from "../Ai/useTextAi";

interface ConversationPageTestProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPageTest({ rolePlayInfo, lang }: ConversationPageTestProps) {
  const aiUserInfo = useAiUserInfo();
  const settings = useSettings();
  const textAi = useTextAi();
  const [testMessage, setTestMessage] = useState<ChatMessage[]>([
    {
      isBot: true,
      text: `Hello, I’m Ash, your polite speech corrector. Let's start with a simple topic. What do you think about sunny days?\n`,
      id: "1",
    },
    {
      isBot: false,
      text: `I do well, thank you! Hello\n`,
      id: `2`,
    },
  ]);

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
        wordsAiToDescribe: ["Dog"],
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
      correctedMessage: message, //"Nice to be here!",
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
    const responseString = await aiUserInfo.generateFirstMessageText();

    if (responseString) {
      setTestMessage([
        {
          isBot: true,
          text: responseString.firstMessage,
          id: `${Date.now()}`,
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

  return (
    <Stack>
      <ConversationCanvas2
        isMuted
        conversationId="1"
        conversation={testMessage}
        analyzeUserMessage={analyzeMessage}
        isAiSpeaking={false}
        gameWords={gameStat}
        isClosed={false}
        isClosing={false}
        isSavingHomework={false}
        addUserMessage={generateFirstMessage}
        balanceHours={0.2}
        togglePaymentModal={() => alert("Payment modal toggled")}
        isRecording={false}
        startRecording={async () => {}}
        stopRecording={async () => {}}
        cancelRecording={async () => {}}
        isTranscribing={false}
        transcriptMessage="Nice to see you!"
        recordingMilliSeconds={0}
        recordVisualizerComponent={recordVisualizerComponent}
        recordingError={""}
      />
    </Stack>
  );
}
