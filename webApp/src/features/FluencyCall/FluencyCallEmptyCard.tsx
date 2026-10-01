'use client';

import { CirclePlus, Users } from 'lucide-react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CommunityCallsHeader } from './CommunityCallsHeader';

export type FluencyCallEmptyCardProps = {
  isMember: boolean;
  membershipReady: boolean;
  requestedAtLabel: string | null;
  onInitiateCall: () => void;
  onJoinMembership: () => void;
};

export const FluencyCallEmptyCard = ({
  isMember,
  membershipReady,
  requestedAtLabel,
  onInitiateCall,
  onJoinMembership,
}: FluencyCallEmptyCardProps) => {
  const { i18n } = useLingui();
  const hasRequest = Boolean(requestedAtLabel);

  return (
    <Stack data-testid="fluency-call-card" sx={{ gap: '20px' }}>
      <Stack
        sx={{
          gap: '16px',
          padding: '20px',
          borderRadius: '16px',
          backgroundColor: '#1c1e24',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <CommunityCallsHeader />
        {membershipReady && isMember && (
          <Stack
            direction="row"
            sx={{
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            {hasRequest ? (
              <Stack data-testid="fluency-call-request-sent" sx={{ gap: '6px' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#7DDEAA' }}>
                  {i18n._('Request sent')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {requestedAtLabel}
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>{i18n._("We'll reply soon.")}</Typography>
              </Stack>
            ) : (
              <Stack sx={{ gap: '6px' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {i18n._('No call scheduled yet.')}
                </Typography>
                <Typography>{i18n._("Pick a time and we'll set one up.")}</Typography>
              </Stack>
            )}
          </Stack>
        )}

        {membershipReady && isMember && !hasRequest && (
          <Button
            variant="contained"
            color="info"
            data-testid="fluency-call-initiate"
            onClick={onInitiateCall}
            startIcon={<CirclePlus size={18} />}
            sx={{ alignSelf: 'flex-start' }}
          >
            {i18n._('Propose a call')}
          </Button>
        )}

        {membershipReady && isMember && hasRequest && (
          <Button
            variant="outlined"
            data-testid="fluency-call-change-time"
            onClick={onInitiateCall}
            sx={{ alignSelf: 'flex-start', minHeight: '44px', padding: '10px 22px' }}
          >
            {i18n._('Change time')}
          </Button>
        )}

        {membershipReady && !isMember && (
          <Button
            variant="contained"
            data-testid="fluency-call-join-membership"
            data-analytics="buy-access"
            onClick={onJoinMembership}
            sx={{
              backgroundColor: 'rgba(135, 31, 156, 0.53)',
              color: '#fad2fe',
              fontWeight: 600,
              borderRadius: '20px',
            }}
            startIcon={<Users size={18} color="#F8BCFF" />}
          >
            {i18n._('Join membership')}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
