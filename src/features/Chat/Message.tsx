"use client";
import { Stack, Typography, TextField, Button, IconButton, CircularProgress } from "@mui/material";
import { UserChatMessage } from "./type";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import { useLingui } from "@lingui/react";
import { useChat } from "./useChat";
import { useAuth } from "../Auth/useAuth";
import { useGame } from "../Game/useGame";
import { MessageActionButton } from "./MessageActionButton";
import { useTranslate } from "../Translation/useTranslate";
import { Avatar } from "../Game/Avatar";

interface MessageProps {
  message: UserChatMessage;
  isOwnMessage: boolean;
  userName: string;
  userAvatarUrl: string;
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onCommentClick: () => void;
  commentsCount: number;
}

export function Message({
  message,
  isOwnMessage,
  userName,
  userAvatarUrl,
  onEdit,
  onDelete,
  onCommentClick,
  commentsCount,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const { i18n } = useLingui();
  const translator = useTranslate();
  const [isShowFullContent, setIsShowFullContent] = useState(false);
  const limitMessages = 190;
  const isLimitedMessage = message.content.length > limitMessages && !isShowFullContent;

  const auth = useAuth();
  const myUserId = auth.uid;
  const chat = useChat();
  const isLikedByMe = chat.messagesLikes[message.id]?.some((like) => like.userId === myUserId);

  const updatedAgo = dayjs(message.updatedAtIso).fromNow();

  const handleSaveEdit = async () => {
    if (editedContent.trim()) {
      setIsDeleting(true);
      await onEdit(message.id, editedContent);
      setIsEditing(false);
      setIsDeleting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(message.id);
    setIsDeleting(false);
  };

  const game = useGame();

  return (
    <Stack
      sx={{
        padding: "15px",
        backgroundColor: "rgba(255, 255, 255, 0.01)",
        position: "relative",
      }}
    >
      <Stack
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          sx={{
            gap: "10px",
            width: "100%",
          }}
        >
          <Stack
            sx={{
              justifyContent: "space-between",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: "16px",
                border: "none",
                backgroundColor: "transparent",
                color: "inherit",
                cursor: "pointer",
                userSelect: "text",
                padding: "2px 10px 2px 2px",
                borderRadius: "19px",
                position: "relative",
                left: "-2px",
                ":focus": {
                  outline: "none",
                  boxShadow: "0 0 0 2px rgba(41, 179, 229, 0.5)",
                },
              }}
              component={"button"}
              onClick={() => game.showUserInModal(message.senderId)}
            >
              {userAvatarUrl && <Avatar avatarSize="25px" url={userAvatarUrl} />}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  paddingLeft: "1px",
                }}
              >
                {userName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.6,
                }}
              >
                {updatedAgo}

                {message.updatedAtIso !== message.createdAtIso && " | " + i18n._("edited")}
              </Typography>
            </Stack>

            {isOwnMessage && (
              <Stack sx={{ flexDirection: "row", opacity: 0.7 }}>
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(true)}
                  disabled={isDeleting}
                  title={i18n._("Edit message")}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  title={i18n._("Delete message")}
                >
                  {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
                </IconButton>
              </Stack>
            )}
          </Stack>

          {isEditing ? (
            <Stack
              sx={{
                width: "100%",
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={12}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                sx={{ mt: 1 }}
                disabled={isDeleting}
              />
            </Stack>
          ) : (
            <Typography
              sx={{
                marginTop: "5px",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                width: "100%",
              }}
            >
              {message.content.length > limitMessages ? (
                <>
                  {isLimitedMessage
                    ? message.content.slice(0, limitMessages) + "..."
                    : message.content}
                  <Button
                    size="small"
                    onClick={() => setIsShowFullContent(!isShowFullContent)}
                    sx={{ textTransform: "none", marginLeft: "5px", padding: 0, minWidth: 0 }}
                  >
                    {isShowFullContent ? i18n._("Show less") : i18n._("Show more")}
                  </Button>
                </>
              ) : (
                message.content
              )}
            </Typography>
          )}

          {isEditing ? (
            <Stack sx={{ gap: "10px", flexDirection: "row" }}>
              <Button
                size="small"
                onClick={handleSaveEdit}
                disabled={isDeleting || !editedContent.trim()}
                variant="contained"
              >
                {isDeleting ? <CircularProgress size={20} /> : i18n._("Save")}
              </Button>
              <Button size="small" onClick={() => setIsEditing(false)} disabled={isDeleting}>
                {i18n._("Cancel")}
              </Button>
            </Stack>
          ) : (
            <>
              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <MessageActionButton
                  isActive={isLikedByMe}
                  onClick={() => chat.toggleLike(message.id, "like")}
                  label={i18n._("Like")}
                  count={chat.messagesLikes[message.id]?.length || 0}
                  iconName={"heart"}
                />

                <MessageActionButton
                  isActive={false}
                  onClick={onCommentClick}
                  label={i18n._("Comment")}
                  count={commentsCount}
                  iconName={"message-circle"}
                />

                {translator.isTranslateAvailable && (
                  <MessageActionButton
                    isActive={false}
                    onClick={(element) => translator.translateWithModal(message.content, element)}
                    label={i18n._("Translate")}
                    iconName={"languages"}
                  />
                )}
                {translator.translateModal}
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
