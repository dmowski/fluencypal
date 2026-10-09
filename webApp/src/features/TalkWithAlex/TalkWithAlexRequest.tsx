'use client';

import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { sendFeedbackMessageRequest } from '@/app/api/telegram/sendFeedbackMessageRequest';
import { useAuth } from '@/features/Auth/useAuth';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { SupportedLanguage } from '@/features/Lang/lang';
import { plainTelegramText, talkWithAlexTelegramMessage } from './talkWithAlexMessage';

export const TalkWithAlexRequest = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const [contact, setContact] = useState(auth.userInfo?.email || '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const submit = async () => {
    const contactText = plainTelegramText(contact, 200);
    if (!contactText) {
      setError(i18n._('Add an email, Telegram, or phone number.'));
      return;
    }
    setError('');
    setIsSending(true);
    try {
      const result = await sendFeedbackMessageRequest(
        { message: talkWithAlexTelegramMessage(contact, note) },
        await auth.getToken(),
      );
      if (result.error) {
        throw new Error(result.error);
      }
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
      <Stack data-testid="talk-with-alex-sent" sx={{ gap: '16px', padding: '28px 10px 40px' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {i18n._('Alex will write you')}
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          {i18n._('You will pick a time and talk, so you can get to know each other.')}
        </Typography>
        <Button
          href={`${getUrlStart(lang)}practice`}
          variant="contained"
          size="large"
          data-testid="talk-with-alex-continue"
          data-analytics="talk-with-alex-continue"
          sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
        >
          {i18n._('Continue to FluencyPal')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      component="form"
      data-testid="talk-with-alex-form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      sx={{ gap: '16px', padding: '28px 10px 40px' }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {i18n._('How should Alex reach you?')}
      </Typography>
      <Typography sx={{ opacity: 0.8 }}>
        {i18n._('Email, Telegram, or a phone number. He will write you, and you will pick a time.')}
      </Typography>
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
        placeholder={i18n._('Email, Telegram, or phone')}
        disabled={isSending}
        slotProps={{ htmlInput: { 'data-testid': 'talk-with-alex-contact', maxLength: 200 } }}
      />
      <TextField
        value={note}
        onChange={(event) => setNote(event.target.value)}
        fullWidth
        multiline
        minRows={3}
        name="note"
        label={i18n._('A little about you')}
        placeholder={i18n._('Optional. What you want from the call.')}
        disabled={isSending}
        slotProps={{ htmlInput: { 'data-testid': 'talk-with-alex-note', maxLength: 500 } }}
      />
      {error ? <Typography color="error">{error}</Typography> : null}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSending}
        data-testid="talk-with-alex-submit"
        data-analytics="talk-with-alex-submit"
        sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
      >
        {isSending ? i18n._('Sending...') : i18n._('Ask Alex to write you')}
      </Button>
    </Stack>
  );
};
