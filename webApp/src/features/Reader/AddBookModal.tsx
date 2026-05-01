'use client';

import {
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useLingui } from '@lingui/react';
import { useRef, useState } from 'react';
import { sendConvertDocToTextRequest } from '@/app/api/convertDocToText/sendConvertDocToTextRequest';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { File } from 'lucide-react';
import { useBooks } from './useBooks';

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

  const isDisabled =
    !title.trim() || !subtitle.trim() || !category.trim() || !text.trim() || isConvertingFile;

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

  const handleSubmit = () => {
    if (isDisabled) return;

    books.addBook({
      title: title.trim(),
      subTitle: subtitle.trim(),
      category: category.trim(),
      text: text.trim(),
    });

    setTitle('');
    setSubtitle('');
    setCategory('');
    setText('');
    setConversionProgress(0);
    setConversionMessage('');
    setConversionError('');
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <Stack sx={{ width: '100%', maxWidth: '700px', gap: '16px' }}>
        <Typography variant="h4">{i18n._('Add New Book')}</Typography>

        <TextField
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          label={i18n._('Title')}
          fullWidth
        />
        <TextField
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          label={i18n._('Subtitle')}
          fullWidth
        />
        <TextField
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          label={i18n._('Category')}
          fullWidth
        />
        <TextField
          value={text}
          onChange={(event) => setText(event.target.value)}
          label={i18n._('Text')}
          multiline
          minRows={8}
          maxRows={40}
          fullWidth
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
            <IconButton
              onClick={handleEpubUploadClick}
              disabled={isConvertingFile}
              aria-label={i18n._('Import text from EPUB')}
            >
              {isConvertingFile ? (
                <CircularProgress size={18} />
              ) : (
                <File size={18} color="rgba(200, 200, 200, 1)" />
              )}
            </IconButton>
            <Typography variant="body2">{i18n._('Import text from EPUB file')}</Typography>
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

        <Stack sx={{ flexDirection: 'row', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="outlined" onClick={onClose}>
            {i18n._('Cancel')}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isDisabled}>
            {i18n._('Add')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
