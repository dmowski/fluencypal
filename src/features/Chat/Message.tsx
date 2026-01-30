'use client';
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
} from '@mui/material';
import { ThreadsMessage } from './type';
import { useEffect, useMemo, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { useLingui } from '@lingui/react';
import { useChat } from './useChat';
import { useAuth } from '../Auth/useAuth';
import { useGame } from '../Game/useGame';
import { MessageActionButton } from './MessageActionButton';
import { useTranslate } from '../Translation/useTranslate';
import { Avatar } from '../Game/Avatar';
import { CircleEllipsis, Heart, Languages, MessageCircle } from 'lucide-react';
import { UserName } from '../User/UserName';
import { Markdown } from '../uiKit/Markdown/Markdown';

const limitMessages = 300;

interface MessageProps {
  message: ThreadsMessage;

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

  const isDeleted = message.isDeleted || false;

  useEffect(() => {
    setIsShowFullContent(isFullContentByDefault);
  }, [isFullContentByDefault]);

  const isLimitedMessage = message.content.length > limitMessages && !isShowFullContent;

  const auth = useAuth();
  const game = useGame();

  const userName = game.getUserName(message.senderId);
  const userAvatarUrl = game.getUserAvatarUrl(message.senderId);
  const myUserId = auth.uid;
  const isOwnMessage = message.senderId === myUserId;
  const chat = useChat();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (message.id) {
        chat.viewMessage(message);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [message.id, auth.uid]);

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
    const isConfirmed = window.confirm(i18n._('Are you sure you want to delete this message?'));
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

  const avatarSize = '35px';
  const contentLeftPadding = `calc(${avatarSize} + 22px)`;
  const chainLeftPadding = `calc(calc(${avatarSize} / 2) + 14px)`;
  const chainTop = `calc(${avatarSize} + 26px)`;
  const chainHeight = `calc(100% - ${avatarSize} - 20px)`;

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const [translation, setTranslation] = useState<string | null>(null);
  const [isShowTranslation, setIsShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const toggleTranslation = async () => {
    if (isShowTranslation) {
      setIsShowTranslation(false);
      return;
    }

    if (translation) {
      setIsShowTranslation(true);
      return;
    }

    setIsTranslating(true);
    const translatedText = await translator.translateText({
      text: message.content,
    });
    setIsShowFullContent(true);
    setTranslation(translatedText);
    setIsShowTranslation(true);
    setIsTranslating(false);
  };

  const contentToShow = isShowTranslation && translation ? translation : message.content;
  const lastVisit = game.gameLastVisit ? game.gameLastVisit[message.senderId] : null;
  const isOnline = lastVisit ? dayjs().diff(dayjs(lastVisit), 'minute') < 5 : false;

  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isEditing) return;

    const isAnySelectedText = window.getSelection()?.toString().length ?? 0 > 0;
    if (isAnySelectedText) return;

    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return;
    }

    chat.onOpen(message.id);
  };

  return (
    <Stack
      sx={{
        padding: isDeleted ? '20px 0' : '10px',

        backgroundColor: isDeleted ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.01)',

        position: 'relative',
        width: '100%',
        flexDirection: 'row',
        zIndex: 1,
        gap: '0px',
        // cursor: isEditing || isDeleted ? "default" : "pointer",
        '.open-message-button:focus': {
          boxShadow: 'inset 0 0 0 2px rgba(41, 179, 229, 0.5)',
          borderRadius: '12px',
        },
      }}
    >
      {isChain && (
        <Stack
          sx={{
            position: 'absolute',
            top: chainTop,
            left: chainLeftPadding,

            height: chainHeight,
            width: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
          }}
        />
      )}

      <Stack
        sx={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          opacity: isDeleted ? 0 : 1,
        }}
      >
        <Avatar avatarSize={avatarSize} url={userAvatarUrl} isOnline={isOnline} />
      </Stack>

      {isEditing ? (
        <Stack
          sx={{
            width: '100%',
            position: 'relative',
            zIndex: 1,
            gap: '10px',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={12}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            sx={{ marginTop: '10px', backgroundColor: 'rgba(10, 18, 30, 1)' }}
            disabled={isDeleting}
          />

          <Stack sx={{ gap: '10px', flexDirection: 'row' }}>
            <Button
              size="small"
              onClick={handleSaveEdit}
              disabled={isDeleting || !editedContent.trim()}
              variant="contained"
            >
              {isDeleting ? <CircularProgress size={20} /> : i18n._('Save')}
            </Button>
            <Button size="small" onClick={() => setIsEditing(false)} disabled={isDeleting}>
              {i18n._('Cancel')}
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack
          sx={{
            //border: isContentWide ? "1px solid red" : "1px solid green",
            width: '100%',
          }}
        >
          <Stack
            sx={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: contentLeftPadding,
            }}
          >
            {isDeleted ? (
              <Stack></Stack>
            ) : (
              <Stack
                sx={{
                  flexDirection: 'row',
                  gap: '16px',
                  alignItems: 'flex-end',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  border: 'none',
                  padding: isContentWide ? '10px 0' : '0 0 0 0',
                  paddingBottom: '4px',
                  ':focus': {
                    outline: 'none',
                    boxShadow: '0 0 0 2px rgba(41, 179, 229, 0.5)',
                  },
                }}
                component={'button'}
                onClick={() => game.showUserInModal(message.senderId)}
              >
                <UserName userId={message.senderId} userName={userName} bold />

                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.6,
                    lineHeight: '1',

                    i: {
                      fontStyle: 'normal',
                      opacity: 0.6,
                      paddingLeft: '10px',
                    },
                    span: {},
                  }}
                >
                  {updatedAgo}
                  {message.updatedAtIso !== message.createdAtIso && <i>{i18n._('edited')}</i>}
                </Typography>
              </Stack>
            )}

            {isOwnMessage && (
              <Stack
                sx={{
                  flexDirection: 'row',
                  opacity: 0.7,
                  alignItems: 'center',
                  gap: '1px',
                }}
              >
                <IconButton onClick={(e) => setMenuAnchorEl(e.currentTarget)} size="small">
                  <CircleEllipsis
                    size={'20px'}
                    style={{
                      opacity: 0.7,
                    }}
                  />
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
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
                      <Typography>{i18n._('Edit')}</Typography>
                    </ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={onDelete}>
                    <ListItemIcon>
                      <DeleteIcon color="error" />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography color="error">{i18n._('Delete')}</Typography>
                    </ListItemText>
                  </MenuItem>
                </Menu>
              </Stack>
            )}
          </Stack>

          <Typography
            component={'div'}
            sx={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              width: '100%',

              fontSize: '15px',
              lineHeight: '21px',
              color: isDeleted ? 'rgba(243, 245, 247, 0.3)' : 'rgba(243, 245, 247, 1)',
              fontWeight: 350,
              paddingLeft: isContentWide ? '0px' : contentLeftPadding,
              paddingTop: isContentWide ? '20px' : 0,
            }}
          >
            {contentToShow.length > limitMessages &&
            !isShowTranslation &&
            !isShowFullContent &&
            !isFullContentByDefault ? (
              <>
                <div onClick={() => setIsShowFullContent(!isShowFullContent)}>
                  <MessageContent>
                    {isLimitedMessage
                      ? contentToShow.slice(0, limitMessages) + '... '
                      : contentToShow}
                  </MessageContent>
                </div>
                <Button
                  size="small"
                  onClick={() => setIsShowFullContent(!isShowFullContent)}
                  sx={{ textTransform: 'none', padding: 0, minWidth: 0 }}
                >
                  {i18n._('Show more')}
                </Button>
              </>
            ) : (
              <div onClick={onClick}>
                <MessageContent>{contentToShow}</MessageContent>
              </div>
            )}
          </Typography>

          {!isDeleted && (
            <MessageFooter
              message={message}
              isContentWide={isContentWide}
              contentLeftPadding={contentLeftPadding}
              toggleTranslation={toggleTranslation}
              isTranslateAvailable={translator.isTranslateAvailable ?? false}
              isTranslating={isTranslating}
            />
          )}
        </Stack>
      )}

      {!isEditing && (
        <Stack
          component={'button'}
          onClick={() => chat.onOpen(message.id)}
          className="open-message-button"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            border: 'none',
            backgroundColor: 'rgba(0,0,0,0)',
            zIndex: -1,
            outline: 'none',
          }}
        />
      )}
    </Stack>
  );
}

