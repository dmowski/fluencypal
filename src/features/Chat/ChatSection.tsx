"use client";
import { Button, Stack, Typography } from "@mui/material";
import { useChat } from "./useChat";
import { useAuth } from "../Auth/useAuth";
import { SubmitForm } from "./SubmitForm";
import { useMemo, useState } from "react";
import { useUrlState } from "../Url/useUrlParam";
import { ChevronLeft, Eye } from "lucide-react";
import { useLingui } from "@lingui/react";
import { Message } from "./Message";
import { useGame } from "../Game/useGame";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Avatar } from "../Game/Avatar";
import AddIcon from "@mui/icons-material/Add";
import { MessageChain } from "./MessageChain";

export const ChatSection = ({
  placeholder,
  titleContent,
  contextForAiAnalysis,
  addNewPostButtonText,
}: {
  placeholder?: string;
  titleContent?: React.ReactNode;
  contextForAiAnalysis: string;
  addNewPostButtonText?: string;
}) => {
  const auth = useAuth();
  const chat = useChat();
  const game = useGame();
  const { i18n } = useLingui();
  const userId = auth.uid || "anonymous";

  const [activeMessageId, setActiveMessageId] = useUrlState("post", "", true);
  const activeMessage = chat.messages.find((msg) => msg.id === activeMessageId);

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
              {!titleContent && (
                <Typography variant="h6">
                  {isNewPostModalOpen ? i18n._("Add New Post") : i18n._("Add Comment")}
                </Typography>
              )}

              {isNewPostModalOpen && !titleContent && (
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._("Share your thoughts and get feedback!")}
                </Typography>
              )}

              {titleContent}
            </Stack>

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
                  previousBotMessage={contextForAiAnalysis || ""}
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
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button
              startIcon={<ChevronLeft />}
              onClick={() => setActiveMessageId(activeMessage.parentMessageId || "")}
            >
              {i18n._("Back")}
            </Button>

            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                paddingRight: "8px",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              <Typography variant="caption">{activeMessage.viewsUserIds?.length || 0}</Typography>
              <Eye
                size={"18px"}
                style={{
                  opacity: 0.7,
                  color: "inherit",
                }}
              />
            </Stack>
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
              borderBottom:
                chat.messages.length > 0 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
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
                flexWrap: "wrap",
                gap: "10px",
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
                  {placeholder || i18n._("What's new?")}
                </Typography>
              </Stack>

              <Button
                variant="contained"
                color="info"
                sx={{
                  width: "auto",
                }}
                startIcon={<AddIcon />}
                onClick={() => setIsNewPostModalOpen(true)}
              >
                {addNewPostButtonText || i18n._("Add Post")}
              </Button>
            </Stack>
          </Stack>

          <MessageChain topLevel parentId={""} />
        </Stack>
      )}

      {chat.messages.length === 0 && (
        <Stack
          sx={{
            padding: "30px 20px 20px 20px",
            marginTop: "-10px",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {i18n._("No messages yet. Be the first to share your thoughts!")}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
