'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useEffect, useRef, useState } from 'react';
import { useCorrections } from '../Corrections/useCorrections';
import { useTranslate } from '../Translation/useTranslate';
import { ProcessHeader } from './ProcessUserInput/ProcessHeader';
import { CorrectionDescription } from './ProcessUserInput/CorrectionDescription';
import { UserMessageSection } from './ProcessUserInput/UserMessageSection';
import { CorrectedMessageSection } from './ProcessUserInput/CorrectedMessageSection';
import { CorrectedActions } from './ProcessUserInput/CorrectedActions';

export const ProcessUserInput = ({
  isTranscribing,
  userMessage,
  setIsAnalyzing,
  setIsNeedCorrection,
  previousBotMessage,
}: {
  isTranscribing: boolean;
  userMessage: string;
  setIsAnalyzing: (value: boolean) => void;
  setIsNeedCorrection: (value: boolean) => void;
  previousBotMessage: string;
  isRecording: boolean;
}) => {
  const { i18n } = useLingui();
  const [isNeedToShowCorrection, setIsNeedToShowCorrection] = useState<boolean>(false);

  const messageAnalyzing = useRef('');
  const translator = useTranslate();

  const [isAnalyzingMessageWithAi, setIsAnalyzingMessageWithAi] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const [correctedMessage, setCorrectedMessage] = useState<string | null>(null);
  const corrections = useCorrections();
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);

  const [isShowFullContent, setIsShowFullContent] = useState(false);
  const [rate, setRate] = useState<number | null>(null);

  const setIsAnalyzingMessage = (value: boolean) => {
    setIsAnalyzingMessageWithAi(value);
    setIsAnalyzing(value);
  };

  const setIsCorrection = (value: boolean) => {
    setIsNeedCorrection(value);
    setIsNeedToShowCorrection(value);
  };

  const analyzeUserInput = async (usersNewMessage: string) => {
    messageAnalyzing.current = usersNewMessage;
    setIsAnalyzingError(false);

    setIsAnalyzingMessage(true);
    setIsCorrection(false);
    setDescription(null);
    setCorrectedMessage(null);
    setRate(null);

    try {
      const userMessage = usersNewMessage;

      const { sourceMessage, correctedMessage, description, rate } =
        await corrections.analyzeUserMessage({
          previousBotMessage,
          message: userMessage,
          conversationId: 'chat',
        });
      if (usersNewMessage !== sourceMessage) {
        return;
      }

      const isBad =
        !!description &&
        !!correctedMessage?.trim() &&
        correctedMessage.toLowerCase().trim() !== sourceMessage.toLowerCase().trim();
      setIsCorrection(isBad);
      setRate(rate);

      setCorrectedMessage(isBad ? correctedMessage || null : null);
      setDescription(isBad ? description || null : null);
      setIsAnalyzingMessage(false);
    } catch (error) {
      console.error('Error during analyzing message', error);
      setIsAnalyzingError(true);
      setIsAnalyzingMessage(false);
      throw error;
    }
  };

  useEffect(() => {
    const isEmpty = userMessage.trim().length === 0;
    if (!isEmpty) {
      analyzeUserInput(userMessage);
    } else {
      setIsAnalyzingMessage(false);
      setIsCorrection(false);
      setDescription(null);
      setCorrectedMessage(null);
    }
  }, [userMessage]);

  const isAnalyzingResponse = isAnalyzingMessageWithAi || isTranscribing;

  const limitMessages = 120;
  const messagesFontSize = userMessage.length < 320 ? '1.1rem' : '0.9rem';

  const [isTranslatingCorrectedMessage, setIsTranslatingCorrectedMessage] = useState(false);
  const [translatedCorrectedMessage, setTranslatedCorrectedMessage] = useState<string | null>(null);

  const onTranslateCorrectedMessage = async () => {
    if (!correctedMessage) return;
    if (translatedCorrectedMessage) {
      setTranslatedCorrectedMessage(null);
      return;
    }
    setIsTranslatingCorrectedMessage(true);
    const translated = await translator.translateText({
      text: correctedMessage || '',
    });
    setTranslatedCorrectedMessage(translated);
    setIsTranslatingCorrectedMessage(false);
  };

  const descriptionContent = description || '';
  const yourMessageLabel = i18n._('Your Message');
  const correctedLabel = i18n._('Corrected');
  const transcribingLabel = i18n._('Transcribing...');
  const analyzingLabel = i18n._('Analyzing...');
  const showMoreLabel = i18n._('Show more');
  const showLessLabel = i18n._('Show less');

  return (
    <Stack
      sx={{
        width: '100%',
      }}
    >
      <Stack
        sx={{
          alignItems: 'flex-start',
          gap: '15px',
        }}
      >
        {isAnalyzingError && (
          <Typography color="error">
            {i18n._('An error occurred while analyzing the message. Please try again.')}
          </Typography>
        )}

        <ProcessHeader
          state={isAnalyzingResponse ? 'loading' : isNeedToShowCorrection ? 'incorrect' : 'correct'}
          rate={rate}
        />

        {isNeedToShowCorrection && descriptionContent && (
          <CorrectionDescription
            content={descriptionContent}
            limit={limitMessages}
            isShowFullContent={isShowFullContent}
            onToggleShowFullContent={() => setIsShowFullContent(!isShowFullContent)}
            showMoreLabel={showMoreLabel}
            showLessLabel={showLessLabel}
          />
        )}
        <Stack
          sx={{
            gap: '0px',
            paddingBottom: '10px',
          }}
        >
          <UserMessageSection
            label={yourMessageLabel}
            message={userMessage}
            isTranscribing={isTranscribing}
            fontSize={messagesFontSize}
            transcribingLabel={transcribingLabel}
          />

          {(isNeedToShowCorrection || isAnalyzingResponse) && (
            <CorrectedMessageSection
              label={correctedLabel}
              isTranscribing={isTranscribing}
              isAnalyzing={isAnalyzingResponse}
              translatedCorrectedMessage={translatedCorrectedMessage}
              correctedMessage={correctedMessage}
              userMessage={userMessage}
              messagesFontSize={messagesFontSize}
              transcribingLabel={transcribingLabel}
              analyzingLabel={analyzingLabel}
            />
          )}

          {!isTranscribing && !isAnalyzingResponse && !!correctedMessage && (
            <CorrectedActions
              correctedMessage={correctedMessage}
              onTranslate={onTranslateCorrectedMessage}
              isTranslating={isTranslatingCorrectedMessage}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
