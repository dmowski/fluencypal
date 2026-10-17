'use client';

import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { SupportedLanguage } from '@/features/Lang/lang';
import { sendCommunityCallRequest } from './sendCommunityCallRequest';

export const CommunityCallOnboarding = ({
  lang,
  signedIn = false,
  onOpenVoiceChat,
}: {
  lang: SupportedLanguage;
  signedIn?: boolean;
  onOpenVoiceChat?: () => void;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
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
      const token = await auth.getToken();
      await sendCommunityCallRequest(interests, contact, token || undefined);
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
        component="main"
        data-testid="community-call-onboarding"
        data-analytics-screen="communityCall.sent"
        sx={{ width: '100%', alignItems: 'center', padding: '10px 0 40px' }}
      >
        <Stack
          data-testid="community-call-sent"
          sx={{ width: '100%', maxWidth: '600px', gap: '16px', padding: '28px 10px 40px' }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {i18n._('I will contact you soon')}
          </Typography>
          <Typography sx={{ opacity: 0.8 }}>
            {i18n._(
              'I will write once I find people who fit, so we can choose a time that works for everyone.',
            )}
          </Typography>
          <Typography sx={{ opacity: 0.8 }}>
            {i18n._('Practice with AI while you wait.')}
          </Typography>
          {onOpenVoiceChat ? (
            <Button
              variant="contained"
              size="large"
              data-testid="community-call-open-voice-chat"
              onClick={onOpenVoiceChat}
              sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
            >
              {i18n._('Open voice chat')}
            </Button>
          ) : null}
          <Button
            href={`${getUrlStart(lang)}practice`}
            variant="contained"
            size="large"
            data-testid="community-call-practice"
            data-analytics="community-call-practice"
            sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
          >
            {i18n._('Practice with AI')}
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      component="main"
      data-testid="community-call-onboarding"
      data-analytics-screen="communityCall.request"
      sx={{ width: '100%', alignItems: 'center', padding: '10px 0 40px' }}
    >
      <Stack
        component="form"
        data-testid="community-call-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        sx={{ width: '100%', maxWidth: '600px', gap: '16px', padding: '28px 10px 40px' }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {i18n._('Request a group call')}
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          {signedIn
            ? i18n._('Tell me what you want to practice, and how I can reach you.')
            : i18n._(
                'No account needed. Tell me what you want to practice, and how I can reach you.',
              )}
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
          minRows={4}
          name="interests"
          label={i18n._('Interests')}
          placeholder={i18n._('Your goal, what you want to talk about, and your English level')}
          disabled={isSending}
          slotProps={{
            htmlInput: { 'data-testid': 'community-call-interests', maxLength: 1000 },
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
          slotProps={{ htmlInput: { 'data-testid': 'community-call-contact', maxLength: 200 } }}
        />
        <Stack data-testid="community-call-whats-next" sx={{ gap: '8px', paddingTop: '8px' }}>
          <Typography sx={{ fontWeight: 800 }}>{i18n._("What's next")}</Typography>
          <Typography sx={{ opacity: 0.8 }}>
            {i18n._(
              'I will write to you once I find people who fit. We can discuss a time and arrange a call that is comfortable for everyone.',
            )}
          </Typography>
          <Typography sx={{ opacity: 0.8 }}>{i18n._('Group calls are free.')}</Typography>
        </Stack>
        {error ? (
          <Typography color="error" data-testid="community-call-error">
            {error}
          </Typography>
        ) : null}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSending}
          data-testid="community-call-submit"
          data-analytics="community-call-request-submit"
          sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
        >
          {isSending ? i18n._('Sending...') : i18n._('Send request')}
        </Button>
      </Stack>
    </Stack>
  );
};