const MessageFooter = ({
  message,
  isContentWide,
  contentLeftPadding,
  toggleTranslation,
  isTranslateAvailable,
  isTranslating,
  gap,
}: {
  message: ThreadsMessage;
  isContentWide: boolean;
  contentLeftPadding: string;
  toggleTranslation: () => void;
  isTranslateAvailable: boolean;
  isTranslating: boolean;
  gap?: string;
}) => {
  const { i18n } = useLingui();
  const chat = useChat();

  const myUserId = useAuth().uid;
  const commentsCount = chat.commentsInfo[message.id] || 0;
  const isLikedByMe = chat.messagesLikes[message.id]?.some((like) => like.userId === myUserId);

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: gap || '1px',
        paddingTop: '5px',
        paddingLeft: isContentWide ? '0px' : contentLeftPadding,
      }}
    >
      <MessageActionButton
        isActive={isLikedByMe}
        onClick={() => chat.toggleLike(message.id, 'like')}
        label={i18n._('Like')}
        count={chat.messagesLikes[message.id]?.length || 0}
        iconName={'heart'}
      />

      <MessageActionButton
        isActive={false}
        iconSize="17px"
        onClick={() => chat.setActiveCommentMessageId(message.id)}
        label={i18n._('Comment')}
        count={commentsCount}
        iconName={'message-circle'}
      />

      {isTranslateAvailable && (
        <MessageActionButton
          iconSize="17px"
          isActive={isTranslating}
          onClick={() => toggleTranslation()}
          label={i18n._('Translate')}
          iconName={'languages'}
        />
      )}
    </Stack>
  );
};

