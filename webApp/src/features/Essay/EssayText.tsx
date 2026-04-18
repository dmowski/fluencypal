'use client';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useLingui } from '@lingui/react';

interface EssayTextProps {
  text: string;
  isRecording: boolean;
  onDelete: () => void;
  onContinueRecording: () => void;
  onUpdate: (newText: string) => void;
}

export const EssayText = ({
  text,
  isRecording,
  onDelete,
  onContinueRecording,
  onUpdate,
}: EssayTextProps) => {
  const { i18n } = useLingui();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);

  const handleEditClick = () => {
    setEditValue(text);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editValue);
    setIsEditing(false);
  };

  return (
    <Stack spacing={1}>
      {isEditing ? (
        <Stack spacing={1}>
          <TextField
            multiline
            minRows={4}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleSave} size="small">
            {i18n._('Save')}
          </Button>
        </Stack>
      ) : (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', minHeight: '2em' }}>
          {text}
        </Typography>
      )}

      {!isEditing && (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={onContinueRecording}
            disabled={isRecording}
          >
            {i18n._('Record More')}
          </Button>
          <Button variant="outlined" size="small" onClick={handleEditClick}>
            {i18n._('Edit')}
          </Button>
          <Button variant="outlined" size="small" color="error" onClick={onDelete}>
            {i18n._('Delete')}
          </Button>
        </Stack>
      )}
    </Stack>
  );
};
