'use client';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useLingui } from '@lingui/react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { Mic, Pencil, Sparkle, Trash } from 'lucide-react';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import { Essay } from './types';

interface EssayTextProps {
  text: string;
  essay: Essay;
  activeTranscript?: string;
  createdAtIso: string;
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
  essay,
  activeTranscript,
  createdAtIso,
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
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {dayjs(essay.updatedAtIso).format('DD MMM YYYY, HH:mm')}
      </Typography>
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
            minHeight: '2em',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.85)',
            i: {
              fontFamily: 'serif',
            },
          }}
        >
          {!text.trim() && !activeTranscript && '-'}
          {text}
          {activeTranscript && <i>{activeTranscript}</i>}
        </Typography>
      )}

      {!isEditing && (
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={onContinueRecording}
              disabled={isRecording}
              startIcon={<Mic size={'14px'} />}
            >
              {i18n._('Record More')}
            </Button>
            <Button
              startIcon={<Pencil size={'14px'} />}
              disabled={isRecording}
              variant="outlined"
              size="small"
              onClick={handleEditClick}
            >
              {i18n._('Edit')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={onAnalyze}
              disabled={isAnalyzing || !text.trim() || isRecording}
              startIcon={isAnalyzing ? <CircularProgress size={14} /> : <Sparkle size={'14px'} />}
            >
              {i18n._('Analyze')}
            </Button>
          </Stack>
          <IconButton
            sx={{
              opacity: 0.6,
            }}
            onClick={onDelete}
            disabled={isRecording || isAnalyzing}
          >
            <Trash size={'18px'} />
          </IconButton>
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
