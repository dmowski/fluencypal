'use client';

import { useLingui } from '@lingui/react';
import { supportedLanguages } from '@/features/Lang/lang';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { CommunityCallOnboarding } from './CommunityCallOnboarding';

export const CommunityCallRequestModal = ({
  onClose,
  onOpenVoiceChat,
}: {
  onClose: () => void;
  onOpenVoiceChat?: () => void;
}) => {
  const { i18n } = useLingui();
  const lang = supportedLanguages.find((code) => code === i18n.locale) ?? 'en';

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      zIndex={1400}
      backgroundColor="#1c1e24"
      data-testid="community-call-request-modal"
    >
      <CommunityCallOnboarding lang={lang} signedIn onOpenVoiceChat={onOpenVoiceChat} />
    </CustomModal>
  );
};
