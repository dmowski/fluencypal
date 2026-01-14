"use client";

import { Markdown } from "../uiKit/Markdown/Markdown";
import { IconButton, Stack, Typography } from "@mui/material";
import { AudioLines, AudioWaveform, Languages } from "lucide-react";

import { ChatMessage, MessagesOrderMap } from "@/common/conversation";
import { useLingui } from "@lingui/react";
import { useTranslate } from "../Translation/useTranslate";
import { useMemo, useState } from "react";
import { getSortedMessages } from "./getSortedMessages";

export const Messages = ({
  conversation,
  messageOrder,
  isAiSpeaking,
}: {
  conversation: ChatMessage[];
  messageOrder: MessagesOrderMap;
  isAiSpeaking?: boolean;
}) => {
  const translator = useTranslate();

  const sortedMessages = useMemo(() => {
    const messages = getSortedMessages({ conversation, messageOrder });
    const messagesData = messages.map((msg, index, all) => {
      const lastMessage = all[all.length - 1];
      const isLastIsBot = lastMessage?.isBot;
      const isThisIsLast = index === all.length - 1;
      return {
        message: msg,
        isSpeaking: isThisIsLast && isLastIsBot && isAiSpeaking,
      };
    });
    return messagesData;
  }, [conversation, messageOrder]);

  const messages = (
    <>
      {translator.translateModal}
      <Stack
        sx={{
          gap: "40px",
          paddingTop: "60px",
          width: "100%",
        }}
      >
        {sortedMessages.map(({ message, isSpeaking }) => {
          return <Message key={message.id} message={message} isAiSpeaking={isSpeaking} />;
        })}
      </Stack>
    </>
  );

  return messages;
};

export const Message = ({
  message,
  isAiSpeaking,
}: {
  message: ChatMessage;
  isAiSpeaking?: boolean;
}) => {
  const { i18n } = useLingui();
  const translator = useTranslate();

  const isBot = message.isBot;

  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const toggleTranslation = async () => {
    setIsTranslating(true);
    if (translatedText) {
      setTranslatedText("");
    } else {
      const result = await translator.translateText({ text: message?.text || "" });
      setTranslatedText("\n" + result.trim());
    }
    setIsTranslating(false);
  };

  const text = translatedText || "\n" + (message.text || "").trim();

  return (
    <Stack
      key={message.id}
      sx={{
        padding: "0 20px",
        boxSizing: "border-box",
        color: "#e1e1e1",
        width: "100%",
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            opacity: 0.5,
          }}
        >
          {isBot ? i18n._("Teacher:") : i18n._("You:")}{" "}
        </Typography>
        <AudioLines
          size={"14px"}
          style={{
            color: "#b5dbff",
            opacity: isAiSpeaking ? 1 : 0,
          }}
        />
      </Stack>

      <Stack
        sx={{
          display: "inline-block",
        }}
      >
        <Markdown
          onWordClick={
            translator.isTranslateAvailable && !translatedText
              ? (word, element) => {
                  translator.translateWithModal(word, element);
                }
              : undefined
          }
          variant="conversation"
        >
          {text}
        </Markdown>

        {translator.isTranslateAvailable && text && (
          <IconButton onClick={toggleTranslation} disabled={isTranslating}>
            <Languages size={"16px"} color={isTranslating ? "#4cd1fdff" : "#eee"} />
          </IconButton>
        )}
      </Stack>
      {translator.translateModal}
    </Stack>
  );
};
