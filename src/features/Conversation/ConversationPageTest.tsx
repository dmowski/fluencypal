"use client";
import { Stack } from "@mui/material";
import { ConversationCanvas } from "./ConversationCanvas";
import { SupportedLanguage } from "@/common/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { sleep } from "openai/core.mjs";
import { useWebCam } from "../webCam/useWebCam";
import { ConversationCanvas2 } from "./ConversationCanvas2";

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

  return (
    <Stack>
      <ConversationCanvas2
        conversation={[
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
        ]}
        analyzeUserMessage={async (message: string) => {
          await sleep(300);
          return {
            correctedMessage: "I do well, thank you!",
            description: "Need to pay attention to the verb form.",
            sourceMessage: "I do well, thank you! Hello",
          };
        }}
        isAiSpeaking={true}
        gameWords={
          null /*{
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
        }*/
        }
        isShowUserInput={true}
        setIsShowUserInput={() => {
          alert("User input toggled");
        }}
        isMuted={false}
        isVolumeOn={true}
        toggleVolume={() => {
          alert("Volume toggled");
        }}
        isClosed={false}
        isClosing={false}
        isSavingHomework={false}
        isUserSpeaking={false}
        toggleMute={() => {
          initWebCam();
        }}
        finishLesson={async () => {
          descriptionFromWebCam();
        }}
        doneConversation={async () => {
          await sleep(1000);
          alert("Conversation done");
        }}
        addUserMessage={async () => {
          await sleep(1000);
          alert("Message added");
        }}
        fullLanguageName={"English"}
        generateText={async () => {
          await sleep(1000);
          return "Text generated";
        }}
        balanceHours={0.2}
        togglePaymentModal={() => {
          alert("Payment modal toggled");
        }}
      />
    </Stack>
  );
}
