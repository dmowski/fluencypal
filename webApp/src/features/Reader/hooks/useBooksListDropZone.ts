import { DragEvent as ReactDragEvent, useRef, useState } from 'react';

export const useBooksListDropZone = ({
  isDisabled,
  onDropFile,
}: {
  isDisabled: boolean;
  onDropFile: (file: File) => Promise<void> | void;
}) => {
  const [isDropActive, setIsDropActive] = useState(false);
  const dragDepthRef = useRef(0);

  const hasFiles = (event: ReactDragEvent<HTMLElement>): boolean =>
    Array.from(event.dataTransfer?.types ?? []).includes('Files');

  const handleDragEnter = (event: ReactDragEvent<HTMLDivElement>) => {
    if (isDisabled || !hasFiles(event)) return;

    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDropActive(true);
  };

  const handleDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    if (isDisabled || !hasFiles(event)) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDropActive(true);
  };

  const handleDragLeave = (event: ReactDragEvent<HTMLDivElement>) => {
    if (isDisabled || !hasFiles(event)) return;

    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDropActive(false);
    }
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    if (isDisabled || !hasFiles(event)) return;

    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDropActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    void onDropFile(file);
  };

  return {
    isDropActive,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
