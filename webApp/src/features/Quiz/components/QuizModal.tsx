'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { consumePendingNewsQuizCreate } from '../pendingNewsQuizCreate';
import { useCreateNewsQuiz } from '../createNewsQuiz/useCreateNewsQuiz';
import { useQuizModal } from '../useQuizModal';
import { useQuizSession } from '../session/useQuizSession';
import {
  FillGapAnswer,
  isDescribePictureVoiceQuestion,
  isFillGapQuestion,
  isListeningQuestion,
  isReadAndAnswerQuestion,
  isWordTranslationQuestion,
  MultipleChoiceAnswer,
  VoiceQuizAnswer,
} from '../types';
import { QuizModalHeader } from './QuizModalHeader';
import { QuestionFeedback } from './QuestionFeedback';
import { QuizResultsScreen } from './QuizResultsScreen';
import { WordTranslationActivity } from './activities/WordTranslationActivity';
import { FillGapActivity } from './activities/FillGapActivity';
import { ReadAndAnswerActivity } from './activities/ReadAndAnswerActivity';
import { ListeningActivity } from './activities/ListeningActivity';
import { DescribePictureVoiceActivity } from './activities/DescribePictureVoiceActivity';
import { QuizProgressBar } from './QuizProgressBar';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';

export const QuizModal = () => {
  const { quizId, isOpen, closeQuiz } = useQuizModal();
  if (!isOpen || !quizId) return null;
  return <QuizModalContent quizId={quizId} onClose={closeQuiz} />;
};

