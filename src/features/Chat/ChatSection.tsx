"use client";
import { Button, Stack, Typography } from "@mui/material";
import { useChat } from "./useChat";
import { useAuth } from "../Auth/useAuth";
import { SubmitForm } from "./SubmitForm";
import { useEffect, useMemo, useState } from "react";
import { useUrlState } from "../Url/useUrlParam";
import { ChevronLeft } from "lucide-react";
import { useLingui } from "@lingui/react";
import { Message } from "./Message";
import { useGame } from "../Game/useGame";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Avatar } from "../Game/Avatar";
import { ColorIconTextList } from "../Survey/ColorIconTextList";
import AddIcon from "@mui/icons-material/Add";
import { MessageChain } from "./MessageChain";

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

  const messageToComment = useMemo(() => {
    return chat.messages.find((msg) => msg.id === chat.activeCommentMessageId);
  }, [chat.activeCommentMessageId, chat.messages]);

  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  const isModalOpen = messageToComment || isNewPostModalOpen;
  const [isActiveRecording, setIsActiveRecording] = useState(false);

  const onCloseRecordMessageModal = () => {
    if (isActiveRecording) {
      alert(i18n._("Please stop the recording before closing the window."));
      return;
    }
    chat.setActiveCommentMessageId("");
    setIsNewPostModalOpen(false);
  };

  return (
    <Stack
      sx={{
        borderRadius: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
      }}
    >
      {isModalOpen && (
        <CustomModal onClose={onCloseRecordMessageModal} isOpen={true}>
          <Stack
            sx={{
              maxWidth: "600px",
              gap: "20px",
              width: "100%",
            }}
          >
            <Stack sx={{ marginBottom: "10px" }}>
              <Typography variant="h6">
                {isNewPostModalOpen ? i18n._("Add New Post") : i18n._("Add Comment")}
              </Typography>

              {isNewPostModalOpen && (
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._("Share your thoughts with the community!")}
                </Typography>
              )}
            </Stack>

            {isNewPostModalOpen && (
              <Stack
                sx={{
                  padding: "0px 0 20px 0",
                }}
              >
                <ColorIconTextList
                  iconSize="18px"
                  gap="10px"
                  listItems={[
                    {
                      title: i18n._("Share news, ideas or ask questions"),
                      iconName: "message-circle",
                    },
                    {
                      title: i18n._("Receive feedback and support"),
                      iconName: "thumbs-up",
                    },
                    {
                      title: i18n._("Build connections"),
                      iconName: "users",
                    },
                    {
                      title: i18n._("Earn game points!"),
                      iconName: "bell",
                    },
                  ]}
                />
              </Stack>
            )}

            <Stack
              sx={{
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                backgroundColor: "rgba(30, 38, 50, 0.9)",
              }}
            >
              {messageToComment && (
                <Message isContentWide key={messageToComment.id} message={messageToComment} />
              )}

              <Stack>
                <SubmitForm
                  setIsActiveRecording={setIsActiveRecording}
                  onSubmit={async (messageContent) => {
                    await chat.addMessage({
                      messageContent,
                      parentMessageId: messageToComment?.id ? messageToComment.id : "",
                    });
                    onCloseRecordMessageModal();
                  }}
                  isLoading={chat.loading}
                  recordMessageTitle={
                    messageToComment?.id ? i18n._("Add a reply") : i18n._("Record a message")
                  }
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
            "@media (max-width: 700px)": {
              borderRadius: "0px",
              border: "none",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            },
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
          <MessageChain topLevel parentId={activeMessage.id} />
        </Stack>
      ) : (
        <Stack
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",

            "@media (max-width: 700px)": {
              borderRadius: "0px",
              border: "none",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <Stack
            sx={{
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              flexDirection: "row",
              alignItems: "center",
              padding: "20px 20px 20px 15px",
              gap: "15px",
            }}
            onClick={() => setIsNewPostModalOpen(true)}
          >
            <Avatar url={game.getUserAvatarUrl(userId)} avatarSize="35px" />
            <Stack
              sx={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack>
                <Typography
                  sx={{
                    //opacity: 0.6,
                    fontWeight: 600,
                  }}
                >
                  {game.myUserName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.6,
                  }}
                >
                  {i18n._("What's new?")}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                color="info"
                sx={{
                  width: "auto",
                  "@media (max-width: 400px)": {
                    display: "none",
                  },
                }}
                startIcon={<AddIcon />}
                onClick={() => setIsNewPostModalOpen(true)}
              >
                {i18n._("Add Post")}
              </Button>
            </Stack>
          </Stack>

          <MessageChain topLevel parentId={""} />
        </Stack>
      )}
    </Stack>
  );
};
