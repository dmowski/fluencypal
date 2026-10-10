'use client';

import { FormEvent, useId, useState } from 'react';
import { Box, Button, IconButton, InputBase, Stack, Typography } from '@mui/material';
import { ArrowUp } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { FluencyCallMessageRow } from './FluencyCallMessageRow';
import { narrow, textButtonSx, token } from './styles';
import { FLUENCY_CALL_CHAT_PAGE, FluencyCallCardMessage } from './types';

export const FluencyCallChatPanel = ({
  messages,
  initialExpanded,
  alert,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onTranslate,
  onError,
}: {
  messages: FluencyCallCardMessage[];
  initialExpanded: boolean;
  alert: string;
  onSendMessage: (text: string) => Promise<void>;
  onEditMessage?: (messageId: string, text: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onTranslate?: (text: string) => Promise<string>;
  onError: (message: string) => void;
}) => {
  const { i18n } = useLingui();
  const messagesId = useId();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [shown, setShown] = useState(FLUENCY_CALL_CHAT_PAGE);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const visibleMessages = expanded ? messages.slice(-shown) : messages.slice(-1);
  const hasOlderInMemory = messages.length > shown;

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    onError('');
    try {
      await onSendMessage(text);
      setDraft('');
    } catch {
      onError(i18n._('Your message was not sent. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
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
            aria-controls={messagesId}
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

      <Stack id={messagesId} data-testid="fluency-call-messages">
        {visibleMessages.map((message) => (
          <FluencyCallMessageRow
            key={message.id}
            message={message}
            onEdit={
              message.isMine && onEditMessage
                ? async (text) => {
                    onError('');
                    try {
                      await onEditMessage(message.id, text);
                    } catch {
                      onError(i18n._('Could not update your message. Please try again.'));
                      throw new Error('edit failed');
                    }
                  }
                : undefined
            }
            onDelete={
              message.isMine && onDeleteMessage
                ? async () => {
                    onError('');
                    try {
                      await onDeleteMessage(message.id);
                    } catch {
                      onError(i18n._('Could not update your message. Please try again.'));
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
  );
};
