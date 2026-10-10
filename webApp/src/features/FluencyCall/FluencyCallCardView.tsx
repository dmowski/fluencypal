'use client';

import { FormEvent, ReactNode, useId, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  Ellipsis,
  Play,
  Plus,
  Video,
} from 'lucide-react';
import { useLingui } from '@lingui/react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { ModalHeader } from '@/features/uiKit/Modal/ModalHeader';
import { MutedPreviewVideo } from '@/features/uiKit/Video/MutedPreviewVideo';
import { FluencyCallLanguageSelect } from './FluencyCallLanguageSelect';

const token = {
  bg: '#16181F',
  soft: '#20232D',
  text: '#EDF0F8',
  muted: '#A8AFC0',
  line: '#323644',
  accent: '#C4BAFF',
  accentText: '#242035',
  danger: '#ffb4b4',
  disabled: '#9098ab',
};

const narrow = '@media (max-width: 440px)';

export const FLUENCY_CALL_CHAT_PAGE = 20;

/** Alex's group-call intro. Same clip as the landing page. */
export const FLUENCY_CALL_WELCOME_VIDEO_SRC = '/group_call/intro.webm';

const textButtonSx = {
  backgroundColor: 'transparent',
  padding: '16px 15px',
  minHeight: 40,
  minWidth: 0,
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: 'normal',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '&:hover': { backgroundColor: 'rgba(41, 182, 246, 0.12)' },
  '&.Mui-disabled': { color: token.disabled },
};

const primaryButtonSx = {
  borderRadius: '10px',
  padding: '12px 18px',
  minHeight: 44,
  fontSize: '15px',
  fontWeight: 600,
  letterSpacing: 'normal',
  textTransform: 'none',
  '& svg': { color: 'inherit', stroke: 'currentColor' },
  [narrow]: { width: '100%' },
};

export type FluencyCallCardCall = {
  id: string;
  title: string;
  dateLabel: string;
  participantCount: number;
  isJoining: boolean;
  isLive: boolean;
};

export type FluencyCallCardMessage = {
  id: string;
  authorName: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
  timeLabel: string;
  extra?: ReactNode;
  /** The signed-in viewer wrote this message. */
  isMine?: boolean;
};

