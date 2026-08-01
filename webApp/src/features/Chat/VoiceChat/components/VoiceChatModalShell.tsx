'use client';

import { Stack } from '@mui/material';
import { type ReactNode } from 'react';
import { VoiceChatModalContent, type VoiceChatModalContentProps } from './VoiceChatModalContent';

const modalShellSx = {
  maxWidth: 640,
  width: '100%',
  gap: 2.5,
  px: { xs: 1.5, sm: 2 },
  pb: 2,
} as const;

export const VoiceChatModalShell = ({
  testId,
  children,
}: {
  testId?: string;
  children: ReactNode;
}) => (
  <Stack data-testid={testId} sx={modalShellSx}>
    {children}
  </Stack>
);

export type VoiceChatModalViewProps = VoiceChatModalContentProps & {
  shellTestId?: string;
};

export const VoiceChatModalView = ({ shellTestId, ...contentProps }: VoiceChatModalViewProps) => (
  <VoiceChatModalShell testId={shellTestId}>
    <VoiceChatModalContent {...contentProps} />
  </VoiceChatModalShell>
);