const QuizModalContent = ({ quizId, onClose }: { quizId: string; onClose: () => void }) => {
  const { i18n } = useLingui();
  const { ensureNewsQuiz, isCreating, createError } = useCreateNewsQuiz();
  const session = useQuizSession(quizId, onClose);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const question = session.currentQuestion;
  const questionId = question?.id ?? '';
  const answer = questionId ? session.progress?.answers[questionId] : undefined;
  const result = questionId ? session.progress?.questionResults[questionId] : undefined;
  const isSubmitted = Boolean(answer?.submittedAtIso);

  const bootstrapQuiz = async () => {
    const pending = consumePendingNewsQuizCreate(quizId);
    if (!pending) {
      setBootstrapError(i18n._('Quiz not found. Open it from the news article.'));
      return;
    }
    setIsBootstrapping(true);
    setBootstrapError(null);
    try {
      await ensureNewsQuiz(pending);
    } catch {
      setBootstrapError(createError || i18n._('Failed to generate quiz.'));
    } finally {
      setIsBootstrapping(false);
    }
  };

  const handleSubmit = async () => {
    if (!questionId) return;
    await session.submitQuestion(questionId);
  };

  const canSubmit = (() => {
    if (!question || !answer || isSubmitted) return false;
    if (answer.payload.kind === 'multiple-choice') {
      return Boolean(answer.payload.selectedOptionId);
    }
    if (
      answer.payload.kind === 'fill-gap' &&
      isFillGapQuestion(question)
    ) {
      const gapIds = Object.keys(question.gaps);
      const selections = answer.payload.selections;
      return gapIds.every((gapId) => Boolean(selections[gapId]));
    }
    if (answer.payload.kind === 'voice') {
      const words = answer.payload.transcription.trim().split(/\s+/).filter(Boolean);
      const minWords = isDescribePictureVoiceQuestion(question) ? (question.minWords ?? 10) : 1;
      return words.length >= minWords;
    }
    return false;
  })();

  const renderActivity = () => {
    if (!question) return null;

    if (isWordTranslationQuestion(question)) {
      const selected =
        answer?.payload.kind === 'multiple-choice' ? answer.payload.selectedOptionId : null;
      return (
        <WordTranslationActivity
          question={question}
          selectedOptionId={selected}
          disabled={isSubmitted}
          onSelect={(optionId) => {
            const payload: MultipleChoiceAnswer = {
              kind: 'multiple-choice',
              selectedOptionId: optionId,
            };
            void session.setAnswer(question.id, payload);
          }}
        />
      );
    }

    if (isReadAndAnswerQuestion(question)) {
      const selected =
        answer?.payload.kind === 'multiple-choice' ? answer.payload.selectedOptionId : null;
      return (
        <ReadAndAnswerActivity
          question={question}
          selectedOptionId={selected}
          disabled={isSubmitted}
          onSelect={(optionId) => {
            void session.setAnswer(question.id, {
              kind: 'multiple-choice',
              selectedOptionId: optionId,
            });
          }}
        />
      );
    }

    if (isListeningQuestion(question)) {
      const selected =
        answer?.payload.kind === 'multiple-choice' ? answer.payload.selectedOptionId : null;
      return (
        <ListeningActivity
          question={question}
          selectedOptionId={selected}
          disabled={isSubmitted}
          onSelect={(optionId) => {
            void session.setAnswer(question.id, {
              kind: 'multiple-choice',
              selectedOptionId: optionId,
            });
          }}
        />
      );
    }

    if (isFillGapQuestion(question)) {
      const selections =
        answer?.payload.kind === 'fill-gap' ? answer.payload.selections : {};
      return (
        <FillGapActivity
          question={question}
          selections={selections}
          disabled={isSubmitted}
          onSelectGap={(gapId, optionId) => {
            const nextSelections = { ...selections, [gapId]: optionId };
            const payload: FillGapAnswer = { kind: 'fill-gap', selections: nextSelections };
            void session.setAnswer(question.id, payload);
          }}
        />
      );
    }

    if (isDescribePictureVoiceQuestion(question)) {
      const transcription = answer?.payload.kind === 'voice' ? answer.payload.transcription : '';
      return (
        <DescribePictureVoiceActivity
          question={question}
          transcription={transcription}
          disabled={isSubmitted}
          onTranscriptionChange={(value) => {
            const payload: VoiceQuizAnswer = { kind: 'voice', transcription: value };
            void session.setAnswer(question.id, payload);
          }}
        />
      );
    }

    return null;
  };

  const showBootstrap =
    !session.isLoading && !session.record && !isCreating && !isBootstrapping;

  return (
    <CustomModal isOpen onClose={onClose} mobilePadding="0" desktopPadding="0" zIndex={1100}>
      <Stack
        sx={{
          backgroundColor: '#37373a',
          color: '#EBEBF5',
          width: '100%',
          height: '100%',
        }}
        data-testid="quiz-modal"
      >
        <QuizModalHeader sectionTitle={session.sectionTitle} onBack={() => void session.goBack()} />

        {!session.isExamComplete && session.totalQuestions > 0 && session.currentQuestionNumber > 0 && (
          <QuizProgressBar
            current={session.currentQuestionNumber}
            total={session.totalQuestions}
          />
        )}

        <Stack
          sx={{
            gap: '24px',
            padding: '0 15px 80px',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {(session.isLoading || isCreating || isBootstrapping) && (
            <Stack sx={{ gap: '20px', paddingTop: '40px' }} data-testid="quiz-modal-loading">
              <Typography variant="body2">{i18n._('Loading quiz...')}</Typography>
              <LoadingShapes sizes={['30px', '200px', '30px']} />
            </Stack>
          )}

          {showBootstrap && (
            <Stack sx={{ gap: '16px', paddingTop: '40px' }} data-testid="quiz-modal-bootstrap">
              <Typography variant="body1">
                {bootstrapError || i18n._('This quiz has not been generated yet.')}
              </Typography>
              <Button variant="contained" color="info" onClick={() => void bootstrapQuiz()}>
                {i18n._('Generate quiz')}
              </Button>
            </Stack>
          )}

          {session.isExamComplete && session.progress?.examResult && (
            <QuizResultsScreen
              examResult={session.progress.examResult}
              isRequestingFeedback={session.isRequestingFeedback}
              onRequestDetailedFeedback={() => void session.requestDetailedFeedback()}
              onRestart={() => void session.resetProgress()}
              onClose={onClose}
            />
          )}

          {!session.isLoading &&
            !isCreating &&
            !isBootstrapping &&
            session.record &&
            !session.isExamComplete &&
            question && (
              <Stack sx={{ gap: '16px', paddingTop: '8px' }}>
                {session.currentSection?.instructions &&
                  session.progress?.currentQuestionIndex === 0 && (
                    <Markdown variant="conversation">{session.currentSection.instructions}</Markdown>
                  )}
                {renderActivity()}

                {!isSubmitted && (
                  <Button
                    variant="contained"
                    color="info"
                    disabled={!canSubmit || session.isEvaluatingVoice}
                    onClick={() => void handleSubmit()}
                    data-testid="quiz-submit-question"
                    sx={{ alignSelf: 'flex-start', marginTop: '8px' }}
                  >
                    {session.isEvaluatingVoice ? i18n._('Evaluating...') : i18n._('Submit')}
                  </Button>
                )}

                {isSubmitted && result && (
                  <QuestionFeedback
                    result={result}
                    isExplaining={session.isExplaining}
                    onExplain={() => void session.explainAnswer(questionId)}
                    onNext={() => void session.goNext()}
                  />
                )}
              </Stack>
            )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
