"use client";

import { Markdown } from "../uiKit/Markdown/Markdown";
import { IconButton, Stack, Typography } from "@mui/material";
import { Languages } from "lucide-react";

import { ChatMessage, MessagesOrderMap } from "@/common/conversation";
import { useLingui } from "@lingui/react";
import { useTranslate } from "../Translation/useTranslate";
import { useMemo } from "react";

export const Messages = ({
  conversation,
  messageOrder,
}: {
  conversation: ChatMessage[];
  messageOrder: MessagesOrderMap;
}) => {
  const { i18n } = useLingui();
  const translator = useTranslate();

  const sortedMessages = useMemo(() => {
    // --- 1. Build sortedIds ---
    const sortedIds: string[] = [];

    if (!messageOrder || Object.keys(messageOrder).length === 0) {
      return conversation;
    }

    const parents = new Set(Object.keys(messageOrder));
    const children = new Set(Object.values(messageOrder));

    // Root = parent that is never a child
    const rootId = [...parents].find((id) => !children.has(id));

    if (!rootId) {
      // Fallback: return original order if chain is broken
      return conversation;
    }

    let currentId: string | undefined = rootId;

    while (currentId) {
      sortedIds.push(currentId);
      currentId = messageOrder[currentId];
    }

    // --- 2. Sort messages by sortedIds ---
    const orderIndex = new Map(sortedIds.map((id, index) => [id, index]));

    return [...conversation].sort((a, b) => {
      const aIndex = orderIndex.get(a.id);
      const bIndex = orderIndex.get(b.id);

      // both in chain
      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }

      // only one in chain → chain comes first
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;

      // neither in chain → keep original relative order
      return 0;
    });
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
        {sortedMessages.map((message) => {
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
