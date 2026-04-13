'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useEffect, useState } from 'react';
import { AnalyzeUserMessageOutput, useCorrections } from '../Corrections/useCorrections';
import { useTranslate } from '../Translation/useTranslate';
import { ProcessHeader } from './ProcessUserInput/ProcessHeader';
import { CorrectionDescription } from './ProcessUserInput/CorrectionDescription';
import { UserMessageSection } from './ProcessUserInput/UserMessageSection';
import { CorrectedMessageSection } from './ProcessUserInput/CorrectedMessageSection';
import { CorrectedActions } from './ProcessUserInput/CorrectedActions';

interface Result {
  analysis: AnalyzeUserMessageOutput | null;
  isNeedCorrection: boolean;
  error: string;
}

export const ProcessUserInput = ({
  isTranscribing,
  userMessage,
  previousBotMessage,
}: {
  isTranscribing: boolean;
  userMessage: string;
  previousBotMessage: string;
  isRecording: boolean;
}) => {
  const { i18n } = useLingui();
  const translator = useTranslate();
  const corrections = useCorrections();

  const [results, setResults] = useState<Record<string, Result | null>>({});

  const [isShowFullContent, setIsShowFullContent] = useState(false);

  const actualResult = results[userMessage];

  const analyzeUserInput = async (usersNewMessage: string) => {
    if (results[usersNewMessage]) {
      return;
    }

    try {
      const userMessage = usersNewMessage;

      const aiSummary = await corrections.analyzeUserMessage({
        previousBotMessage,
        message: userMessage,
        conversationId: 'chat',
      });

      const isBad =
        !!aiSummary.description &&
        !!aiSummary.correctedMessage?.trim() &&
        aiSummary.correctedMessage.toLowerCase().trim() !==
          aiSummary.sourceMessage.toLowerCase().trim();
      const result: Result = {
        analysis: aiSummary,
        isNeedCorrection: isBad,
        error: '',
      };
      setResults((prevResults) => ({
        ...prevResults,
        [usersNewMessage]: result,
      }));
    } catch (error) {
      console.error('Error during analyzing message', error);
      setResults((prevResults) => ({
        ...prevResults,
        [usersNewMessage]: {
          analysis: null,
          isNeedCorrection: false,
          error: 'Analysis error',
        },
      }));
    }
  };

  useEffect(() => {
    const isEmpty = userMessage.trim().length === 0;
    if (!isEmpty) {
      analyzeUserInput(userMessage);
    }
  }, [userMessage]);

  const limitMessages = 120;
  const messagesFontSize = userMessage.length < 320 ? '1.1rem' : '0.9rem';

  const [isTranslatingCorrectedMessage, setIsTranslatingCorrectedMessage] = useState(false);
  const [translatedCorrectedMessage, setTranslatedCorrectedMessage] = useState<string | null>(null);

  const onTranslateCorrectedMessage = async () => {
    if (!actualResult) return;
    if (translatedCorrectedMessage) {
      setTranslatedCorrectedMessage(null);
      return;
    }
    setIsTranslatingCorrectedMessage(true);
    const translated = await translator.translateText({
      text: actualResult.analysis?.correctedMessage || '',
    });
    setTranslatedCorrectedMessage(translated);
    setIsTranslatingCorrectedMessage(false);
  };

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
        {actualResult?.error && (
          <Typography color="error">
            {i18n._('An error occurred while analyzing the message. Please try again.')}
          </Typography>
        )}

        <ProcessHeader
          state={
            !actualResult ? 'loading' : actualResult.isNeedCorrection ? 'incorrect' : 'correct'
          }
          rate={actualResult?.analysis?.rate}
        />

        {actualResult?.analysis?.description && (
          <CorrectionDescription
            content={actualResult?.analysis?.description}
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

          {(actualResult?.isNeedCorrection || !actualResult) && (
            <CorrectedMessageSection
              label={correctedLabel}
              isTranscribing={isTranscribing}
              isAnalyzing={!actualResult}
              translatedCorrectedMessage={translatedCorrectedMessage}
              correctedMessage={actualResult?.analysis?.correctedMessage || ''}
              userMessage={userMessage}
              messagesFontSize={messagesFontSize}
              transcribingLabel={transcribingLabel}
              analyzingLabel={analyzingLabel}
            />
          )}

          {!isTranscribing && !!actualResult && (
            <CorrectedActions
              correctedMessage={actualResult.analysis?.correctedMessage || ''}
              onTranslate={onTranslateCorrectedMessage}
              isTranslating={isTranslatingCorrectedMessage}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