export type FluencyCallCardViewProps = {
  /** Featured call first, then the other listed calls, earliest first. */
  calls: FluencyCallCardCall[];
  languageCode: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  timeZoneLabel: string;
  /** Real Meet URL, or null when this language has no saved link. */
  meetUrl: string | null;
  messages: FluencyCallCardMessage[];
  onToggleJoining: (callId: string, joining: boolean) => Promise<void>;
  onSendMessage: (text: string) => Promise<void>;
  onEditMessage?: (messageId: string, text: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  /** Same translator as the main chat. Omitted when translation is not available. */
  onTranslate?: (text: string) => Promise<string>;
  canJoin: boolean;
  requestedAtLabel: string | null;
  paidNotice: boolean;
  onInitiateCall: () => void;
  /** Opens the shared chat expanded. Used by an old chat link. */
  initialChatExpanded?: boolean;
  notice?: string | null;
  /** Names for one listed call, shown under that time in Upcoming conversations. */
  callPeople?: (call: FluencyCallCardCall) => ReactNode;
  /** Real host intro. Omitted when the app has no video file. */
  welcomeVideoSrc?: string | null;
};

const messageActionSx = {
  ...textButtonSx,
  padding: '4px 8px',
  minHeight: 32,
  fontSize: '12px',
  color: token.text,
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
};

const FluencyCallMessageRow = ({
  message,
  onEdit,
  onDelete,
  onTranslate,
}: {
  message: FluencyCallCardMessage;
  onEdit?: (text: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onTranslate?: (text: string) => Promise<string>;
}) => {
  const { i18n } = useLingui();
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view');
  const [editDraft, setEditDraft] = useState(message.text);
  const [pending, setPending] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [translatedFrom, setTranslatedFrom] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);
  const closeMenu = () => setMenuAnchor(null);
  const canTranslate = Boolean(onTranslate && message.text);

  const toggleTranslation = async () => {
    closeMenu();
    if (!onTranslate || !message.text || translating) return;
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }
    if (translation && translatedFrom === message.text) {
      setShowTranslation(true);
      return;
    }
    setTranslating(true);
    try {
      const translatedText = await onTranslate(message.text);
      if (!translatedText.trim()) return;
      setTranslation(translatedText);
      setTranslatedFrom(message.text);
      setShowTranslation(true);
    } finally {
      setTranslating(false);
    }
  };

  const saveEdit = async () => {
    const text = editDraft.trim();
    if (!text || !onEdit || pending) return;
    setPending(true);
    try {
      await onEdit(text);
      setMode('view');
    } catch {
      // The card shows the failure. Keep the draft so the edit can be retried.
    } finally {
      setPending(false);
    }
  };

  const confirmDelete = async () => {
    if (!onDelete || pending) return;
    setPending(true);
    try {
      await onDelete();
      setMode('view');
    } catch {
      // The card shows the failure. Keep the confirmation so delete can be retried.
    } finally {
      setPending(false);
    }
  };

  return (
    <Stack
      component="article"
      data-testid={`fluency-call-message-${message.id}`}
      direction="row"
      sx={{ alignItems: 'flex-start', gap: '11px', margin: '15px 0', minWidth: 0 }}
    >
      <Avatar
        src={message.avatarUrl}
        alt=""
        sx={{
          width: 31,
          height: 31,
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: token.soft,
          color: token.accent,
          flexShrink: 0,
        }}
      >
        {message.authorName.slice(0, 1)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="span" sx={{ color: token.text, fontSize: '13px', fontWeight: 600 }}>
          {message.authorName}
        </Typography>
        <Typography
          component="time"
          dateTime={message.createdAt}
          sx={{ color: token.muted, fontSize: '11px', marginLeft: '9px' }}
        >
          {message.timeLabel}
        </Typography>
        {mode === 'edit' ? (
          <InputBase
            fullWidth
            multiline
            value={editDraft}
            disabled={pending}
            onChange={(event) => setEditDraft(event.target.value)}
            slotProps={{
              input: {
                'aria-label': i18n._('Edit message'),
                maxLength: 4000,
              },
            }}
            sx={{
              color: token.text,
              marginTop: '6px',
              padding: '8px',
              border: `1px solid ${token.line}`,
              borderRadius: '11px',
              backgroundColor: token.soft,
              '& .MuiInputBase-input': {
                color: token.text,
                fontSize: '14px',
                lineHeight: 1.6,
                [narrow]: { fontSize: '16px' },
              },
            }}
          />
        ) : message.text ? (
          <Typography
            sx={{
              margin: '4px 0',
              color: token.text,
              fontSize: '14px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
          >
            {showTranslation && translation ? translation : message.text}
          </Typography>
        ) : null}
        {translating ? (
          <Typography sx={{ color: token.muted, fontSize: '13px' }}>
            {i18n._('Loading...')}
          </Typography>
        ) : null}
        {message.extra}
        {mode === 'edit' ? (
          <Stack direction="row" sx={{ gap: '4px', marginTop: '4px' }}>
            <Button
              color="inherit"
              data-testid={`fluency-call-edit-save-${message.id}`}
              disabled={pending || !editDraft.trim()}
              onClick={() => {
                void saveEdit();
              }}
              sx={messageActionSx}
            >
              {i18n._('Save')}
            </Button>
            <Button
              color="inherit"
              data-testid={`fluency-call-edit-cancel-${message.id}`}
              disabled={pending}
              onClick={() => {
                setEditDraft(message.text);
                setMode('view');
              }}
              sx={messageActionSx}
            >
              {i18n._('Cancel')}
            </Button>
          </Stack>
        ) : null}
        {mode === 'confirm-delete' ? (
          <Stack sx={{ gap: '4px', marginTop: '4px' }}>
            <Typography sx={{ color: token.muted, fontSize: '13px' }}>
              {i18n._('Are you sure you want to delete this message?')}
            </Typography>
            <Stack direction="row" sx={{ gap: '4px' }}>
              <Button
                color="inherit"
                data-testid={`fluency-call-delete-confirm-${message.id}`}
                disabled={pending}
                onClick={() => {
                  void confirmDelete();
                }}
                sx={messageActionSx}
              >
                {i18n._('Delete')}
              </Button>
              <Button
                color="inherit"
                disabled={pending}
                onClick={() => setMode('view')}
                sx={messageActionSx}
              >
                {i18n._('Cancel')}
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Box>
      {mode === 'view' && (onEdit || onDelete || canTranslate) ? (
        <>
          <IconButton
            color="inherit"
            aria-label={i18n._('More options')}
            data-testid={`fluency-call-message-menu-${message.id}`}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            sx={{
              flexShrink: 0,
              color: token.muted,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
            }}
          >
            <Ellipsis size={18} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: token.bg,
                  backgroundImage: 'none',
                  color: token.text,
                  border: `1px solid ${token.line}`,
                },
              },
            }}
          >
            {canTranslate ? (
              <MenuItem
                data-testid={`fluency-call-translate-${message.id}`}
                disabled={translating}
                onClick={() => {
                  void toggleTranslation();
                }}
                sx={{ color: token.text }}
              >
                {showTranslation ? i18n._('See original') : i18n._('Translate')}
              </MenuItem>
            ) : null}
            {onEdit && message.text ? (
              <MenuItem
                data-testid={`fluency-call-edit-${message.id}`}
                onClick={() => {
                  closeMenu();
                  setEditDraft(message.text);
                  setMode('edit');
                }}
                sx={{ color: token.text }}
              >
                {i18n._('Edit')}
              </MenuItem>
            ) : null}
            {onDelete ? (
              <MenuItem
                data-testid={`fluency-call-delete-${message.id}`}
                onClick={() => {
                  closeMenu();
                  setMode('confirm-delete');
                }}
                sx={{ color: token.text }}
              >
                {i18n._('Delete')}
              </MenuItem>
            ) : null}
          </Menu>
        </>
      ) : null}
    </Stack>
  );
};

export const FluencyCallCardView = ({
  calls,
  languageCode,
  onLanguageChange,
  timeZoneLabel,
  meetUrl,
  messages,
  onToggleJoining,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onTranslate,
  canJoin,
  requestedAtLabel,
  paidNotice,
  onInitiateCall,
  initialChatExpanded = false,
  notice = null,
  callPeople,
  welcomeVideoSrc = null,
}: FluencyCallCardViewProps) => {
  const { i18n } = useLingui();
  const uid = useId();
  const [modal, setModal] = useState<'schedule' | 'welcome' | null>(null);
  const [expanded, setExpanded] = useState(initialChatExpanded);
  const [shown, setShown] = useState(FLUENCY_CALL_CHAT_PAGE);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingCall, setPendingCall] = useState<string | null>(null);
  const [error, setError] = useState('');
  const next = calls[0];
  const visibleMessages = expanded ? messages.slice(-shown) : messages.slice(-1);
  const hasOlderInMemory = messages.length > shown;
  const alert = error || notice || '';

  const toggle = async (call: FluencyCallCardCall) => {
    setPendingCall(call.id);
    setError('');
    try {
      await onToggleJoining(call.id, !call.isJoining);
    } catch {
      setError(i18n._('Could not update your plans. Please try again.'));
    } finally {
      setPendingCall(null);
    }
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    try {
      await onSendMessage(text);
      setDraft('');
    } catch {
      setError(i18n._('Your message was not sent. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const rsvp = (call: FluencyCallCardCall) => (
    <Button
      data-testid={`fluency-call-join-${call.id}`}
      data-analytics="community-call-rsvp"
      aria-pressed={call.isJoining}
      color="inherit"
      disabled={pendingCall !== null}
      onClick={() => {
        void toggle(call);
      }}
      startIcon={call.isJoining ? <Check size={16} /> : <Plus size={16} />}
      sx={textButtonSx}
    >
      {pendingCall === call.id
        ? i18n._('Updating...')
        : call.isJoining
          ? i18n._("I'm joining")
          : i18n._("I'll join")}
    </Button>
  );

  return (
    <Box
      component="section"
      id="fluency-call"
      data-testid="fluency-call-card"
      aria-labelledby={`${uid}-title`}
      sx={{
        containerType: 'inline-size',
        containerName: 'fluency-call-card',
        width: '100%',
        maxWidth: 660,
        margin: '0 auto',
        overflow: 'hidden',
        color: token.text,
        backgroundColor: token.bg,
        border: `1px solid ${token.line}`,
        borderRadius: '24px',
        font: 'inherit',
        '& :focus-visible': {
          outline: `2px solid ${token.accent}`,
          outlineOffset: '3px',
        },
      }}
    >
      <Stack sx={{ padding: '28px', gap: 0, [narrow]: { padding: '20px' } }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Typography
            component="h2"
            id={`${uid}-title`}
            sx={{
              margin: 0,
              color: token.text,
              fontSize: '23px',
              lineHeight: 1.3,
              fontWeight: 650,
              letterSpacing: '-0.5px',
              minWidth: 0,
              overflowWrap: 'anywhere',
              [narrow]: { fontSize: '21px' },
            }}
          >
            {i18n._('Group conversations')}
          </Typography>
          <FluencyCallLanguageSelect
            value={languageCode}
            onChange={onLanguageChange}
            testId="fluency-call-language-filter"
            collapseLabel
            appearance="quiet"
          />
        </Stack>

        <Typography sx={{ margin: '6px 0', color: token.muted }}>
          {i18n._('A short practice. A few friendly people.')}
        </Typography>

        {paidNotice ? (
          <Typography data-testid="fluency-call-paid" sx={{ color: '#7DDEAA', fontWeight: 700 }}>
            {canJoin
              ? i18n._('Payment received. You can join the group conversations.')
              : i18n._('Payment received. You can join in a moment.')}
          </Typography>
        ) : null}

        <ButtonBase
          data-testid="fluency-call-welcome"
          onClick={() => setModal('welcome')}
          sx={{
            margin: '23px 0 25px',
            padding: '13px 16px',
            backgroundColor: token.soft,
            borderRadius: '12px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            width: '100%',
            color: token.text,
            textAlign: 'left',
            '&:hover': { backgroundColor: '#292c38' },
          }}
        >
          {welcomeVideoSrc ? (
            <Box
              sx={{
                width: 68,
                height: 68,
                flexShrink: 0,
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#041018',
                border: '1px solid rgba(125, 222, 170, 0.28)',
              }}
            >
              <video
                src={welcomeVideoSrc}
                data-testid="fluency-call-welcome-preview"
                aria-hidden
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                tabIndex={-1}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none',
                  backgroundColor: '#041018',
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: token.bg,
                border: '1px solid rgba(255,255,255, 0.81)',
                color: 'rgba(255,255,255, 0.81)',
              }}
            >
              <Play size={17} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="strong" sx={{ color: token.text, fontWeight: 650 }}>
              {i18n._('First time? Meet your host')}
            </Typography>
            <Typography sx={{ color: token.muted, fontSize: '13px' }}>
              {i18n._('A short hello from Alex · What to expect')}
            </Typography>
          </Box>
          <ChevronRight size={18} color={token.muted} />
        </ButtonBase>

        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Typography
            sx={{
              fontSize: '12px',
              color: token.muted,
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {i18n._('Next conversation')}
          </Typography>
          <Button
            data-testid="fluency-call-other-times"
            color="inherit"
            endIcon={<ArrowRight size={16} />}
            onClick={() => setModal('schedule')}
            sx={{ ...textButtonSx, padding: '0 10px' }}
          >
            {i18n._('Other times')}
          </Button>
        </Stack>

        {next ? (
          <Stack sx={{ gap: '4px', minWidth: 0 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <Typography
                component="h3"
                sx={{
                  margin: '4px 0',
                  color: token.text,
                  fontSize: '22px',
                  fontWeight: 600,
                  overflowWrap: 'anywhere',
                }}
              >
                {next.title}
              </Typography>
              {next.isLive ? (
                <Box
                  data-testid={`fluency-call-live-${next.id}`}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#7DDEAA',
                    flexShrink: 0,
                  }}
                />
              ) : null}
            </Stack>
            <Typography
              data-testid={`fluency-call-join-count-${next.id}`}
              sx={{ margin: '0 0 20px', color: token.muted, fontSize: '13px' }}
            >
              {next.dateLabel} · {timeZoneLabel} ·{' '}
              {i18n._('{count} joining', { count: next.participantCount })}
            </Typography>
          </Stack>
        ) : (
          <Stack sx={{ gap: '6px', margin: '4px 0 20px' }}>
            <Typography
              component="h3"
              sx={{ margin: 0, color: token.text, fontSize: '22px', fontWeight: 600 }}
            >
              {i18n._('More conversations soon')}
            </Typography>
            <Typography sx={{ margin: 0, color: token.muted }}>
              {i18n._('Say hello in the chat while we plan the next call.')}
            </Typography>
          </Stack>
        )}

        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: '18px',
            flexWrap: 'wrap',
            [narrow]: { gap: '8px' },
          }}
        >
          {meetUrl ? (
            <Button
              component="a"
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="fluency-call-open"
              data-analytics="community-call-meet"
              variant="contained"
              color="info"
              startIcon={<Video size={18} />}
              endIcon={<ArrowUpRight size={16} />}
              sx={primaryButtonSx}
            >
              {i18n._('Open Google Meet')}
            </Button>
          ) : (
            <Button
              disabled
              data-testid="fluency-call-open"
              data-analytics="community-call-meet"
              variant="contained"
              color="info"
              startIcon={<Video size={18} />}
              endIcon={<ArrowUpRight size={16} />}
              sx={primaryButtonSx}
            >
              {i18n._('Open Google Meet')}
            </Button>
          )}
          {next ? rsvp(next) : null}
        </Stack>
        <Typography sx={{ margin: '10px 0 0', color: token.muted, fontSize: '12px' }}>
          {i18n._('Speak when you are ready. You can listen first.')}
        </Typography>
      </Stack>

      <Stack
        sx={{
          borderTop: `1px solid ${token.line}`,
          padding: '22px 28px',
          backgroundColor: token.bg,
          gap: '8px',
          [narrow]: { padding: '20px' },
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h4"
              sx={{ margin: 0, color: token.text, fontSize: '15px', fontWeight: 600 }}
            >
              {i18n._('Conversation chat')}
            </Typography>
            <Typography sx={{ color: token.muted, fontSize: '13px' }}>
              {i18n._('One shared chat for all calls')}
            </Typography>
          </Box>
          {messages.length > 1 ? (
            <Button
              data-testid="fluency-call-show-older"
              color="info"
              aria-expanded={expanded}
              aria-controls={`${uid}-messages`}
              onClick={() => setExpanded((open) => !open)}
              sx={textButtonSx}
            >
              {expanded ? i18n._('Hide older') : i18n._('Show older')}
            </Button>
          ) : null}
        </Stack>

        {expanded && hasOlderInMemory ? (
          <Button
            data-testid="fluency-call-load-older"
            color="info"
            onClick={() => setShown((count) => count + FLUENCY_CALL_CHAT_PAGE)}
            sx={textButtonSx}
          >
            {i18n._('Load more messages')}
          </Button>
        ) : null}

        <Stack id={`${uid}-messages`} data-testid="fluency-call-messages">
          {visibleMessages.map((message) => (
            <FluencyCallMessageRow
              key={message.id}
              message={message}
              onEdit={
                message.isMine && onEditMessage
                  ? async (text) => {
                      setError('');
                      try {
                        await onEditMessage(message.id, text);
                      } catch {
                        setError(i18n._('Could not update your message. Please try again.'));
                        throw new Error('edit failed');
                      }
                    }
                  : undefined
              }
              onDelete={
                message.isMine && onDeleteMessage
                  ? async () => {
                      setError('');
                      try {
                        await onDeleteMessage(message.id);
                      } catch {
                        setError(i18n._('Could not update your message. Please try again.'));
                        throw new Error('delete failed');
                      }
                    }
                  : undefined
              }
              onTranslate={onTranslate}
            />
          ))}
          {messages.length === 0 ? (
            <Typography
              data-testid="fluency-call-chat-empty"
              sx={{ color: token.muted, padding: '15px 0' }}
            >
              {i18n._('Be the first to say hello.')}
            </Typography>
          ) : null}
        </Stack>

        <Box
          component="form"
          onSubmit={(event) => {
            void send(event);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${token.line}`,
            borderRadius: '11px',
            padding: '5px',
            backgroundColor: token.soft,
            gap: '8px',
          }}
        >
          <InputBase
            fullWidth
            value={draft}
            disabled={sending}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={i18n._('Say hello or ask a question...')}
            slotProps={{
              input: {
                'aria-label': i18n._('Message the group'),
                maxLength: 4000,
              },
            }}
            sx={{
              color: token.text,
              font: 'inherit',
              padding: '0 8px',
              '& .MuiInputBase-input': {
                color: token.text,
                fontSize: '14px',
                [narrow]: { fontSize: '16px' },
              },
              '& .MuiInputBase-input::placeholder': { color: token.muted, opacity: 1 },
              '& .MuiInputBase-input.Mui-disabled': {
                color: token.disabled,
                WebkitTextFillColor: token.disabled,
              },
            }}
          />
          <IconButton
            type="submit"
            color="info"
            data-testid="fluency-call-send"
            disabled={sending || !draft.trim()}
            aria-label={sending ? i18n._('Sending message') : i18n._('Send message')}
            sx={{
              backgroundColor: token.bg,
              borderRadius: '7px',
              '&:hover': { backgroundColor: 'rgba(41, 182, 246, 0.12)' },
              '&.Mui-disabled': { color: token.disabled },
            }}
          >
            <ArrowUp size={18} />
          </IconButton>
        </Box>
        {alert ? (
          <Typography
            role="alert"
            data-testid="fluency-call-error"
            sx={{ color: token.danger, fontSize: '13px' }}
          >
            {alert}
          </Typography>
        ) : null}
      </Stack>

      <CustomModal
        isOpen={modal === 'welcome'}
        onClose={() => setModal(null)}
        zIndex={1400}
        backgroundColor={token.bg}
        data-testid="fluency-call-welcome-modal"
      >
        <Stack sx={{ width: '100%', maxWidth: '600px', gap: '20px' }}>
          {welcomeVideoSrc ? <MutedPreviewVideo src={welcomeVideoSrc} /> : null}
          <ModalHeader
            title={i18n._('A hello from Alex')}
            subtitle={i18n._(
              "We'll say hello and start with something simple, like how your week is going. Take your time — we're all here to practise.",
            )}
          />
        </Stack>
      </CustomModal>

      <CustomModal
        isOpen={modal === 'schedule'}
        onClose={() => setModal(null)}
        zIndex={1400}
        backgroundColor={token.bg}
        data-testid="fluency-call-schedule-modal"
      >
        <Stack sx={{ width: '100%', maxWidth: '600px', gap: '8px' }}>
          <ModalHeader
            title={i18n._('Upcoming conversations')}
            subtitle={i18n._('All times in {zone}', { zone: timeZoneLabel })}
          />
          <Stack>
            {calls.map((call) => (
              <Stack
                key={call.id}
                data-testid={`fluency-call-other-${call.id}`}
                sx={{
                  gap: '4px',
                  padding: '17px 0',
                  borderBottom: `1px solid ${token.line}`,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{ color: token.text, fontWeight: 650, overflowWrap: 'anywhere' }}
                    >
                      {call.title}
                    </Typography>
                    <Typography sx={{ color: token.muted, fontSize: '13px' }}>
                      {call.dateLabel} ·{' '}
                      {i18n._('{count} joining', { count: call.participantCount })}
                    </Typography>
                  </Box>
                  {rsvp(call)}
                </Stack>
                {callPeople?.(call)}
              </Stack>
            ))}
            {calls.length === 0 ? (
              <Typography
                data-testid="fluency-call-no-other"
                sx={{ color: token.muted, paddingTop: '12px' }}
              >
                {i18n._('No other calls scheduled yet.')}
              </Typography>
            ) : null}
            {canJoin && requestedAtLabel ? (
              <Stack
                data-testid="fluency-call-request-sent"
                sx={{ gap: '6px', paddingTop: '16px' }}
              >
                <Typography sx={{ fontWeight: 800, color: '#7DDEAA' }}>
                  {i18n._('Request sent')}
                </Typography>
                <Typography sx={{ fontWeight: 700, color: token.text }}>
                  {requestedAtLabel}
                </Typography>
                <Typography sx={{ color: token.muted }}>{i18n._("We'll reply soon.")}</Typography>
              </Stack>
            ) : null}
            {canJoin && !requestedAtLabel ? (
              <Button
                data-testid="fluency-call-initiate"
                data-analytics="community-call-propose"
                color="info"
                onClick={onInitiateCall}
                startIcon={<Plus size={16} />}
                sx={{ ...textButtonSx, alignSelf: 'flex-start', marginTop: '12px' }}
              >
                {i18n._('Propose a conversation')}
              </Button>
            ) : null}
            {canJoin && requestedAtLabel ? (
              <Button
                data-testid="fluency-call-change-time"
                data-analytics="community-call-change-time"
                color="info"
                onClick={onInitiateCall}
                sx={{ ...textButtonSx, alignSelf: 'flex-start', marginTop: '8px' }}
              >
                {i18n._('Change time')}
              </Button>
            ) : null}
          </Stack>
          {alert && modal === 'schedule' ? (
            <Typography role="alert" sx={{ color: token.danger, fontSize: '13px' }}>
              {alert}
            </Typography>
          ) : null}
        </Stack>
      </CustomModal>
    </Box>
  );
};
