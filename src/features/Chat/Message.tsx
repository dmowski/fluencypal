"use client";
import { Stack, Typography, TextField, Button, IconButton, CircularProgress } from "@mui/material";
import { UserChatMessage } from "./type";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import { useLingui } from "@lingui/react";
import { useChat } from "./useChat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useAuth } from "../Auth/useAuth";
import { useGame } from "../Game/useGame";
import { UserProfileModal } from "../Game/UserProfileModal";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

interface MessageProps {
  message: UserChatMessage;
  isOwnMessage: boolean;
  userName: string;
  userAvatarUrl: string;
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
}

export function Message({
  message,
  isOwnMessage,
  userName,
  userAvatarUrl,
  onEdit,
  onDelete,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const { i18n } = useLingui();

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

  const authorId = message.senderId;
  const game = useGame();
  const gameStat = game.stats.find((stat) => stat.userId === authorId);
  const [isShowModal, setIsShowModal] = useState(false);

  return (
    <Stack
      sx={{
        padding: "15px",
        backgroundColor: "rgba(255, 255, 255, 0.01)",
        position: "relative",
      }}
    >
      {isShowModal && gameStat && (
        <UserProfileModal stat={gameStat} onClose={() => setIsShowModal(false)} />
      )}
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
              onClick={() => setIsShowModal(true)}
            >
              {userAvatarUrl && (
                <Stack
                  component={"img"}
                  src={userAvatarUrl}
                  sx={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: "0px 0px 0px 1px rgba(255, 255, 255, 0.71)",
                  }}
                />
              )}
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
              {message.content}
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
              {message.updatedAtIso !== message.createdAtIso && (
                <Typography variant="caption" color="textSecondary" sx={{ fontStyle: "italic" }}>
                  ({i18n._("edited")})
                </Typography>
              )}

              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <MessageButton
                  isActive={isLikedByMe}
                  onClick={() => chat.toggleLike(message.id, "like")}
                  label={i18n._("Like")}
                  count={chat.messagesLikes[message.id]?.length || 0}
                  iconName={"heart"}
                />

                <MessageButton
                  isActive={false}
                  onClick={() => chat.toggleLike(message.id, "like")}
                  label={i18n._("Like")}
                  count={message.replies?.length || 0}
                  iconName={"message-circle"}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

export const MessageButton = ({
  isActive,
  onClick,
  label,
  count,
  iconName,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
  count: number;
  iconName: IconName;
}) => {
  const color = isActive ? "#ff0034" : "inherit";
  return (
    <Stack
      onClick={onClick}
      aria-label={label}
      sx={{
        flexDirection: "row",
        gap: "6px",
        alignItems: "center",
        border: "none",
        background: "rgba(255, 255, 255, 0)",
        color: "inherit",
        cursor: "pointer",
        padding: "6px 10px 6px 12px",
        position: "relative",
        left: "-12px",
        borderRadius: "28px",
        ":hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
      }}
      component={"button"}
    >
      <DynamicIcon
        name={iconName}
        size={"20px"}
        style={{
          opacity: isActive ? 1 : 0.7,
          color: color,
          fill: isActive ? color : "none",
        }}
      />
      <Typography
        variant="body2"
        sx={{
          opacity: isActive ? 1 : 0.7,
          color: color,
          fontWeight: 400,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count || 0}
      </Typography>
    </Stack>
  );
};
