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
import { useRef, useState } from 'react';
import { sendConvertDocToTextRequest } from '@/app/api/convertDocToText/sendConvertDocToTextRequest';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { CirclePlus, File } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';

export const AddBookModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const i18n = useLingui();
  const books = useBooks();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConvertingFile, setIsConvertingFile] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionMessage, setConversionMessage] = useState('');
  const [conversionError, setConversionError] = useState('');
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const isDisabled =
    !title.trim() ||
    !subtitle.trim() ||
    !category.trim() ||
    !text.trim() ||
    isConvertingFile ||
    isSavingBook;

  const handleEpubUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleEpubSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isEpub =
      file.type === 'application/epub+zip' ||
      file.name.toLowerCase().endsWith('.epub') ||
      file.type === 'application/octet-stream';

    if (!isEpub) {
      setConversionError(i18n._('Please select a valid EPUB file.'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setConversionError(i18n._('File size must be less than 50MB'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsConvertingFile(true);
      setConversionError('');
      setConversionProgress(10);
      setConversionMessage(i18n._('Uploading EPUB...'));

      setConversionProgress(35);
      setConversionMessage(i18n._('Converting EPUB to markdown...'));

      setConversionProgress(80);
      setConversionMessage(i18n._('Extracting plain text...'));

      const result = await sendConvertDocToTextRequest({ file });
      if (result.error) {
        throw new Error(result.error || i18n._('Failed to convert EPUB.'));
      }

      setText(result.text || '');
      setConversionProgress(100);
      setConversionMessage(i18n._('Done. Text imported.'));
    } catch (error) {
      console.error('EPUB conversion error:', error);
      const message = error instanceof Error ? error.message : i18n._('Failed to convert EPUB.');
      setConversionError(message);
      setConversionProgress(0);
      setConversionMessage('');
    } finally {
      setIsConvertingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        category: category.trim(),
        text: text.trim(),
      });

      setSaveProgress(100);
      setSaveMessage(i18n._('Book saved.'));

      setTitle('');
      setSubtitle('');
      setCategory('');
      setText('');
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
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          label={i18n._('Category')}
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
        <input
          ref={fileInputRef}
          type="file"
          accept=".epub,application/epub+zip"
          style={{ display: 'none' }}
          onChange={handleEpubSelect}
        />
        <Stack sx={{ gap: '8px' }}>
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
        </Stack>

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
