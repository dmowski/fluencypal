"use client";
import { Stack } from "@mui/material";
import { ConversationCanvas } from "./ConversationCanvas";
import { SupportedLanguage } from "@/common/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { sleep } from "openai/core.mjs";

interface ConversationPageTestProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPageTest({ rolePlayInfo, lang }: ConversationPageTestProps) {
  return (
    <Stack>
      <ConversationCanvas
        conversation={[
          {
            isBot: true,
            text: "Hello, how are you?",
            id: "1",
          },
          {
            isBot: false,
            text: "I do well, thank you! Hello",
            id: "2",
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
        isAiSpeaking={false}
        gameWords={null}
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
          alert("Mute toggled");
        }}
        finishLesson={async () => {
          await sleep(1000);
          alert("Lesson finished");
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
