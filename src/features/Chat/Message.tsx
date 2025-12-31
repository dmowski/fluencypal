"use client";
import {
  Stack,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { UserChatMessage } from "./type";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import { useLingui } from "@lingui/react";

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

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack
          sx={{
            gap: "10px",
            width: "100%",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {userAvatarUrl && (
              <Stack
                component={"img"}
                src={userAvatarUrl}
                sx={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            )}
            <Typography variant="body2">{userName}</Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              {updatedAgo}
            </Typography>
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
                rows={2}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                sx={{ mt: 1 }}
                disabled={isDeleting}
              />
            </Stack>
          ) : (
            <Typography sx={{ mt: 0.5, wordBreak: "break-word" }}>{message.content}</Typography>
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
            </>
          )}
        </Stack>
        {isOwnMessage && (
          <Box sx={{ display: "flex", gap: 0.5, ml: 2, opacity: 0.7 }}>
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
          </Box>
        )}
      </Box>
    </Box>
  );
}