export const MessageContent = ({
  children,
  contentFontSize,
}: {
  children: string;
  contentFontSize?: string;
}) => {
  const game = useGame();

  const onClickOnUserName = (userName: string) => {
    if (!game.userNames) return;

    const userIds = Object.keys(game.userNames || {});
    const foundUserId = userIds.find((userId) => game.userNames?.[userId] === userName);
    if (foundUserId) {
      game.showUserInModal(foundUserId);
    }
  };

  const wrapUserNamesAsLinks = (text: string) => {
    let modifiedText = text;
    // find text that starts with @ and is followed by word characters
    const messageUserNames = modifiedText.match(/@(\w+)/g);

    if (messageUserNames) {
      messageUserNames.forEach((userNameWithAt) => {
        const hrefLink = `#user-${userNameWithAt.substring(1)}`;
        const markdownLink = `[${userNameWithAt}](${hrefLink})`;
        modifiedText = modifiedText.replace(
          new RegExp(`\\${userNameWithAt}\\b`, 'g'),
          markdownLink,
        );
      });
    }
    return '\n' + modifiedText.trim();
  };

  const contentToShow = useMemo(() => {
    return wrapUserNamesAsLinks(children);
  }, [children]);

  const onClick = (e: React.MouseEvent) => {
    const isLink = (e.target as HTMLElement).tagName === 'A';
    if (!isLink) return;

    const href = (e.target as HTMLAnchorElement).getAttribute('href') || '';
    const isUserLink = href?.startsWith('#user-');
    if (isUserLink) {
      const userName = href.replace('#user-', '');
      onClickOnUserName(userName);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const myUserName = game.myUserName;
  const myHrefLink = `#user-${myUserName}`;

  return (
    <Stack
      onClick={onClick}
      sx={{
        a: {
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 500,
        },

        // if my user name is mentioned, make it bold
        [`a[href="${myHrefLink}"]`]: {
          color: '#29B3E5',
        },
        '* p': {
          fontSize: contentFontSize || '15px',
        },
      }}
    >
      <Markdown variant="small">{contentToShow}</Markdown>
    </Stack>
  );
};

export const PreviewMessage = ({
  message,
  onOpen,
}: {
  message: ThreadsMessage;
  onOpen: (messageId: string) => void;
}) => {
  const game = useGame();
  const userAvatarUrl = game.getUserAvatarUrl(message.senderId);
  const userName = game.getUserName(message.senderId);
  const contentLimit = 120;
  const contentToShow =
    message.content.length > contentLimit
      ? message.content.slice(0, contentLimit) + '...'
      : message.content;

  const chat = useChat();
  const auth = useAuth();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (message.id) {
        chat.viewMessage(message);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [message.id, auth.uid]);

  return (
    <Stack
      key={message.id}
      onClick={() => onOpen(message.id)}
      sx={{
        borderRadius: '12px',
        padding: '15px 15px 10px 15px',
        backgroundColor: '#222327',
        width: '255px',
        gap: '0px',
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
          paddingBottom: '10px',
        }}
      >
        <Avatar avatarSize={'26px'} url={userAvatarUrl} />
        <UserName userId={message.senderId} userName={userName} bold />
      </Stack>
      <MessageContent contentFontSize="14px">{contentToShow}</MessageContent>
      <Stack
        sx={{
          pointerEvents: 'none',
        }}
      >
        <MessageFooter
          message={message}
          gap="0"
          isContentWide={false}
          contentLeftPadding={'0px'}
          toggleTranslation={() => {}}
          isTranslateAvailable={false}
          isTranslating={false}
        />
      </Stack>
    </Stack>
  );
};
