'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { isStateExamQuiz, QuizDocument } from '../types';
import { Play, X } from 'lucide-react';

export const ExamWelcomeScreen = ({
  quiz,
  onStart,
  onClose,
}: {
  quiz: QuizDocument;
  onStart: () => void;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();
  const sectionSummary = quiz.sections
    .reduce<string[]>((labels, section) => {
      if (!labels.includes(section.title)) labels.push(section.title);
      return labels;
    }, [])
    .join(', ');
  const estimatedMinutes = quiz.meta.estimatedMinutes ?? 60;
  const isStateExam = isStateExamQuiz(quiz);

  return (
    <Stack sx={{ gap: '20px', padding: '24px 5px 80px' }} data-testid="exam-welcome-screen">
      <Typography variant="h3" sx={{ fontWeight: 700 }}>
        {quiz.meta.title}
      </Typography>

      {quiz.meta.description && <Markdown variant="conversation">{quiz.meta.description}</Markdown>}

      <Stack sx={{ gap: '8px' }}>
        <Typography variant="body2" sx={{ color: '#EBEBF599' }}>
          {i18n._('Estimated time: ~{minutes} minutes', { minutes: estimatedMinutes })}
        </Typography>
        {isStateExam && (
          <Typography variant="body2" sx={{ color: '#EBEBF599' }}>
            {i18n._(
              'This exam follows the official B1 format. You can pause between modules and continue later.',
            )}
          </Typography>
        )}
        {sectionSummary && (
          <Typography variant="body2" sx={{ color: '#EBEBF599' }}>
            {i18n._('Skills covered: {skills}', { skills: sectionSummary })}
          </Typography>
        )}
      </Stack>

      <Stack sx={{ flexDirection: 'row', gap: '12px', flexWrap: 'wrap', paddingTop: '8px' }}>
        <Button
          variant="contained"
          color="info"
          onClick={onStart}
          startIcon={<Play size={'16px'} />}
          data-testid="exam-welcome-start"
        >
          {i18n._('Start exam')}
        </Button>
        <Button variant="outlined" color="inherit" onClick={onClose} startIcon={<X size={'16px'} />}>
          {i18n._('Close')}
        </Button>
      </Stack>
    </Stack>
  );
};
