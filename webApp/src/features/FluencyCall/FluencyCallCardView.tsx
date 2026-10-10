'use client';

import { useId, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { FluencyCallCardHeader } from './card/FluencyCallCardHeader';
import { FluencyCallChatPanel } from './card/FluencyCallChatPanel';
import { FluencyCallNextConversation } from './card/FluencyCallNextConversation';
import { FluencyCallScheduleModal } from './card/FluencyCallScheduleModal';
import { narrow, token } from './card/styles';
import { FluencyCallCardCall, FluencyCallCardViewProps } from './card/types';
import { MutedPreviewVideo } from '../uiKit/Video/MutedPreviewVideo';

export {
  FLUENCY_CALL_CHAT_PAGE,
  FLUENCY_CALL_WELCOME_VIDEO_SRC,
  type FluencyCallCardCall,
  type FluencyCallCardViewProps,
} from './card/types';

export const FluencyCallCardView = ({
  calls,
  languageCode,
  onLanguageChange,
  timeZoneLabel,
  meetUrl,
  messages,
  onToggleJoining,
  onSendMessage,
  canJoin,
  requestedAtLabel,
  paidNotice,
  onInitiateCall,
  initialChatExpanded = false,
  notice = null,
  callPeople,
  welcomeVideoSrc,
}: FluencyCallCardViewProps) => {
  const { i18n } = useLingui();
  const uid = useId();
  const [modal, setModal] = useState<'schedule' | 'welcome' | null>(null);
  const [pendingCall, setPendingCall] = useState<string | null>(null);
  const [error, setError] = useState('');
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
        overflow: 'hidden',
        color: token.text,
        backgroundColor: token.bg,
        border: `1px solid rgba(255, 255, 255, 0.08)`,
        borderRadius: '16px',
        font: 'inherit',
        '& :focus-visible': {
          outline: `2px solid ${token.accent}`,
          outlineOffset: '3px',
        },
      }}
    >
      <Stack sx={{ padding: '24px 20px 20px 20px', gap: 0, [narrow]: { padding: '20px' } }}>
        <FluencyCallCardHeader
          titleId={`${uid}-title`}
          languageCode={languageCode}
          onLanguageChange={onLanguageChange}
          canJoin={canJoin}
          paidNotice={paidNotice}
        />
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gridTemplateAreas: '"conversation video"',
            alignItems: 'center',
            gap: '30px',
            padding: '20px 0 0px 0',
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr',
              gridTemplateAreas: '"video" "conversation"',
              alignItems: 'center',
              gap: '20px',
              padding: '20px 0',
            },
          }}
        >
          <Stack sx={{ gridArea: 'conversation' }}>
            <FluencyCallNextConversation
              next={calls[0]}
              timeZoneLabel={timeZoneLabel}
              meetUrl={meetUrl}
              pendingCallId={pendingCall}
              onToggle={toggle}
              onOpenSchedule={() => setModal('schedule')}
            />
          </Stack>
          <Stack
            sx={{
              gridArea: 'video',
              alignItems: 'flex-start',
              padding: '10px 10px 0px 0px',
              width: '100%',
            }}
          >
            <MutedPreviewVideo src={welcomeVideoSrc} muteSize="150px" playSize="280px" />
          </Stack>
        </Stack>
      </Stack>

      <FluencyCallChatPanel
        messages={messages}
        initialExpanded={initialChatExpanded}
        alert={alert}
        onSendMessage={onSendMessage}
        onError={setError}
      />

      <FluencyCallScheduleModal
        open={modal === 'schedule'}
        calls={calls}
        timeZoneLabel={timeZoneLabel}
        callPeople={callPeople}
        canJoin={canJoin}
        requestedAtLabel={requestedAtLabel}
        pendingCallId={pendingCall}
        alert={alert}
        onClose={() => setModal(null)}
        onToggle={toggle}
        onInitiateCall={onInitiateCall}
      />
    </Box>
  );
};
