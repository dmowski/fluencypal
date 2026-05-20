'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';

import { ChatProvider } from '../Chat/useChat';
import { FlatChat } from '../Chat/FlatChat';

interface NewsCommentsProps {
  newsId: string;
}

/**
 * Comments section for a single news article.
 * Each article gets its own isolated chat space keyed by `newsId`.
 */
export const NewsComments = ({ newsId }: NewsCommentsProps) => {
  const { i18n } = useLingui();

  return (
    <Stack
      data-testid="news-comments"
      sx={{
        gap: '12px',
        backgroundColor: '#222',
        borderRadius: '8px',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, padding: '15px 12px 22px 12px' }}>
        {i18n._('Comments')}
      </Typography>
      <ChatProvider
        metadata={{
          spaceId: `news-${newsId}`,
          allowedUserIds: null,
          isPrivate: false,
          type: 'newsComment',
        }}
      >
        <FlatChat />
      </ChatProvider>
    </Stack>
  );
};
