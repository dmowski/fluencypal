'use client';

import { Markdown } from '../uiKit/Markdown/Markdown';
import { Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import { AudioLines, Languages, Loader, Sparkles } from 'lucide-react';

import { ConversationMessage, MessagesOrderMap } from '@/features/Conversation/conversation';
import { useLingui } from '@lingui/react';
import { useTranslate } from '../Translation/useTranslate';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getSortedMessages } from './getSortedMessages';
import { isFirstQuizTalkTeacherTurn } from './quizTalk';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';
import { AiVoice } from '@/features/Ai/ai';
import { getAiVoiceByVoice } from './CallMode/voiceAvatar';
import { useAccess } from '../Usage/useAccess';
import { useConversationsAnalysis } from './useConversationsAnalysis';
import { LoadingShapes } from '../uiKit/Loading/LoadingShapes';
import { GuessGameStat } from './types';
import { AliasGamePanel } from './AliasGamePanel';

export const QUIZ_TALK_SUGGESTED_REPLY_ANALYTICS_ID = 'quiz-talk-suggested-reply';

export const Messages = ({
  conversation,
  messageOrder,
  isAiSpeaking,
  voice,
  isLocked,
  gameWords,
  autoProposeFirstReply = false,
  onSendProposedAnswer,
}: {
  conversation: ConversationMessage[];
  messageOrder: MessagesOrderMap;
  isAiSpeaking?: boolean;
  voice: AiVoice;
  isLocked?: boolean;
  gameWords?: GuessGameStat | null;
  autoProposeFirstReply?: boolean;
  onSendProposedAnswer?: (text: string) => void;
}) => {
  const translator = useTranslate();

  const sortedMessages = useMemo(
    () => getSortedMessages({ conversation, messageOrder }),
    [conversation, messageOrder, isAiSpeaking],
  );
  const shouldAutoProposeFirstReply =
    autoProposeFirstReply && isFirstQuizTalkTeacherTurn(sortedMessages);

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
        {sortedMessages.length === 0 && <LoadingShapes sizes={['100px', '100px', '100px']} />}
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
              autoProposeFirstReply={shouldAutoProposeFirstReply && isThisIsLast}
              onSendProposedAnswer={onSendProposedAnswer}
              isLocked={isLocked}
            />
          );
        })}

        {gameWords?.wordsUserToDescribe && (
          <Stack
            sx={{
              width: 'calc(100% - 10px)',
              marginLeft: '5px',
              border: '3px solid #19B4F5',
              borderRadius: '10px',
              padding: '15px',
              boxSizing: 'border-box',
              position: 'sticky',
              bottom: '30px',
              backgroundColor: '#0A121E',
            }}
          >
            <AliasGamePanel gameWords={gameWords} conversation={conversation} />
          </Stack>
        )}
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
  autoProposeFirstReply = false,
  onSendProposedAnswer,
  isLocked = false,
}: {
  message: ConversationMessage;
  isAiSpeaking?: boolean;
  voice: AiVoice;
  isLastMessage: boolean;
  autoProposeFirstReply?: boolean;
  onSendProposedAnswer?: (text: string) => void;
  isLocked?: boolean;
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
    try {
      if (translatedText) {
        setTranslatedText('');
      } else {
        const result = await translator.translateText({
          text: message?.text || '',
        });
        const trimmed = result.trim();
        if (trimmed) {
          setTranslatedText('\n' + trimmed);
        }
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const text = translatedText || '\n' + (message.text || '').trim();
  const isAbleToGenerateHelpAnswer = message.isBot && isLastMessage;

  const conversationAnalysis = useConversationsAnalysis();

  const [proposedAnswer, setProposedAnswer] = useState<string | null>(null);
  const [proposedAnswerTranslation, setProposedAnswerTranslation] = useState<string | null>(null);
  const [isProposedAnswerLoading, setIsProposedAnswerLoading] = useState(false);
  const [didAutoProposeFail, setDidAutoProposeFail] = useState(false);
  const [isSendingProposedAnswer, setIsSendingProposedAnswer] = useState(false);
  const autoProposeStartedForId = useRef<string | null>(null);
  const didSendProposedAnswer = useRef(false);

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
    try {
      const nextAnswer = await conversationAnalysis.generateNextUserMessage();
      const trimmed = String(nextAnswer || '').trim();
      if (!trimmed || trimmed.startsWith('Error.')) {
        setDidAutoProposeFail(true);
        return false;
      }
      const translatedAnswer =
        translator.isTranslateAvailable && trimmed
          ? await translator.translateText({
              text: trimmed,
            })
          : '';

      setProposedAnswer('\n' + trimmed);
      setProposedAnswerTranslation(translatedAnswer ? '\n' + translatedAnswer.trim() : null);
      setDidAutoProposeFail(false);
      scrollToBottom();
      return true;
    } finally {
      setIsProposedAnswerLoading(false);
    }
  };

  useEffect(() => {
    if (!autoProposeFirstReply || isAiSpeaking || !message.isBot) return;
    if (!(message.text || '').trim()) return;
    if (autoProposeStartedForId.current === message.id) return;
    autoProposeStartedForId.current = message.id;
    void generateProposedAnswer();
  }, [autoProposeFirstReply, isAiSpeaking, message.id, message.isBot, message.text]);

  const sendProposedAnswer = () => {
    const text = (proposedAnswer || '').trim();
    if (!text || !onSendProposedAnswer || isLocked || didSendProposedAnswer.current) return;
    didSendProposedAnswer.current = true;
    setIsSendingProposedAnswer(true);
    onSendProposedAnswer(text);
  };

  const showWhatToSayButton =
    isAbleToGenerateHelpAnswer &&
    !proposedAnswer &&
    !isProposedAnswerLoading &&
    (!autoProposeFirstReply || didAutoProposeFail);

  const isUserIsRecordingStart = isLastMessage && !message.isBot && message.text === ' ';
  const isMessageInProgress = isLastMessage && !message.isBot && message.isInProgress;

  return (
    <Stack
      key={message.id}
      sx={{
        padding: '3px 20px',
        boxSizing: 'border-box',
        color: '#e1e1e1',
        width: '100%',
        borderRadius: '8px',
        position: 'relative',
        //border: isBot ? '1px solid red' : 'none',
        minHeight: isBot ? '180px' : '40px',
        '@media (max-width: 600px)': {
          minHeight: isBot ? '280px' : '60px',
        },
      }}
    >
      {isMessageInProgress && (
        <Stack
          sx={{
            position: 'absolute',
            top: '-10px',
            left: 0,
            right: 0,
            bottom: 0,
            height: 'calc(100% + 20px)',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0)',
          }}
        >
          <LoadingShapes sizes={['100%']} containerHeight="100%" />
        </Stack>
      )}
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
        {isUserIsRecordingStart ? (
          <Stack
            sx={{
              padding: '6px 0 10px 0',
            }}
          >
            <LoadingShapes sizes={['30px']} />
          </Stack>
        ) : (
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
        )}
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
            <AudioPlayIcon text={text} />
          </Stack>

          {showWhatToSayButton && (
            <Button
              variant="text"
              disabled={isProposedAnswerLoading || proposedAnswer !== null}
              onClick={() => {
                void generateProposedAnswer();
              }}
              data-analytics="call-what-to-say"
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

      {(proposedAnswer || (autoProposeFirstReply && isProposedAnswerLoading)) && (
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
          {isProposedAnswerLoading && !proposedAnswer ? (
            <Loader size={'16px'} />
          ) : (
            <Stack
              sx={{
                gap: '5px',
                width: '100%',
              }}
            >
              <Stack
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px',
                }}
              >
                {onSendProposedAnswer ? (
                  <Button
                    variant="contained"
                    onClick={sendProposedAnswer}
                    color="info"
                    //disabled={isLocked || isSendingProposedAnswer}
                    data-analytics={QUIZ_TALK_SUGGESTED_REPLY_ANALYTICS_ID}
                    data-testid="quiz-talk-suggested-reply"
                    sx={{
                      textTransform: 'none',
                      textAlign: 'left',
                      lineHeight: 1.4,
                    }}
                  >
                    {(proposedAnswer || '').trim()}
                  </Button>
                ) : (
                  <Markdown>{proposedAnswer || ''}</Markdown>
                )}
                <AudioPlayIcon text={proposedAnswer || ''} />
              </Stack>
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
          )}
        </Stack>
      )}

      {translator.translateModal}
    </Stack>
  );
};
