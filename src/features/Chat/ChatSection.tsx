"use client";
import { Button, Stack, Typography } from "@mui/material";
import { useChat } from "./useChat";
import { useAuth } from "../Auth/useAuth";
import { SubmitForm } from "./SubmitForm";
import { MessageList } from "./MessageList";
import { useEffect, useMemo } from "react";
import { useUrlState } from "../Url/useUrlParam";
import { ChevronLeft } from "lucide-react";
import { useLingui } from "@lingui/react";
import { Message } from "./Message";
import { useGame } from "../Game/useGame";

export const ChartSection = () => {
  const auth = useAuth();
  const chat = useChat();
  const game = useGame();
  const { i18n } = useLingui();
  const userId = auth.uid || "anonymous";

  const [activeMessageId, setActiveMessageId] = useUrlState("activeMessageId", "", true);

  const activeMessage = chat.messages.find((msg) => msg.id === activeMessageId);

  useEffect(() => {
    chat.markAsRead();
  }, [chat.messages.length]);

  const onCommentClick = (messageId: string) => {
    setActiveMessageId(messageId);
  };

  const submitMessage = async (messageContent: string) => {
    await chat.addMessage({ messageContent, activeMessageId });
  };

  const topLevelMessages = useMemo(() => {
    return chat.messages.filter((msg) => !msg.parentMessageId);
  }, [activeMessageId, chat.messages]);

  const repliesMessages = useMemo(() => {
    if (!activeMessageId) {
      return [];
    }

    return chat.messages.filter((msg) => msg.parentMessageId === activeMessageId);
  }, [activeMessageId, chat.messages]);

  return (
    <Stack
      sx={{
        /// backgroundColor: activeMessageId ? "rgba(255, 255, 255, 0.01)" : "transparent",
        borderRadius: "12px",
        //padding: activeMessageId ? "10px 14px" : "0",
      }}
    >
      {activeMessage ? (
        <Stack
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            gap: "10px",
            overflow: "hidden",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              padding: "10px 10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(255, 255, 255, 0.031)",
              gap: "10px",
            }}
          >
            <Button
              startIcon={<ChevronLeft />}
              onClick={() => setActiveMessageId(activeMessage.parentMessageId || "")}
            >
              {i18n._("Back")}
            </Button>
          </Stack>
          <Message
            key={activeMessage.id}
            userAvatarUrl={game.getUserAvatarUrl(activeMessage.senderId)}
            message={activeMessage}
            isOwnMessage={activeMessage.senderId === userId}
            userName={game.getUserName(activeMessage.senderId)}
            onEdit={chat.editMessage}
            onDelete={chat.deleteMessage}
            onCommentClick={() => onCommentClick(activeMessage.id)}
            commentsCount={chat.commentsInfo[activeMessage.id] || 0}
          />
          <Stack
            sx={{
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              padding: "0px",
              background: "rgba(255, 255, 255, 0.005)",
            }}
          >
            <Stack
              sx={{
                padding: "20px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                background: "rgba(17, 157, 218, 0.13)",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                }}
              >
                {i18n._("Replies:")}
              </Typography>
            </Stack>

            {repliesMessages.length === 0 ? (
              <Typography color="textSecondary">{i18n._("No replies yet")}</Typography>
            ) : (
              <MessageList
                messages={repliesMessages}
                currentUserId={userId}
                onEdit={chat.editMessage}
                onDelete={chat.deleteMessage}
                onCommentClick={onCommentClick}
              />
            )}
          </Stack>
          <Stack
            sx={{
              padding: "15px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <SubmitForm
              onSubmit={submitMessage}
              isLoading={chat.loading}
              recordMessageTitle={i18n._("Add a reply")}
            />
          </Stack>
        </Stack>
      ) : (
        <Stack
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
          }}
        >
          <MessageList
            messages={topLevelMessages}
            currentUserId={userId}
            onEdit={chat.editMessage}
            onDelete={chat.deleteMessage}
            onCommentClick={onCommentClick}
          />
          <Stack
            sx={{
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "15px",
            }}
          >
            <SubmitForm
              onSubmit={submitMessage}
              isLoading={chat.loading}
              recordMessageTitle={i18n._("Record Message")}
            />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
