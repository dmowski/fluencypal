'use client';

import { Markdown } from '../uiKit/Markdown/Markdown';
import { IconButton, Stack, Typography } from '@mui/material';
import { AudioLines, AudioWaveform, Languages } from 'lucide-react';

import { ChatMessage, MessagesOrderMap } from '@/common/conversation';
import { useLingui } from '@lingui/react';
import { useTranslate } from '../Translation/useTranslate';
import { useMemo, useState } from 'react';
import { getSortedMessages } from './getSortedMessages';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';
import { AiVoice } from '@/common/ai';
import { getAiVoiceByVoice } from './CallMode/voiceAvatar';
import { useAccess } from '../Usage/useAccess';

export const Messages = ({
  conversation,
  messageOrder,
  isAiSpeaking,
  voice,
}: {
  conversation: ChatMessage[];
  messageOrder: MessagesOrderMap;
  isAiSpeaking?: boolean;
  voice: AiVoice;
}) => {
  const translator = useTranslate();

  const sortedMessages = useMemo(
    () => getSortedMessages({ conversation, messageOrder }),
    [conversation, messageOrder, isAiSpeaking],
  );

  const messages = (
    <>
      {translator.translateModal}
      <Stack
        sx={{
          gap: '40px',
          paddingTop: '60px',
          width: '100%',
        }}
      >
        {sortedMessages.map((message, index, all) => {
          const lastMessage = all[all.length - 1];
          const isLastIsBot = lastMessage?.isBot;
          const isThisIsLast = index === all.length - 1;
          return (
            <Message
              key={message.id}
              message={message}
              voice={voice}
              isAiSpeaking={isThisIsLast && isLastIsBot && isAiSpeaking}
            />
          );
        })}
      </Stack>
    </>
  );

  return messages;
};

export const Message = ({
  message,
  isAiSpeaking,
  voice,
}: {
  message: ChatMessage;
  isAiSpeaking?: boolean;
  voice: AiVoice;
}) => {
  const { i18n } = useLingui();
  const translator = useTranslate();
  const access = useAccess();
  const isFullAccess = !access.isFullAppAccess;

  const voiceInfo = getAiVoiceByVoice(voice);

  const isBot = message.isBot;

  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const toggleTranslation = async () => {
    setIsTranslating(true);
    if (translatedText) {
      setTranslatedText('');
    } else {
      const result = await translator.translateText({
        text: message?.text || '',
      });
      setTranslatedText('\n' + result.trim());
    }
    setIsTranslating(false);
  };

  const text = translatedText || '\n' + (message.text || '').trim();

  return (
    <Stack
      key={message.id}
      sx={{
        padding: '0 20px',
        boxSizing: 'border-box',
        color: '#e1e1e1',
        width: '100%',
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            opacity: 0.5,
          }}
        >
          {isBot ? i18n._('Teacher:') : i18n._('You:')}{' '}
        </Typography>
        <AudioLines
          size={'14px'}
          style={{
            color: '#b5dbff',
            opacity: isAiSpeaking ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      </Stack>

      <Stack
        sx={{
          display: 'inline-block',
        }}
      >
        <Markdown
          onWordClick={
            translator.isTranslateAvailable && !translatedText
              ? (word, element) => {
                  translator.translateWithModal(word, element);
                }
              : undefined
          }
          variant="conversation"
        >
          {text}
        </Markdown>
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {translator.isTranslateAvailable && text && (
            <IconButton onClick={toggleTranslation} disabled={isTranslating}>
              <Languages
                size={'16px'}
                color={isTranslating ? '#4cd1fdff' : 'rgba(255, 255, 255, 0.7)'}
              />
            </IconButton>
          )}

          <Stack
            onClick={(e) => {
              if (isFullAccess) return;
              e.stopPropagation();
              e.preventDefault();
              access.showPaymentModal();
            }}
          >
            <AudioPlayIcon text={text} voice={voice} instructions={voiceInfo.voiceInstruction} />
          </Stack>
        </Stack>
      </Stack>
      {translator.translateModal}
    </Stack>
  );
};
