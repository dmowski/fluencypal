'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { useAutoCreatePendingNewsQuiz } from '../createNewsQuiz/useAutoCreatePendingNewsQuiz';
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
import { Check } from 'lucide-react';

export const QuizModal = () => {
  const { quizId, isOpen, closeQuiz } = useQuizModal();
  if (!isOpen || !quizId) return null;
  return <QuizModalContent quizId={quizId} onClose={closeQuiz} />;
};

const QuizModalContent = ({ quizId, onClose }: { quizId: string; onClose: () => void }) => {
  const { i18n } = useLingui();
  const { ensureNewsQuiz, isCreating } = useCreateNewsQuiz();
  const { isBootstrapping, bootstrapError, retryCreate, hasPendingCreate } =
    useAutoCreatePendingNewsQuiz(quizId, ensureNewsQuiz);
  const session = useQuizSession(quizId, onClose);

  const question = session.currentQuestion;
  console.log('question');
  console.log(JSON.stringify(question, null, 2));
  const questionId = question?.id ?? '';
  const answer = questionId ? session.progress?.answers[questionId] : undefined;
  const result = questionId ? session.progress?.questionResults[questionId] : undefined;
  const isSubmitted = Boolean(answer?.submittedAtIso);

  const handleSubmit = async () => {
    if (!questionId) return;
    await session.submitQuestion(questionId);
  };

  const canSubmit = (() => {
    if (!question || !answer || isSubmitted) return false;
    if (answer.payload.kind === 'multiple-choice') {
      return Boolean(answer.payload.selectedOptionId);
    }
    if (answer.payload.kind === 'fill-gap' && isFillGapQuestion(question)) {
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
          isRevealed={isSubmitted}
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
          isRevealed={isSubmitted}
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
          isRevealed={isSubmitted}
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
      const selections = answer?.payload.kind === 'fill-gap' ? answer.payload.selections : {};
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

  const isGenerating = isCreating || isBootstrapping || hasPendingCreate;
  const showBootstrapError =
    bootstrapError && !isGenerating && !session.isLoading && !session.record;
  const showMissingQuiz =
    !session.isLoading && !session.record && !isGenerating && !bootstrapError && !hasPendingCreate;

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
        {!session.isExamComplete && (
          <QuizModalHeader
            sectionTitle={session.sectionTitle}
            onBack={() => void session.goBack()}
          />
        )}

        {!session.isExamComplete &&
          session.totalQuestions > 0 &&
          session.currentQuestionNumber > 0 && (
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
          {isGenerating && (
            <Stack sx={{ gap: '20px', paddingTop: '40px' }} data-testid="quiz-modal-creating">
              <Typography variant="body2" sx={{ color: '#EBEBF599' }}>
                {i18n._('Creating your quiz... This usually takes about a minute.')}
              </Typography>
              <LoadingShapes sizes={['30px', '200px', '30px']} />
            </Stack>
          )}

          {session.isLoading && !isGenerating && (
            <Stack sx={{ gap: '20px', paddingTop: '40px' }} data-testid="quiz-modal-loading">
              <Typography variant="body2">{i18n._('Loading quiz...')}</Typography>
              <LoadingShapes sizes={['30px', '200px', '30px']} />
            </Stack>
          )}

          {showBootstrapError && (
            <Stack
              sx={{ gap: '16px', paddingTop: '40px' }}
              data-testid="quiz-modal-bootstrap-error"
            >
              <Typography variant="body1">{bootstrapError}</Typography>
              <Button variant="contained" color="info" onClick={retryCreate}>
                {i18n._('Try again')}
              </Button>
            </Stack>
          )}

          {showMissingQuiz && (
            <Stack sx={{ gap: '16px', paddingTop: '40px' }} data-testid="quiz-modal-missing">
              <Typography variant="body1">
                {i18n._('This quiz has not been generated yet. Open it from the news article.')}
              </Typography>
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
            !isGenerating &&
            session.record &&
            !session.isExamComplete &&
            question && (
              <Stack sx={{ gap: '16px', paddingTop: '8px' }}>
                {session.currentSection?.instructions &&
                  session.progress?.currentQuestionIndex === 0 && (
                    <Markdown variant="conversation">
                      {session.currentSection.instructions}
                    </Markdown>
                  )}
                {renderActivity()}

                <Stack
                  sx={{
                    paddingTop: '20px',
                  }}
                >
                  {!isSubmitted && (
                    <Button
                      variant="contained"
                      color="info"
                      disabled={!canSubmit || session.isEvaluatingVoice}
                      onClick={() => void handleSubmit()}
                      data-testid="quiz-submit-question"
                      sx={{ alignSelf: 'flex-start' }}
                      endIcon={<Check size={'16px'} />}
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
              </Stack>
            )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
