'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Check } from 'lucide-react';
import { SupportedLanguage, fullLanguageName } from '@/features/Lang/lang';
import { CallDatePicker, CallTimePicker } from './CallDateTimePickers';
import { FluencyCallLanguageSelect } from './FluencyCallLanguageSelect';

export type FluencyCallRequestFormProps = {
  date: string;
  time: string;
  languageCode: SupportedLanguage;
  previewLabel: string;
  error: string;
  isSending: boolean;
  isSent: boolean;
  sentLabel: string;
  now: Date;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  onSubmit: () => void;
  onDone: () => void;
};

export const FluencyCallRequestForm = ({
  date,
  time,
  languageCode,
  previewLabel,
  error,
  isSending,
  isSent,
  sentLabel,
  now,
  onDateChange,
  onTimeChange,
  onLanguageChange,
  onSubmit,
  onDone,
}: FluencyCallRequestFormProps) => {
  const { i18n } = useLingui();

  if (isSent) {
    return (
      <Stack
        data-testid="fluency-call-request-success"
        sx={{
          gap: '16px',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <Stack
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(125, 222, 170, 0.16)',
          }}
        >
          <Check color="#7DDEAA" size={22} strokeWidth={3} />
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {i18n._('Request sent')}
        </Typography>
        <Typography sx={{ opacity: 0.85 }}>
          {i18n._("We'll get back to you with a confirmation.")}
        </Typography>
        {sentLabel ? (
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {sentLabel}
          </Typography>
        ) : null}
        <Typography sx={{ fontWeight: 700 }}>{fullLanguageName[languageCode]}</Typography>
        <Button
          variant="contained"
          onClick={onDone}
          sx={{
            minHeight: '44px',
            padding: '10px 22px',
          }}
        >
          {i18n._('Done')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      data-testid="fluency-call-request-form"
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      sx={{
        gap: '16px',
        width: '100%',
      }}
    >
      <Stack sx={{ gap: '4px', paddingRight: '28px' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {i18n._('Propose a conversation')}
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          {i18n._("Set a time and send a request. We'll get back to you with a confirmation.")}
        </Typography>
      </Stack>

      <Stack sx={{ gap: '6px', alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {i18n._('Language')}
        </Typography>
        <FluencyCallLanguageSelect
          value={languageCode}
          onChange={onLanguageChange}
          testId="fluency-call-request-language"
        />
      </Stack>

      <CallDatePicker value={date} now={now} onChange={onDateChange} />
      <CallTimePicker date={date} time={time} now={now} onChange={onTimeChange} />

      {previewLabel ? (
        <Typography data-testid="fluency-call-request-preview" sx={{ fontWeight: 700 }}>
          {previewLabel}
        </Typography>
      ) : null}

      {error ? (
        <Typography color="error" data-testid="fluency-call-request-error">
          {error}
        </Typography>
      ) : null}

      <Button
        type="submit"
        variant="contained"
        color="success"
        data-testid="fluency-call-request-submit"
        disabled={isSending}
        sx={{
          minHeight: '44px',
          alignSelf: 'flex-start',
          padding: '10px 22px',
        }}
      >
        {isSending ? i18n._('Sending...') : i18n._('Send request')}
      </Button>
    </Stack>
  );
};
