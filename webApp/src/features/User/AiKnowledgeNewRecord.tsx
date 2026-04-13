'use client';

import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { Plus } from 'lucide-react';

interface AiKnowledgeNewRecordProps {
  onAdd: (value: string) => Promise<void>;
  disabled: boolean;
  heading: string;
  addLabel: string;
  cancelLabel: string;
  placeholder: string;
}

export const AiKnowledgeNewRecord = ({
  onAdd,
  disabled,
  heading,
  addLabel,
  cancelLabel,
  placeholder,
}: AiKnowledgeNewRecordProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');

  const onSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    await onAdd(trimmed);
    setValue('');
    setIsEditing(false);
  };

  const onCancel = () => {
    setValue('');
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Button
        variant="contained"
        startIcon={<Plus size={18} />}
        onClick={() => setIsEditing(true)}
        disabled={disabled}
      >
        {heading}
      </Button>
    );
  }

  return (
    <Stack
      sx={{
        gap: '10px',
        width: '100%',
      }}
    >
      <Typography variant="subtitle1">{heading}</Typography>
      <TextField
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        multiline
        minRows={2}
        maxRows={6}
        fullWidth
      />
      <Stack direction="row" sx={{ gap: '10px' }}>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
        >
          {addLabel}
        </Button>
        <Button variant="text" onClick={onCancel} disabled={disabled}>
          {cancelLabel}
        </Button>
      </Stack>
    </Stack>
  );
};
