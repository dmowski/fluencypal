'use client';

import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { useBooks } from './useBooks';

export const AddBookModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const i18n = useLingui();
  const books = useBooks();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [text, setText] = useState('');

  const isDisabled = !title.trim() || !subtitle.trim() || !category.trim() || !text.trim();

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
          fullWidth
        />

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
