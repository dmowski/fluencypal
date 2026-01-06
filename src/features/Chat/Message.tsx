"use client";
import {
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { UserChatMessage } from "./type";
import { useEffect, useState } from "react";
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
import { CircleEllipsis } from "lucide-react";

interface MessageProps {
  message: UserChatMessage;

  isContentWide?: boolean;
  isChain?: boolean;
  isFullContentByDefault?: boolean;
}

export function Message({
  message,
  isContentWide = false,
  isChain = false,
  isFullContentByDefault = false,
}: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const { i18n } = useLingui();
  const translator = useTranslate();
  const [isShowFullContent, setIsShowFullContent] = useState(isFullContentByDefault);

  useEffect(() => {
    setIsShowFullContent(isFullContentByDefault);
  }, [isFullContentByDefault]);

  const limitMessages = 190;
  const isLimitedMessage = message.content.length > limitMessages && !isShowFullContent;

  const auth = useAuth();
  const game = useGame();
  const userName = game.getUserName(message.senderId);
  const userAvatarUrl = game.getUserAvatarUrl(message.senderId);
  const myUserId = auth.uid;
  const isOwnMessage = message.senderId === myUserId;
  const chat = useChat();

  const commentsCount = chat.commentsInfo[message.id] || 0;

  const isLikedByMe = chat.messagesLikes[message.id]?.some((like) => like.userId === myUserId);

  const updatedAgo = dayjs(message.updatedAtIso).fromNow();

  const handleSaveEdit = async () => {
    if (editedContent.trim()) {
      setIsDeleting(true);
      await chat.editMessage(message.id, editedContent);
      setIsEditing(false);
      setIsDeleting(false);
    }
  };

  const onDelete = async (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    setMenuAnchorEl(null);
    e.preventDefault();
    e.stopPropagation();
    const isConfirmed = window.confirm(i18n._("Are you sure you want to delete this message?"));
    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);
    await chat.deleteMessage(message.id);
    setIsDeleting(false);
  };

  const onEdit = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    setMenuAnchorEl(null);
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const avatarSize = "35px";
  const contentLeftPadding = `calc(${avatarSize} + 18px)`;
  const chainLeftPadding = `calc(calc(${avatarSize} / 2) + 14px)`;
  const chainTop = `calc(${avatarSize} + 25px)`;
  const chainHeight = `calc(100% - ${avatarSize} - 20px)`;

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Stack
      sx={{
        padding: "15px",
        backgroundColor: "rgba(255, 255, 255, 0.01)",
        position: "relative",
        width: "100%",
        zIndex: 1,
        gap: "0px",
        cursor: isEditing ? "default" : "pointer",
        ".open-message-button:focus": {
          boxShadow: "inset 0 0 0 2px rgba(41, 179, 229, 0.5)",
          borderRadius: "12px",
        },
      }}
      onClick={(e) => {
        if (isEditing) return;
        const isAnySelectedText = window.getSelection()?.toString().length ?? 0 > 0;
        if (isAnySelectedText) return;

        const target = e.target as HTMLElement;
        if (
          target.closest("button") ||
          target.closest("a") ||
          target.closest("input") ||
          target.closest("textarea")
        ) {
          return;
        }

        chat.onOpen(message.id);
      }}
    >
      {isChain && (
        <Stack
          sx={{
            position: "absolute",
            top: chainTop,
            left: chainLeftPadding,

            height: chainHeight,
            width: "2px",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "2px",
          }}
        />
      )}
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
            padding: "2px 10px 0px 2px",
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
          {userAvatarUrl && <Avatar avatarSize={avatarSize} url={userAvatarUrl} />}
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
              i: {
                fontStyle: "normal",
                opacity: 0.6,
                paddingLeft: "10px",
              },
              span: {},
            }}
          >
            <span>{updatedAgo}</span>

            {message.updatedAtIso !== message.createdAtIso && <i>{i18n._("edited")}</i>}
          </Typography>
        </Stack>

        {isOwnMessage && (
          <Stack sx={{ flexDirection: "row", opacity: 0.7, alignItems: "center", gap: "1px" }}>
            <IconButton onClick={(e) => setMenuAnchorEl(e.currentTarget)} size="small">
              <CircleEllipsis
                size={"20px"}
                style={{
                  opacity: 0.7,
                }}
              />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={() => setMenuAnchorEl(null)}
            >
              <MenuItem onClick={onEdit}>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText>
                  <Typography>{i18n._("Edit")}</Typography>
                </ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={onDelete}>
                <ListItemIcon>
                  <DeleteIcon color="error" />
                </ListItemIcon>
                <ListItemText>
                  <Typography color="error">{i18n._("Delete")}</Typography>
                </ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        )}
      </Stack>

      {isEditing ? (
        <Stack
          sx={{
            width: "100%",
            position: "relative",
            zIndex: 1,
            gap: "10px",
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={12}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            sx={{ marginTop: "10px", backgroundColor: "rgba(10, 18, 30, 1)" }}
            disabled={isDeleting}
          />

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
        </Stack>
      ) : (
        <Typography
          sx={{
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            width: "100%",

            paddingLeft: isContentWide ? "0px" : contentLeftPadding,
          }}
        >
          {message.content.length > limitMessages ? (
            <>
              {isLimitedMessage ? message.content.slice(0, limitMessages) + "..." : message.content}
              {!isFullContentByDefault && (
                <Button
                  size="small"
                  onClick={() => setIsShowFullContent(!isShowFullContent)}
                  sx={{ textTransform: "none", marginLeft: "5px", padding: 0, minWidth: 0 }}
                >
                  {isShowFullContent ? i18n._("Show less") : i18n._("Show more")}
                </Button>
              )}
            </>
          ) : (
            message.content
          )}
        </Typography>
      )}

      {!isEditing && (
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            paddingTop: "10px",
            paddingLeft: isContentWide ? "0px" : contentLeftPadding,
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
            onClick={() => chat.onCommentClick(message.id)}
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
      )}
      <Stack
        component={"button"}
        onClick={() => chat.onOpen(message.id)}
        className="open-message-button"
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          border: "none",
          backgroundColor: "rgba(0,0,0,0)",
          zIndex: -1,
          outline: "none",
        }}
      />
    </Stack>
  );
}
