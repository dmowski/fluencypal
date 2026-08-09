'use client';

import { useLingui } from '@lingui/react';
import MailIcon from '@mui/icons-material/Mail';
import { Badge, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import { useChatList } from '../Chat/useChatList';
import { GradientCard } from '../uiKit/Card/GradientCard';
import { StoreButton } from '../uiKit/Card/StoreCard/StoreButton';

export const NewPrivateMessageCard = () => {
  const { i18n } = useLingui();
  const chatList = useChatList();
  const router = useRouter();
  const unreadCount = chatList.myUnreadCount;

  if (unreadCount <= 0) {
    return null;
  }

  const openInbox = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('inbox', 'true');
    searchParams.set('inboxType', 'messages');
    router.push(`${window.location.pathname}?${searchParams.toString()}`, { scroll: false });
  };

  return (
    <Stack data-testid="new-private-message-card">
      <GradientCard
        padding="16px 18px"
        strokeWidth="1px"
        startColor="rgba(85, 141, 219, 0.55)"
        endColor="rgba(5, 172, 255, 0.55)"
        backgroundColor="rgba(28, 37, 49, 0.88)"
      >
        <Stack
          direction="row"
          sx={{
            width: '100%',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <Stack
            sx={{
              minWidth: '42px',
              height: '42px',
              borderRadius: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <MailIcon sx={{ color: '#fff', opacity: 0.85 }} />
            </Badge>
          </Stack>

          <Stack sx={{ flex: 1, gap: '4px', minWidth: 0 }}>
            <Typography
              sx={{
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {i18n._('You have a new private message.')}
            </Typography>
          </Stack>

          <StoreButton title={i18n._('Open')} onClick={openInbox} />
        </Stack>
      </GradientCard>
    </Stack>
  );
};
