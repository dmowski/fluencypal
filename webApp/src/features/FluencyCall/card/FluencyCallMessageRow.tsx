'use client';

import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { Ellipsis } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { narrow, textButtonSx, token } from './styles';
import { FluencyCallCardMessage } from './types';

const messageActionSx = {
  ...textButtonSx,
  padding: '4px 8px',
  minHeight: 32,
  fontSize: '12px',
  color: token.text,
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
};

export const FluencyCallMessageRow = ({
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
