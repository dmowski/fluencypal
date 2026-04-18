'use client';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useLingui } from '@lingui/react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';

interface EssayTextProps {
  text: string;
  isRecording: boolean;
  analysis?: string;
  isAnalyzing?: boolean;
  onDelete: () => void;
  onContinueRecording: () => void;
  onUpdate: (newText: string) => void;
  onAnalyze: () => void;
}

export const EssayText = ({
  text,
  isRecording,
  analysis,
  isAnalyzing,
  onDelete,
  onContinueRecording,
  onUpdate,
  onAnalyze,
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
    <Stack
      sx={{
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '20px',
        gap: '30px',
        borderRadius: '13px',
      }}
    >
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
        <Typography
          variant="body1"
          sx={{
            fontSize: '1.7rem',
            fontFamily: 'serif',
            whiteSpace: 'pre-wrap',
            minHeight: '2em',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          {text}
        </Typography>
      )}

      {!isEditing && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
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
          <Button
            variant="outlined"
            size="small"
            onClick={onAnalyze}
            disabled={isAnalyzing || !text.trim()}
            startIcon={isAnalyzing ? <CircularProgress size={14} /> : undefined}
          >
            {i18n._('Analyze')}
          </Button>
          <Button variant="outlined" size="small" color="error" onClick={onDelete}>
            {i18n._('Delete')}
          </Button>
        </Stack>
      )}

      {analysis && !isEditing && (
        <Stack sx={{}}>
          <Markdown>{analysis}</Markdown>
        </Stack>
      )}
    </Stack>
  );
};
