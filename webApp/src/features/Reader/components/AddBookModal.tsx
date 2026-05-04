'use client';

import {
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useLingui } from '@lingui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { CirclePlus, File } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import { BookChapterNavigationItem } from '../model/types';
import { convertEpubFile, validateEpubFile } from '../utils/epubImport';

export const AddBookModal = ({
  isOpen,
  onClose,
  isGlobalDropActive,
}: {
  isOpen: boolean;
  onClose: () => void;
  isGlobalDropActive?: boolean;
}) => {
  const i18n = useLingui();
  const books = useBooks();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [chapters, setChapters] = useState<BookChapterNavigationItem[]>([]);
  const [imageDataUrlByHref, setImageDataUrlByHref] = useState<Record<string, string>>({});
  const [imageAspectRatioByHref, setImageAspectRatioByHref] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConvertingFile, setIsConvertingFile] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionMessage, setConversionMessage] = useState('');
  const [conversionError, setConversionError] = useState('');
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isDropActive, setIsDropActive] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const dragDepthRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLocalHostName =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsLocalhost(isLocalHostName);
  }, []);

  const isDisabled =
    !title.trim() ||
    !subtitle.trim() ||
    !author.trim() ||
    !text.trim() ||
    isConvertingFile ||
    isSavingBook;

  const handleEpubUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleEpubImport = useCallback(
    async (file: File) => {
      const validationError = validateEpubFile(file);
      if (validationError) {
        setConversionError(validationError);
        return;
      }

      try {
        setIsConvertingFile(true);
        setConversionError('');

        const parsedBook = await convertEpubFile({
          file,
          onProgress: ({ progress, message }) => {
            setConversionProgress(progress);
            setConversionMessage(message);
          },
        });

        setText(parsedBook.text);
        setChapters(parsedBook.chapters);
        setImageDataUrlByHref(parsedBook.imageDataUrlByHref);
        setImageAspectRatioByHref(parsedBook.imageAspectRatioByHref);
        setTitle(parsedBook.title);
        setSubtitle(parsedBook.subtitle);
        setAuthor(parsedBook.author);

        setConversionProgress(100);
        setConversionMessage('Done. Text imported.');
      } catch (error) {
        console.error('EPUB conversion error:', error);
        const message = error instanceof Error ? error.message : 'Failed to convert EPUB.';
        setConversionError(message);
        setConversionProgress(0);
        setConversionMessage('');
      } finally {
        setIsConvertingFile(false);
      }
    },
    [i18n],
  );

  const handleEpubSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleEpubImport(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (!isOpen) return;

    const hasFiles = (event: DragEvent): boolean =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files');

    const handleDragEnter = (event: DragEvent) => {
      if (!hasFiles(event)) return;

      event.preventDefault();
      dragDepthRef.current += 1;
      setIsDropActive(true);
    };

    const handleDragOver = (event: DragEvent) => {
      if (!hasFiles(event)) return;

      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
      setIsDropActive(true);
    };

    const handleDragLeave = (event: DragEvent) => {
      if (!hasFiles(event)) return;

      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDropActive(false);
      }
    };

    const handleDrop = (event: DragEvent) => {
      if (!hasFiles(event)) return;

      event.preventDefault();
      dragDepthRef.current = 0;
      setIsDropActive(false);

      const file = event.dataTransfer?.files?.[0];
      if (!file) return;

      void handleEpubImport(file);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleEpubImport, isOpen]);

  const handleSubmit = async () => {
    if (isDisabled) return;

    try {
      setIsSavingBook(true);
      setSaveError('');
      setSaveProgress(20);
      setSaveMessage(i18n._('Preparing book...'));

      setSaveProgress(60);
      setSaveMessage(i18n._('Saving book...'));

      await books.addBook({
        title: title.trim(),
        subTitle: subtitle.trim(),
        author: author.trim(),
        text: text.trim(),
        chapters,
        imagesByHref: imageDataUrlByHref,
        imageAspectRatioByHref,
      });

      setSaveProgress(100);
      setSaveMessage(i18n._('Book saved.'));

      setTitle('');
      setSubtitle('');
      setAuthor('');
      setText('');
      setChapters([]);
      setImageDataUrlByHref({});
      setImageAspectRatioByHref({});
      setConversionProgress(0);
      setConversionMessage('');
      setConversionError('');
      setSaveError('');
      onClose();
    } catch (error) {
      console.error('Book save error:', error);
      const message = error instanceof Error ? error.message : i18n._('Failed to save book.');
      setSaveError(message);
      setSaveProgress(0);
      setSaveMessage('');
    } finally {
      setIsSavingBook(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <Stack
        sx={{ width: '100%', maxWidth: '700px', gap: '16px' }}
        component={'form'}
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <Typography variant="h4">{i18n._('Add New Book')}</Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept=".epub,application/epub+zip"
          style={{ display: 'none' }}
          onChange={handleEpubSelect}
        />
        <Stack sx={{ gap: '8px' }}>
          <Stack
            data-testid="add-book-drop-zone"
            sx={{
              gap: '10px',
              borderRadius: '12px',
              border: '2px dashed rgba(255, 255, 255, 0.6)',
              backgroundColor: isDropActive ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
              padding: '24px',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'background-color 150ms ease',
            }}
          >
            <Typography variant="h5">{i18n._('Drop EPUB file here')}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {i18n._('Only .epub files are supported')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              {i18n._('You can drop EPUB anywhere on this page while this dialog is open.')}
            </Typography>
          </Stack>

          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <Button
              onClick={handleEpubUploadClick}
              disabled={isConvertingFile}
              variant="outlined"
              color="info"
              aria-label={i18n._('Import text from EPUB')}
              startIcon={isConvertingFile ? <CircularProgress size={18} /> : <File size={18} />}
            >
              {i18n._('Import text from EPUB file')}
            </Button>
          </Stack>
          {isConvertingFile || conversionProgress > 0 ? (
            <>
              <LinearProgress variant="determinate" value={conversionProgress} />
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                {conversionMessage}
              </Typography>
            </>
          ) : null}
          {conversionError ? (
            <Typography variant="caption" color="error">
              {conversionError}
            </Typography>
          ) : null}

          {isLocalhost ? (
            <>
              <TextField
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                label={i18n._('Title')}
                fullWidth
                required
              />
              <TextField
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                label={i18n._('Subtitle')}
                fullWidth
                required
              />
              <TextField
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                label={i18n._('Author')}
                fullWidth
                required
              />
              <TextField
                value={text}
                onChange={(event) => setText(event.target.value)}
                label={i18n._('Text')}
                multiline
                minRows={8}
                maxRows={40}
                fullWidth
                required
              />
            </>
          ) : (
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {i18n._('Book fields are auto-filled from EPUB metadata in production mode.')}
            </Typography>
          )}

          {Object.keys(imageDataUrlByHref).length > 0 ? (
            <Stack sx={{ gap: '8px' }}>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                {i18n._('Extracted images')}: {Object.keys(imageDataUrlByHref).length}
              </Typography>
              <Stack
                sx={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {Object.values(imageDataUrlByHref)
                  .slice(0, 12)
                  .map((src, idx) => (
                    <Stack
                      key={idx}
                      component="img"
                      data-testid="epub-extracted-image"
                      src={src}
                      alt={`Extracted EPUB image ${idx + 1}`}
                      sx={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                  ))}
              </Stack>
            </Stack>
          ) : null}
        </Stack>

        {isOpen && (isDropActive || isGlobalDropActive) ? (
          <Stack
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              border: '3px dashed rgba(255, 255, 255, 0.9)',
              backgroundColor: 'rgba(0, 0, 0, 0.22)',
              pointerEvents: 'none',
            }}
          />
        ) : null}

        {isSavingBook || saveProgress > 0 ? (
          <Stack sx={{ gap: '6px' }}>
            <LinearProgress variant="determinate" value={saveProgress} />
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {saveMessage}
            </Typography>
          </Stack>
        ) : null}
        {saveError ? (
          <Typography variant="caption" color="error">
            {saveError}
          </Typography>
        ) : null}

        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '12px',
            paddingTop: '20px',
          }}
        >
          <Button
            size="large"
            variant="contained"
            color="info"
            type="submit"
            startIcon={<CirclePlus />}
          >
            {i18n._('Add')}
          </Button>
          <Button
            size="large"
            variant="outlined"
            color="info"
            type="button"
            onClick={onClose}
            disabled={isSavingBook}
          >
            {i18n._('Cancel')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
