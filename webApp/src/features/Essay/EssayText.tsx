'use client';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useLingui } from '@lingui/react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { Loader, Mic, Pencil, Sparkle, Trash } from 'lucide-react';
import { IconButton, ThemeProvider } from '@mui/material';
import dayjs from 'dayjs';
import { Essay } from './types';
import { lightTheme } from '../uiKit/theme';
import { useEssay } from './useEssay';
import { useSettings } from '../Settings/useSettings';
import { useAiConversation } from '../Conversation/useAiConversation/useAiConversation';
import { MODELS } from '../Ai/ai';
import { useGlobalModals } from '../Modal/useGlobalModals';

interface EssayTextProps {
  essay: Essay;
  activeTranscript?: string;
  suggestion?: string;
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
  suggestion,
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

  const essayHook = useEssay();

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

  const [isAiCallStarting, setIsAiCallStarting] = useState(false);

  const settings = useSettings();
  const conversation = useAiConversation();
  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';
  const globalModal = useGlobalModals();

  const practiceWithAi = async () => {
    setIsAiCallStarting(true);
    await settings.setConversationMode('record');
    const userPrompt = window.prompt(
      i18n._('What you want to practice with AI?'),
      essay.userPromptForPracticeWithAi || '',
    );
    if (userPrompt) {
      essayHook.updateEssayData(essay.id, { userPromptForPracticeWithAi: userPrompt });
    }

    const instruction = `You need to discuss with user his writing. Use short messages, provoke user to speak.

    Context: ${essay.context}
    User's essay: ${essay.text}
    User's prompt for practice with you: ${essay.userPromptForPracticeWithAi || 'N/A'}
    Start a conversation with user based on these details. Follow user's lead and try to be as helpful as possible.`;
    await conversation.startConversation({
      conversationMode: 'record',
      mode: 'talk',
      voice: voiceName,
      customInstruction: instruction,
      model: MODELS.REALTIME_CONVERSATION,
    });
    setIsAiCallStarting(false);
    globalModal.closeAllModels();
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Stack
        sx={{
          width: '100%',
          backgroundColor: '#F1E1C9',
          color: '#232323',
          padding: '20px',
          gap: '30px',
          borderRadius: '13px',
          position: 'relative',
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            opacity: isRecording || isAnalyzing ? 0.2 : 0.5,
          }}
          onClick={onDelete}
          disabled={isRecording || isAnalyzing}
        >
          <Trash size={'14px'} color="#222" />
        </IconButton>

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
          <Stack>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
              }}
            >
              {i18n._('Context')}
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', opacity: essay.context ? 1 : 0.4 }}
              onClick={() => {
                setContextValue(essay.context);
                setIsEditingContext(true);
              }}
            >
              {essay.context || i18n._('Add context...')}
            </Typography>
          </Stack>
        )}
        {isEditing ? (
          <Stack
            sx={{
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
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
          <Stack>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
              }}
            >
              {i18n._('Transcript')}
            </Typography>
            <Stack
              sx={{
                fontSize: '1.7rem',
                fontFamily: 'serif',
                minHeight: '2em',
                fontWeight: 400,
                color: '#232323',
              }}
            >
              <Typography>{!essay.text.trim() && !activeTranscript && '-'}</Typography>
              <Stack
                sx={{
                  '* span': {
                    color: '#232323',
                    fontSize: '1.7rem',
                    fontFamily: 'serif',
                    fontWeight: 400,
                  },

                  '* p': {
                    paddingBottom: '10px',
                  },

                  '* .conversation-word:hover': {
                    borderBottomColor: '#232323',
                  },
                }}
              >
                <Markdown
                  onWordClick={(word, element) => {
                    console.log('word');
                  }}
                  variant="conversation"
                >
                  {'\n' + essay.text.trim()}
                </Markdown>
              </Stack>
              {activeTranscript && <Typography> {activeTranscript}</Typography>}
              {suggestion && !isEditing && (
                <Typography
                  sx={{
                    opacity: 0.4,
                  }}
                >
                  {' '}
                  {suggestion}
                </Typography>
              )}
            </Stack>
          </Stack>
        )}

        {!isEditing && (
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <Stack
              sx={{
                alignItems: 'flex-start',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="text"
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
                variant="text"
                size="small"
                onClick={handleEditClick}
              >
                {i18n._('Edit')}
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={onAnalyze}
                disabled={isAnalyzing || !essay.text.trim() || isRecording}
                startIcon={isAnalyzing ? <CircularProgress size={14} /> : <Sparkle size={'14px'} />}
              >
                {i18n._('Analyze')}
              </Button>

              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={practiceWithAi}
                disabled={isRecording || isAiCallStarting}
                startIcon={isAiCallStarting ? <Loader size={14} /> : <Mic size={'14px'} />}
              >
                {i18n._('Practice with AI')}
              </Button>
            </Stack>
          </Stack>
        )}

        {analysis && !isEditing && (
          <Stack
            sx={{
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <Markdown>{analysis}</Markdown>
            <Button
              variant="text"
              size="small"
              onClick={() => essayHook.deleteAnalysis(essay.id)}
              startIcon={<Trash size={'14px'} />}
            >
              {i18n._('Delete Analysis')}
            </Button>
          </Stack>
        )}
      </Stack>
    </ThemeProvider>
  );
};
