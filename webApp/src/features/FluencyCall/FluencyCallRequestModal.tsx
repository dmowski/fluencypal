'use client';

import { useState } from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { useLingui } from '@lingui/react';
import { X } from 'lucide-react';
import { useAuth } from '@/features/Auth/useAuth';
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
  onClose,
}: {
  initialDate?: string;
  initialTime?: string;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const suggested = suggestedCallSlot(new Date());
  const [date, setDate] = useState(initialDate || suggested.date);
  const [time, setTime] = useState(initialTime || suggested.time);
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
      await sendFluencyCallRequest(startsAtIso, await auth.getToken());
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
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      data-testid="fluency-call-request"
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            maxWidth: '500px',
            margin: '16px',
            backgroundColor: '#1c1e24',
            backgroundImage: 'none',
          },
        },
      }}
    >
      <IconButton
        aria-label={i18n._('Close')}
        onClick={onClose}
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
      >
        <X size={18} />
      </IconButton>
      <DialogContent sx={{ padding: '28px 24px 24px' }}>
        <FluencyCallRequestForm
          date={date}
          time={time}
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
          onSubmit={() => {
            void onSubmit();
          }}
          onDone={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
