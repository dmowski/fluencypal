"use client";

import { Markdown } from "../uiKit/Markdown/Markdown";
import { IconButton, Stack, Typography } from "@mui/material";
import { Languages } from "lucide-react";

import { ChatMessage, MessagesOrderMap } from "@/common/conversation";
import { useLingui } from "@lingui/react";
import { useTranslate } from "../Translation/useTranslate";
import { useMemo, useState } from "react";
import { getSortedMessages } from "./getSortedMessages";

export const Messages = ({
  conversation,
  messageOrder,
}: {
  conversation: ChatMessage[];
  messageOrder: MessagesOrderMap;
}) => {
  const translator = useTranslate();

  const sortedMessages = useMemo(
    () => getSortedMessages({ conversation, messageOrder }),
    [conversation, messageOrder]
  );

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
        {sortedMessages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </Stack>
    </>
  );

  return messages;
};

export const Message = ({ message }: { message: ChatMessage }) => {
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
      <Typography
        variant="caption"
        sx={{
          opacity: 0.5,
        }}
      >
        {isBot ? i18n._("Teacher:") : i18n._("You:")}
      </Typography>
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
