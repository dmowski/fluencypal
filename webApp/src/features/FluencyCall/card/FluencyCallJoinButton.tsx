'use client';

import { Button } from '@mui/material';
import { Check, Plus } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { textButtonSx } from './styles';
import { FluencyCallCardCall } from './types';

export const FluencyCallJoinButton = ({
  call,
  pendingCallId,
  onToggle,
}: {
  call: FluencyCallCardCall;
  pendingCallId: string | null;
  onToggle: (call: FluencyCallCardCall) => Promise<void>;
}) => {
  const { i18n } = useLingui();

  return (
    <Button
      data-testid={`fluency-call-join-${call.id}`}
      data-analytics="community-call-rsvp"
      aria-pressed={call.isJoining}
      color="inherit"
      disabled={pendingCallId !== null}
      onClick={() => {
        void onToggle(call);
      }}
      startIcon={call.isJoining ? <Check size={16} /> : <Plus size={16} />}
      sx={textButtonSx}
    >
      {pendingCallId === call.id
        ? i18n._('Updating...')
        : call.isJoining
          ? i18n._("I'm joining")
          : i18n._("I'll join")}
    </Button>
  );
};
