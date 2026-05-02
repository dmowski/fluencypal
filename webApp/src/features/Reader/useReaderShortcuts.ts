import { useEffect } from 'react';

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
};

export const useReaderShortcuts = ({
  activePage,
  maxPage,
  onClose,
  onNext,
  onPrevious,
}: {
  activePage: number;
  maxPage: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'ArrowRight' && activePage < maxPage) {
        event.preventDefault();
        onNext();
        return;
      }

      if (event.key === 'ArrowLeft' && activePage > 1) {
        event.preventDefault();
        onPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePage, maxPage, onClose, onNext, onPrevious]);
};