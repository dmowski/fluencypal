'use client';

import { useState } from 'react';
import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { SupportedLanguage } from '@/features/Lang/lang';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { fluencyCallLanguageCode } from './callLanguage';
import {
  formatCallStartLabel,
  isUpcomingCallInstant,
  localDateTimeToUtcIso,
  suggestedCallSlot,
} from './callTime';
import { FluencyCallRequestForm } from './FluencyCallRequestForm';
import { sendFluencyCallRequest } from './sendFluencyCallRequest';

export const FluencyCallRequestModal = ({
  initialDate,
  initialTime,
  initialLanguage,
  onClose,
}: {
  initialDate?: string;
  initialTime?: string;
  initialLanguage: SupportedLanguage;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const suggested = suggestedCallSlot(new Date());
  const [date, setDate] = useState(initialDate || suggested.date);
  const [time, setTime] = useState(initialTime || suggested.time);
  const [language, setLanguage] = useState(fluencyCallLanguageCode(initialLanguage));
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentLabel, setSentLabel] = useState('');

  const startsAtIso = localDateTimeToUtcIso(date, time);
  const previewLabel = startsAtIso ? formatCallStartLabel(startsAtIso) : '';

  const onSubmit = async () => {
    if (!startsAtIso) {
      setError(i18n._('Choose a date and time.'));
      return;
    }
    if (!isUpcomingCallInstant(startsAtIso, new Date())) {
      setError(i18n._('That time has already passed.'));
      return;
    }

    setIsSending(true);
    setError('');
    try {
      await sendFluencyCallRequest(startsAtIso, language, await auth.getToken());
      setSentLabel(formatCallStartLabel(startsAtIso));
      setIsSent(true);
    } catch (requestError) {
      console.error(requestError);
      setError(i18n._('Could not send the request. Try again.'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <CustomModal
      isOpen
      onClose={isSending ? undefined : onClose}
      zIndex={1400}
      backgroundColor="#1c1e24"
      data-testid="fluency-call-request"
    >
      <Stack sx={{ width: '100%', maxWidth: '500px', gap: '16px' }}>
        <FluencyCallRequestForm
          date={date}
          time={time}
          languageCode={language}
          previewLabel={previewLabel}
          error={error}
          isSending={isSending}
          isSent={isSent}
          sentLabel={sentLabel}
          now={new Date()}
          onDateChange={(value) => {
            setDate(value);
            setError('');
          }}
          onTimeChange={(value) => {
            setTime(value);
            setError('');
          }}
          onLanguageChange={(value) => {
            setLanguage(value);
            setError('');
          }}
          onSubmit={() => {
            void onSubmit();
          }}
          onDone={onClose}
        />
      </Stack>
    </CustomModal>
  );
};
