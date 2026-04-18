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
import dayjs from 'dayjs';
import { Essay } from './types';

interface EssayTextProps {
  essay: Essay;
  activeTranscript?: string;
  isRecording: boolean;
  analysis?: string;
  isAnalyzing?: boolean;
  onDelete: () => void;
  onContinueRecording: () => void;
  onUpdate: (newText: string) => void;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateContext: (newContext: string) => void;
  onAnalyze: () => void;
}

export const EssayText = ({
  essay,
  activeTranscript,
  isRecording,
  analysis,
  isAnalyzing,
  onDelete,
  onContinueRecording,
  onUpdate,
  onUpdateTitle,
  onUpdateContext,
  onAnalyze,
}: EssayTextProps) => {
  const { i18n } = useLingui();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(essay.text);
  const [titleValue, setTitleValue] = useState(essay.title);
  const [contextValue, setContextValue] = useState(essay.context);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContext, setIsEditingContext] = useState(false);

  const handleEditClick = () => {
    setEditValue(essay.text);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editValue);
    setIsEditing(false);
  };

  const handleTitleSave = () => {
    onUpdateTitle(titleValue);
    setIsEditingTitle(false);
  };

  const handleContextSave = () => {
    onUpdateContext(contextValue);
    setIsEditingContext(false);
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

      {isEditingTitle ? (
        <Stack
          sx={{
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <TextField
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            fullWidth
            size="small"
            placeholder={i18n._('Title')}
            autoFocus
          />
          <Button variant="contained" onClick={handleTitleSave} size="small">
            {i18n._('Save')}
          </Button>
        </Stack>
      ) : (
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer', opacity: essay.title ? 1 : 0.4 }}
          onClick={() => {
            setTitleValue(essay.title);
            setIsEditingTitle(true);
          }}
        >
          {essay.title || i18n._('Add title...')}
        </Typography>
      )}

      {isEditingContext ? (
        <Stack
          sx={{
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <TextField
            multiline
            minRows={2}
            value={contextValue}
            onChange={(e) => setContextValue(e.target.value)}
            fullWidth
            size="small"
            placeholder={i18n._('Context (topic, audience, goal...)')}
            autoFocus
          />
          <Button variant="contained" onClick={handleContextSave} size="small">
            {i18n._('Save')}
          </Button>
        </Stack>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ cursor: 'pointer', opacity: essay.context ? 1 : 0.4 }}
          onClick={() => {
            setContextValue(essay.context);
            setIsEditingContext(true);
          }}
        >
          {essay.context || i18n._('Add context...')}
        </Typography>
      )}
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
          {!essay.text.trim() && !activeTranscript && '-'}
          {essay.text}
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
              disabled={isAnalyzing || !essay.text.trim() || isRecording}
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
