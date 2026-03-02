'use client';

import { ChatProvider } from '../../Chat/useChat';
import { CommunitySpace } from '../types';
import type { ReactNode } from 'react';

export const SpaceProvider = ({
  space,
  children,
}: {
  space: CommunitySpace;
  children: ReactNode;
}) => {
  return (
    <ChatProvider
      metadata={{
        spaceId: 'space-' + space.id,
        allowedUserIds: null,
        isPrivate: false,
        type: 'space',
      }}
    >
      {children}
    </ChatProvider>
  );
};
