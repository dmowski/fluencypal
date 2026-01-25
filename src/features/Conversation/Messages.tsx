'use client';

import { Markdown } from '../uiKit/Markdown/Markdown';
import { Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import { AudioLines, AudioWaveform, Languages, Loader, Sparkles } from 'lucide-react';

import { ChatMessage, MessagesOrderMap } from '@/common/conversation';
import { useLingui } from '@lingui/react';
import { useTranslate } from '../Translation/useTranslate';
import { useMemo, useState } from 'react';
import { getSortedMessages } from './getSortedMessages';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';
import { AiVoice } from '@/common/ai';
import { getAiVoiceByVoice } from './CallMode/voiceAvatar';
import { useAccess } from '../Usage/useAccess';
import { useTextAi } from '../Ai/useTextAi';
import { useConversationsAnalysis } from './useConversationsAnalysis';

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
              isLastMessage={isThisIsLast}
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
  isLastMessage,
}: {
  message: ChatMessage;
  isAiSpeaking?: boolean;
  voice: AiVoice;
  isLastMessage: boolean;
}) => {
  const { i18n } = useLingui();
  const translator = useTranslate();
  const access = useAccess();
  const isFullAccess = access.isFullAppAccess;
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
  const isAbleToGenerateHelpAnswer = message.isBot && isLastMessage;

  const conversationAnalysis = useConversationsAnalysis();

  const [proposedAnswer, setProposedAnswer] = useState<string | null>(null);
  const [proposedAnswerTranslation, setProposedAnswerTranslation] = useState<string | null>(null);
  const [isProposedAnswerLoading, setIsProposedAnswerLoading] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      const lastProposedAnswersAll = document.querySelectorAll('.proposed-answer');
      const lastProposedAnswers = lastProposedAnswersAll?.[lastProposedAnswersAll.length - 1];
      if (lastProposedAnswers) {
        lastProposedAnswers.scrollIntoView({ behavior: 'smooth' });
      }
    }, 30);
  };

  const generateProposedAnswer = async () => {
    setIsProposedAnswerLoading(true);

    const nextAnswer = await conversationAnalysis.generateNextUserMessage();
    const translatedAnswer =
      translator.isTranslateAvailable && nextAnswer
        ? await translator.translateText({
            text: nextAnswer,
          })
        : '';

    setProposedAnswer('\n' + nextAnswer);
    setProposedAnswerTranslation(translatedAnswer ? '\n' + translatedAnswer.trim() : null);
    setIsProposedAnswerLoading(false);
    scrollToBottom();
  };

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

          {isAbleToGenerateHelpAnswer && !proposedAnswer && (
            <Button
              variant="text"
              disabled={isProposedAnswerLoading || proposedAnswer !== null}
              onClick={generateProposedAnswer}
              startIcon={
                isProposedAnswerLoading ? <Loader size={'12px'} /> : <Sparkles size={'12px'} />
              }
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '2px 12px',
              }}
            >
              {i18n._('What to say?')}
            </Button>
          )}
        </Stack>
      </Stack>

      {proposedAnswer && (
        <Stack
          sx={{
            marginTop: '30px',
            padding: '14px 15px 15px 15px',
            alignItems: 'flex-start',
            backgroundColor: 'rgba(172, 65, 141, 0.2)',

            borderRadius: '8px',
            gap: '10px',
            width: '100%',
          }}
          className="proposed-answer"
        >
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Sparkles size={'16px'} />
            <Typography
              sx={{
                fontWeight: '600',
              }}
            >
              {i18n._('What you can say:')}
            </Typography>
          </Stack>
          <Stack
            sx={{
              gap: '5px',
              width: '100%',
            }}
          >
            <Markdown>{proposedAnswer}</Markdown>
            {proposedAnswerTranslation && <Divider />}
            {proposedAnswerTranslation && (
              <Stack
                sx={{
                  opacity: 0.7,
                }}
              >
                <Markdown variant="small">{proposedAnswerTranslation}</Markdown>
              </Stack>
            )}
          </Stack>
        </Stack>
      )}

      {translator.translateModal}
    </Stack>
  );
};
