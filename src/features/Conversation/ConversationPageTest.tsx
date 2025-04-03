"use client";
import { Divider, Stack } from "@mui/material";
import { ConversationCanvas } from "./ConversationCanvas";
import { SupportedLanguage } from "@/common/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { sleep } from "openai/core.mjs";
import { useWebCam } from "../webCam/useWebCam";
import { ConversationCanvas2 } from "./ConversationCanvas2";
import { ChatMessage } from "@/common/conversation";
import { GuessGameStat } from "./types";
import { useState } from "react";

interface ConversationPageTestProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPageTest({ rolePlayInfo, lang }: ConversationPageTestProps) {
  const webCam = useWebCam();

  const initWebCam = async () => {
    webCam.init();
  };

  const descriptionFromWebCam = async () => {
    const imageDescription = await webCam.getImageDescription();
    console.log("imageDescription", imageDescription);
  };

  const testMessage: ChatMessage[] = [
    {
      isBot: true,
      text: `Hello, I’m Ash, your polite speech corrector. Let's start with a simple topic. What do you think about sunny days?\n`,
      id: "1",
    },
    {
      isBot: false,
      text: `I do well, thank you! Hello\n`,
      id: "2",
    },
    {
      isBot: true,
      text: `Hello, how are you?\n`,
      id: "3",
    },
    {
      isBot: false,
      text: `I do well, thank you! Hello. Let's start with a simple topic. What do you think about sunny days?\n`,
      id: "4",
    },
    {
      isBot: true,
      text: `Hello, how are you?\n`,
      id: "5",
    },
    {
      isBot: false,
      text: `I do well, thank you! Hello\n`,
      id: "6",
    },
    {
      isBot: false,
      text: `I do well, thank you! Let's start with a simple topic. What do you think about sunny days?\n`,
      id: "7",
    },
    {
      isBot: true,
      text: `Hello, how are you? Let's start with a simple topic. What do you think about sunny days?\n`,
      id: "8",
    },
    {
      isBot: false,
      text: `I do well, thank you! Hello\n`,
      id: "9",
    },
    {
      isBot: false,
      text: `I do well, thank you! Let's start with a simple topic. What do you think about sunny days?\n`,
      id: "10",
    },
    {
      isBot: true,
      text: `Hello, how are you? Let's start with a simple topic. What do you think about sunny days?\n`,
      id: "11",
    },
    {
      isBot: false,
      text: `I do well, thank you! Hello\n`,
      id: "12",
    },
  ].filter((message, index) => index < 20);

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

  const [isAnalyzingResponse, setIsAnalyzingResponse] = useState(false);

  return (
    <Stack>
      <ConversationCanvas2
        conversation={testMessage}
        analyzeUserMessage={async (message: string) => {
          await sleep(1000);
          return {
            correctedMessage: "Nice to s you!",
            description: "Fees",
            sourceMessage: message,
          };
        }}
        isAiSpeaking={false}
        gameWords={gameStat}
        isShowUserInput={true}
        setIsShowUserInput={() => alert("User input toggled")}
        isMuted={false}
        isVolumeOn={true}
        toggleVolume={() => alert("Volume toggled")}
        isClosed={false}
        isClosing={false}
        isSavingHomework={false}
        isUserSpeaking={false}
        toggleMute={() => initWebCam()}
        finishLesson={async () => descriptionFromWebCam()}
        doneConversation={async () => alert("Conversation done")}
        addUserMessage={async () => alert("Message added")}
        fullLanguageName={"English"}
        generateText={async () => "Text generated"}
        balanceHours={0.2}
        togglePaymentModal={() => alert("Payment modal toggled")}
        isRecording={true}
        startRecording={async () => {}}
        stopRecording={async () => {}}
        cancelRecording={async () => {}}
        isTranscribing={false}
        transcriptMessage="Nice to see you!"
        recordingMilliSeconds={0}
        recordVisualizerComponent={
          <Stack
            sx={{
              width: "300px",
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
        }
      />
    </Stack>
  );
}
