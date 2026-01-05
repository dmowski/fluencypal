"use client";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useChat } from "./useChat";
import { useAuth } from "../Auth/useAuth";
import { SubmitForm } from "./SubmitForm";
import { MessageList } from "./MessageList";
import { useEffect, useMemo, useState } from "react";
import { useUrlState } from "../Url/useUrlParam";
import { ChevronLeft } from "lucide-react";
import { useLingui } from "@lingui/react";
import { Message } from "./Message";
import { useGame } from "../Game/useGame";
import { CustomModal } from "../uiKit/Modal/CustomModal";

export const ChartSection = () => {
  const auth = useAuth();
  const chat = useChat();
  const game = useGame();
  const { i18n } = useLingui();
  const userId = auth.uid || "anonymous";

  const [activeMessageId, setActiveMessageId] = useUrlState("post", "", true);
  const activeMessage = chat.messages.find((msg) => msg.id === activeMessageId);

  useEffect(() => {
    chat.markAsRead();
  }, [chat.messages.length]);

  const [activeMessageIdComment, setActiveMessageIdComment] = useState("");
  const messageToComment = useMemo(() => {
    return chat.messages.find((msg) => msg.id === activeMessageIdComment);
  }, [activeMessageIdComment, chat.messages]);

  const onCommentClick = (messageId: string) => {
    setActiveMessageIdComment(messageId);
  };

  const onOpen = (messageId: string) => {
    setActiveMessageId(messageId);
  };

  const repliesMessages = useMemo(() => {
    if (!activeMessageId) {
      return [];
    }

    return chat.messages.filter((msg) => msg.parentMessageId === activeMessageId);
  }, [activeMessageId, chat.messages]);

  const deleteMessage = async (messageId: string) => {
    const isConfirmed = window.confirm(i18n._("Are you sure you want to delete this message?"));
    if (!isConfirmed) return;
    await chat.deleteMessage(messageId);

    if (activeMessageId === messageId) {
      setActiveMessageId("");
    }
  };

  return (
    <Stack
      sx={{
        borderRadius: "12px",
      }}
    >
      {messageToComment && (
        <CustomModal onClose={() => setActiveMessageIdComment("")} isOpen={true}>
          <Stack
            sx={{
              maxWidth: "600px",
              gap: "20px",
            }}
          >
            <Typography variant="h6" align="center" sx={{ marginBottom: "10px" }}>
              {i18n._("Add Comment")}
            </Typography>
            <Stack
              sx={{
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
              }}
            >
              <Message
                onOpen={onOpen}
                key={messageToComment.id}
                userAvatarUrl={game.getUserAvatarUrl(messageToComment.senderId)}
                message={messageToComment}
                isOwnMessage={messageToComment.senderId === userId}
                userName={game.getUserName(messageToComment.senderId)}
                onEdit={chat.editMessage}
                onDelete={deleteMessage}
                onCommentClick={() => onCommentClick(messageToComment.id)}
                commentsCount={chat.commentsInfo[messageToComment.id] || 0}
              />

              <Stack
                sx={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <SubmitForm
                  onSubmit={(messageContent) =>
                    chat.addMessage({ messageContent, parentMessageId: messageToComment.id })
                  }
                  isLoading={chat.loading}
                  recordMessageTitle={i18n._("Add a reply")}
                />
              </Stack>
            </Stack>
          </Stack>
        </CustomModal>
      )}
      {activeMessage ? (
        <Stack
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            gap: "0px",
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
            onOpen={onOpen}
            key={activeMessage.id}
            userAvatarUrl={game.getUserAvatarUrl(activeMessage.senderId)}
            message={activeMessage}
            isOwnMessage={activeMessage.senderId === userId}
            userName={game.getUserName(activeMessage.senderId)}
            onEdit={chat.editMessage}
            onDelete={deleteMessage}
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
              <Stack>
                <Alert severity="info" sx={{ marginTop: "10px" }} title="asd">
                  {i18n._("No replies yet. Be the first to reply to this message.")}
                </Alert>
              </Stack>
            ) : (
              <MessageList
                messages={repliesMessages.sort((a, b) =>
                  a.createdAtIso.localeCompare(b.createdAtIso)
                )}
                currentUserId={userId}
                onOpen={onOpen}
                onEdit={chat.editMessage}
                onDelete={deleteMessage}
                onCommentClick={onCommentClick}
              />
            )}
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
            messages={chat.topLevelMessages}
            currentUserId={userId}
            onEdit={chat.editMessage}
            onDelete={deleteMessage}
            onCommentClick={onCommentClick}
            onOpen={onOpen}
          />
          <Stack
            sx={{
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <SubmitForm
              onSubmit={(messageContent) =>
                chat.addMessage({ messageContent, parentMessageId: "" })
              }
              isLoading={chat.loading}
              recordMessageTitle={i18n._("Record Message")}
            />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
