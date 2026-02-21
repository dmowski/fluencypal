'use client';

import { useEffect, useState } from 'react';
import { Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Check, Edit3, Trash } from 'lucide-react';

interface AiKnowledgeRecordRowProps {
  record: string;
  index: number;
  onSave: (index: number, value: string) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  disabled: boolean;
  i18nSave: string;
  i18nDelete: string;
  i18nCancel: string;
  i18nEdit: string;
}

export const AiKnowledgeRecordRow = ({
  record,
  index,
  onSave,
  onDelete,
  disabled,
  i18nSave,
  i18nDelete,
  i18nCancel,
  i18nEdit,
}: AiKnowledgeRecordRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(record);

  useEffect(() => {
    setDraft(record);
  }, [record]);

  const onSaveClick = async () => {
    await onSave(index, draft);
    setIsEditing(false);
  };

  const onCancel = () => {
    setDraft(record);
    setIsEditing(false);
  };

  return (
    <Stack
      sx={{
        width: '100%',
        gap: '10px',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      {isEditing ? (
        <>
          <TextField
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            multiline
            minRows={2}
            maxRows={6}
            fullWidth
          />
          <Stack
            direction="row"
            sx={{
              gap: '10px',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant="contained"
              startIcon={<Check size={18} />}
              onClick={onSaveClick}
              disabled={disabled || !draft.trim()}
            >
              {i18nSave}
            </Button>
            <Button variant="text" onClick={onCancel} disabled={disabled}>
              {i18nCancel}
            </Button>
          </Stack>
        </>
      ) : (
        <Stack
          direction="row"
          sx={{
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              flex: 1,
              whiteSpace: 'pre-wrap',
            }}
          >
            {record}
          </Typography>
          <Stack direction="row" sx={{ gap: '6px' }}>
            <IconButton
              onClick={() => setIsEditing(true)}
              disabled={disabled}
              aria-label={i18nEdit}
            >
              <Edit3 size={'15px'} />
            </IconButton>
            <IconButton onClick={() => onDelete(index)} disabled={disabled} aria-label={i18nDelete}>
              <Trash size={'15px'} />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
