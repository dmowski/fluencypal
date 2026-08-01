'use client';

import { useLingui } from '@lingui/react';
import { VOICE_CHAT_INTRO_MIN_SECONDS } from '../types';
import { VoiceChatRecorderPanel } from './VoiceChatRecorderPanel';

interface VoiceChatIntroRecorderPanelProps {
  onSubmit: (blob: Blob, durationSec: number) => Promise<void>;
  onCancel?: () => void;
}

export const VoiceChatIntroRecorderPanel = ({
  onSubmit,
  onCancel,
}: VoiceChatIntroRecorderPanelProps) => {
  const { i18n } = useLingui();

  return (
    <VoiceChatRecorderPanel
      title={i18n._('Record your intro')}
      submitLabel={i18n._('Send for approval')}
      minSeconds={VOICE_CHAT_INTRO_MIN_SECONDS}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};
