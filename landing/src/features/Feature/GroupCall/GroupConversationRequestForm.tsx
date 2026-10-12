'use client';

import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { getAppUrlStart } from '@/features/Lang/getUrlStart';
import { SupportedLanguage } from '@/features/Lang/lang';
import { buttonStyle } from '@/features/Landing/landingSettings';
import { sendGroupConversationRequest } from './sendGroupConversationRequest';

const fieldSx = {
  '& .MuiInputBase-root': {
    color: '#f4f7fb',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
  },
  '& .MuiInputLabel-root': { color: 'rgba(244, 247, 251, 0.72)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#7DDEAA' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(125, 222, 170, 0.45)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(125, 222, 170, 0.8)' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#7DDEAA',
  },
};

export const GroupConversationRequestForm = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const [interests, setInterests] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const submit = async () => {
    if (!interests.trim()) {
      setError(i18n._('Add what you want to talk about.'));
      return;
    }
    if (!contact.trim()) {
      setError(i18n._('Add an email, Telegram, Instagram, or WhatsApp.'));
      return;
    }
    setError('');
    setIsSending(true);
    try {
      await sendGroupConversationRequest(interests, contact);
      setIsSent(true);
    } catch (sendError) {
      console.error(sendError);
      setError(i18n._('Could not send that. Please try again.'));
    } finally {
      setIsSending(false);
    }
  };

  if (isSent) {
    return (
      <Stack
        id="group-call-request"
        data-testid="group-conversations-request-sent"
        sx={{ width: '100%', maxWidth: '520px', gap: '12px' }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#fff' }}>
          {i18n._('I will contact you soon')}
        </Typography>
        <Typography sx={{ color: 'rgba(244, 247, 251, 0.78)' }}>
          {i18n._(
            'I will write once I find people who fit, so we can choose a time that works for everyone.',
          )}
        </Typography>
        <Button
          href={`${getAppUrlStart(lang)}practice`}
          variant="contained"
          size="large"
          data-testid="group-conversations-request-practice"
          data-analytics="community-call-practice"
          sx={{
            ...buttonStyle,
            alignSelf: 'flex-start',
            color: '#041018',
            backgroundColor: '#7DDEAA',
          }}
        >
          {i18n._('Practice with AI')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      id="group-call-request"
      component="form"
      data-testid="group-conversations-request-form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      sx={{ width: '100%', maxWidth: '520px', gap: '14px' }}
    >
      <Typography sx={{ color: 'rgba(244, 247, 251, 0.78)' }}>
        {i18n._('No account needed. Group calls are free.')}
      </Typography>
      <TextField
        value={interests}
        onChange={(event) => {
          setInterests(event.target.value);
          setError('');
        }}
        required
        fullWidth
        multiline
        minRows={3}
        name="interests"
        label={i18n._('Interests')}
        placeholder={i18n._('Your goal, what you want to talk about, and your English level')}
        disabled={isSending}
        sx={fieldSx}
        slotProps={{
          htmlInput: { 'data-testid': 'group-conversations-interests', maxLength: 1000 },
        }}
      />
      <TextField
        value={contact}
        onChange={(event) => {
          setContact(event.target.value);
          setError('');
        }}
        required
        fullWidth
        name="contact"
        autoComplete="email"
        label={i18n._('Contact')}
        placeholder={i18n._('Email, Telegram, Instagram, or WhatsApp')}
        disabled={isSending}
        sx={fieldSx}
        slotProps={{
          htmlInput: { 'data-testid': 'group-conversations-contact', maxLength: 200 },
        }}
      />
      {error ? (
        <Typography color="error" data-testid="group-conversations-request-error">
          {error}
        </Typography>
      ) : null}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSending}
        data-testid="group-conversations-request-submit"
        data-analytics="community-call-request-submit"
        sx={{
          ...buttonStyle,
          alignSelf: 'flex-start',
          marginTop: '4px',
          color: '#041018',
          backgroundColor: '#7DDEAA',
          fontWeight: 800,
        }}
      >
        {isSending ? i18n._('Sending...') : i18n._('Send request')}
      </Button>
    </Stack>
  );
};
