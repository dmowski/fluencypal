import { useEffect } from 'react';

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
};

const selectAllPageContent = () => {
  const pageColumns = document.querySelectorAll<HTMLElement>('[data-testid="reader-page-column"]');
  if (pageColumns.length === 0) return;

  const findFirstTextNode = (node: Node): Text | null => {
    if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').length > 0)
      return node as Text;
    for (const child of Array.from(node.childNodes)) {
      const found = findFirstTextNode(child);
      if (found) return found;
    }
    return null;
  };

  const findLastTextNode = (node: Node): Text | null => {
    if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').length > 0)
      return node as Text;
    const children = Array.from(node.childNodes);
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const found = findLastTextNode(children[i]);
      if (found) return found;
    }
    return null;
  };

  const firstText = findFirstTextNode(pageColumns[0]);
  const lastText = findLastTextNode(pageColumns[pageColumns.length - 1]);
  if (!firstText || !lastText) return;

  const range = document.createRange();
  range.setStart(firstText, 0);
  range.setEnd(lastText, lastText.textContent?.length ?? 0);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
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
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        selectAllPageContent();
        return;
      }

      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();

        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          // Text is selected, clear the selection and don't close
          selection.removeAllRanges();
          return;
        }

        // No selection, ask for confirmation before closing
        if (window.confirm('Close the book?')) {
          onClose();
        }
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
