'use client';

import Image from 'next/image';
import { Stack, Typography, Button, IconButton, TextField } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAudioRecorder } from '../Audio/useAudioRecorder';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import MicIcon from '@mui/icons-material/Mic';
import { CHAT_MESSAGE_POINTS } from './data';
import { useEffect, useState } from 'react';
import { ProcessUserInput } from '../Conversation/ProcessUserInput';
import { ImagePlus, Keyboard, Lightbulb, Mic, TextSearch, Trash } from 'lucide-react';
import { GamePlusPoints } from '../Game/gameQuestionScreens/gameCoreUI';
import { useTextAi } from '../Ai/useTextAi';
import { ThreadsMessageAttachment } from './type';
import { UploadImageButton } from '../Game/UploadImageButton';

interface SubmitFormProps {
  onSubmit: (message: string, attachments: ThreadsMessageAttachment[]) => Promise<void>;
  isLoading: boolean;
  recordMessageTitle: string;
  setIsActiveRecording: (isRecording: boolean) => void;
  previousBotMessage: string;
}

export function SubmitForm({
  onSubmit,
  isLoading,
  recordMessageTitle,
  setIsActiveRecording,
  previousBotMessage,
}: SubmitFormProps) {
  const { i18n } = useLingui();

  const recorder = useAudioRecorder();

  const [attachments, setAttachments] = useState<ThreadsMessageAttachment[]>([]);

  const [isSending, setIsSending] = useState(false);
  const ai = useTextAi();

  const submitTranscription = async () => {
    setIsSending(true);
    await onSubmit(recorder.transcription || '', attachments);
    setAttachments([]);
    recorder.removeTranscript();
    recorder.cancelRecording();
    setIsSending(false);
  };

  useEffect(() => {
    if (setIsActiveRecording) {
      setIsActiveRecording(recorder.isRecording);
    }
  }, [recorder.isRecording, setIsActiveRecording]);

  const needMoreText = !!recorder?.transcription?.length && recorder.transcription.length < 4;

  const isAnalyzingResponse = recorder.isTranscribing;

  const [isTextMode, setIsTextMode] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [preSubmitTextMessage, setPreSubmitTextMessage] = useState('');

  const onPreSubmitTextMessage = async () => {
    setPreSubmitTextMessage(textMessage.trim());
  };

  const onChangeTextMessage = (message: string) => {
    setTextMessage(message);
  };

  const submitTextMessage = async () => {
    if (textMessage.trim() === '') {
      return;
    }
    await onSubmit(textMessage.trim(), attachments);
    setAttachments([]);
    setTextMessage('');
    setPreSubmitTextMessage('');
  };

  const [ideaForMessage, setIdeaForMessage] = useState('');
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const generateIdeasForMessage = async () => {
    setIsGeneratingIdea(true);
    setIdeaForMessage(i18n._('Loading...'));
    const systemMessage = `You are an assistant that helps users come up with ideas for messages they can send in a chat to boost conversation. 

Provide a short idea for a message the user can send in a chat to gain interest.

The idea should be concise, engaging and provocative.

Do not wrap the idea in quotes or punctuation.
Keep it under 20 words.
Provide only the message user can send, without any additional explanation or context.
`;

    const userMessage = `Context (Previous chat message): ${previousBotMessage}`;
    const idea = await ai.generate({
      systemMessage: systemMessage,
      userMessage: userMessage,
      model: 'gpt-4o',
    });
    setIdeaForMessage(idea);
    setIsGeneratingIdea(false);
  };

  const addImage = (url: string) => {
    setAttachments((prev) => [
      ...prev,
      {
        type: 'image',
        url,
      },
    ]);
  };

  const attachmentComponent = (
    <>
      <Stack
        sx={{
          flexDirection: 'row',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        {attachments.map((attachment, index) => {
          if (attachment.type === 'image') {
            return (
              <Stack
                key={index}
                sx={{
                  position: 'relative',
                }}
              >
                <Stack
                  sx={{
                    width: '80px',
                    height: '80px',
                  }}
                >
                  <Image
                    src={attachment.url}
                    alt="Avatar"
                    fill
                    sizes={'80px'}
                    style={{
                      objectFit: 'cover',
                      zIndex: 1,
                      borderRadius: '8px',
                    }}
                  />
                </Stack>

                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: '-10px',
                    zIndex: 2,

                    right: '-10px',
                    backgroundColor: 'rgba(0,0,0,1)',
                    boxShadow: '0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
                  }}
                  onClick={() => {
                    setAttachments((prev) => prev.filter((_, attIndex) => attIndex !== index));
                  }}
                >
                  <Trash size={'14px'} color="rgba(222, 222, 222, 1)" />
                </IconButton>
              </Stack>
            );
          }
          return null;
        })}
      </Stack>
    </>
  );

  return (
    <Stack
      sx={{
        width: '100%',
        gap: '20px',
        alignItems: 'flex-start',
        padding: '15px',
      }}
    >
      {(recorder.transcription ||
        recorder.isTranscribing ||
        isAnalyzingResponse ||
        preSubmitTextMessage) && (
        <Stack
          sx={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ProcessUserInput
            isTranscribing={recorder.isTranscribing}
            userMessage={(isTextMode ? preSubmitTextMessage : recorder.transcription || '') || ''}
            previousBotMessage={previousBotMessage}
            isRecording={recorder.isRecording}
          />
        </Stack>
      )}

      {isTextMode && (
        <Stack
          sx={{
            gap: '10px',
            width: '100%',
            paddingTop: '10px',
            position: 'relative',
          }}
        >
          {ideaForMessage && (
            <Stack>
              <Typography
                className={isGeneratingIdea ? 'loading-shimmer' : ''}
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._('Idea for your message:')}
              </Typography>
              <Typography className={isGeneratingIdea ? 'loading-shimmer' : ''}>
                {ideaForMessage}
              </Typography>
            </Stack>
          )}
          <TextField
            placeholder={i18n._('')}
            value={textMessage}
            label={i18n._('Your Message')}
            multiline
            minRows={4}
            maxRows={10}
            fullWidth
            onChange={(e) => onChangeTextMessage(e.target.value || '')}
          />

          <Stack
            sx={{
              flexDirection: 'row',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: '10px',
            }}
          >
            <Stack
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconButton
                onClick={() => setIsTextMode(!isTextMode)}
                disabled={recorder.isRecording || recorder.isTranscribing || isLoading}
              >
                <Mic size={'18px'} color={'rgba(200, 200, 200, 1)'} />
              </IconButton>
            </Stack>

            <Button
              variant="contained"
              onClick={async () => submitTextMessage()}
              disabled={textMessage.trim() === ''}
              endIcon={<SendIcon />}
              sx={{
                width: '100%',
              }}
            >
              {i18n._('Send Message')}
            </Button>

            <Stack
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <IconButton
                onClick={generateIdeasForMessage}
                disabled={isGeneratingIdea || !previousBotMessage}
              >
                <Lightbulb size={'18px'} color={'rgba(200, 200, 200, 1)'} />
              </IconButton>
              <IconButton
                onClick={async () => onPreSubmitTextMessage()}
                disabled={textMessage.trim() === ''}
              >
                <TextSearch size={'18px'} color={'rgba(200, 200, 200, 1)'} />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      )}

      {!isTextMode && (
        <Stack
          sx={{
            width: '100%',
            gap: '10px',
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
            }}
          >
            {!recorder.transcription && !recorder.isTranscribing && !recorder.isRecording && (
              <IconButton
                onClick={() => setIsTextMode(!isTextMode)}
                disabled={recorder.isRecording || recorder.isTranscribing || isLoading}
                sx={{
                  marginRight: '10px',
                }}
              >
                <Keyboard
                  size={'18px'}
                  color={isTextMode ? 'rgba(0, 150, 255, 1)' : 'rgba(200, 200, 200, 1)'}
                />
              </IconButton>
            )}

            {(!recorder.transcription || recorder.isTranscribing || recorder.isRecording) && (
              <Button
                disabled={recorder.isTranscribing || isLoading}
                variant={'contained'}
                color={recorder.isRecording ? 'error' : 'info'}
                sx={{
                  width: '100%',
                }}
                size="large"
                onClick={() => {
                  if (recorder.isRecording) {
                    recorder.stopRecording();
                  } else {
                    recorder.startRecording();
                  }
                }}
                startIcon={recorder.isRecording ? <StopIcon /> : <MicIcon />}
              >
                {recorder.isRecording ? i18n._('Stop') : recordMessageTitle}
              </Button>
            )}

            {recorder.transcription && !recorder.isRecording && !recorder.isTranscribing && (
              <Stack
                sx={{
                  flexDirection: 'row',
                  gap: '10px',
                  width: 'calc(100% - 0px)',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="outlined"
                  color="info"
                  disabled={
                    needMoreText || recorder.isTranscribing || recorder.isRecording || isLoading
                  }
                  onClick={async () => {
                    recorder.startRecording();
                  }}
                  endIcon={<Mic />}
                >
                  {i18n._('Re-record')}
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  disabled={
                    needMoreText ||
                    recorder.isTranscribing ||
                    recorder.isRecording ||
                    isSending ||
                    isLoading
                  }
                  onClick={() => submitTranscription()}
                  endIcon={<SendIcon />}
                >
                  {isSending ? i18n._('Sending...') : i18n._('Send Message')}
                </Button>
              </Stack>
            )}

            <Stack
              sx={{
                width: recorder.isRecording ? '100%' : 'max-content',
                height: '38px',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexDirection: 'row',
              }}
            >
              <Stack
                sx={{
                  height: '100%',
                  width: recorder.isRecording ? '100%' : '0',
                }}
              >
                {recorder.visualizerComponent}
              </Stack>

              {!recorder.isRecording && !recorder.transcription && (
                <Stack
                  sx={{
                    width: '100%',
                    paddingLeft: '10px',
                    '@media (max-width: 600px)': {
                      display: 'none',
                    },
                  }}
                >
                  <UploadImageButton type="icon" onNewUploadUrl={(url) => addImage(url)} />
                </Stack>
              )}

              {recorder.transcription && (
                <Stack
                  sx={{
                    width: '100%',
                    paddingLeft: '20px',
                  }}
                >
                  <IconButton
                    size="small"
                    disabled={isLoading}
                    onClick={() => {
                      recorder.removeTranscript();
                      recorder.cancelRecording();
                    }}
                  >
                    <Trash size={'18px'} color="rgba(200, 200, 200, 1)" />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          </Stack>

          {recorder.transcription && needMoreText && (
            <>
              <Typography
                sx={{
                  width: '100%',
                  paddingLeft: '10px',
                  opacity: 0.8,
                }}
                variant="caption"
                color={'#ff8e86ff'}
              >
                {i18n._(`Please record a longer message (at least a few words).`)}
              </Typography>
            </>
          )}
        </Stack>
      )}

      {attachments.length > 0 && (
        <Stack
          sx={{
            width: '100%',
          }}
        >
          {attachmentComponent}
        </Stack>
      )}
    </Stack>
  );
}
