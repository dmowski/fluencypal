"use client";

import { Markdown } from "../uiKit/Markdown/Markdown";
import { IconButton, Stack, Typography } from "@mui/material";
import { Languages } from "lucide-react";

import { ChatMessage } from "@/common/conversation";
import { useLingui } from "@lingui/react";
import { useTranslate } from "../Translation/useTranslate";

export const Messages = ({ conversation }: { conversation: ChatMessage[] }) => {
  const { i18n } = useLingui();
  const translator = useTranslate();
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
        {conversation
          .filter((message) => !!message.text?.trim())
          .map((message) => {
            const isBot = message.isBot;
            const text = "\n" + (message.text || "").trim();

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
                      translator.isTranslateAvailable
                        ? (word, element) => {
                            translator.translateWithModal(word, element);
                          }
                        : undefined
                    }
                    variant="conversation"
                  >
                    {text}
                  </Markdown>

                  {translator.isTranslateAvailable && (
                    <IconButton
                      onClick={(e) => translator.translateWithModal(message.text, e.currentTarget)}
                    >
                      <Languages size={"16px"} color="#eee" />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            );
          })}
      </Stack>
    </>
  );

  return messages;
};
