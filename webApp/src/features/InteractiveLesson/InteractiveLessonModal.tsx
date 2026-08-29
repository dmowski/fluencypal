'use client';

import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { InteractiveLessonModalContent } from './InteractiveLessonModalContent';

export { InteractiveLessonModalContent } from './InteractiveLessonModalContent';

export const InteractiveLessonModal = ({
  isOpen,
  onClose,
  ...contentProps
}: {
  isOpen: boolean;
  onClose: () => void;
} & Omit<
  Parameters<typeof InteractiveLessonModalContent>[0],
  'onClose'
>) => {
  if (!isOpen) return null;

  return (
    <CustomModal isOpen={true} onClose={onClose} mobilePadding="0" desktopPadding="0">
      <InteractiveLessonModalContent onClose={onClose} {...contentProps} />
    </CustomModal>
  );
};
