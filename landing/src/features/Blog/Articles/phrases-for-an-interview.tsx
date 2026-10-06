import { getI18nInstance } from '@/appRouterI18n';
import { getAppUrlStart } from '@/features/Lang/getUrlStart';
import { SupportedLanguage } from '@/features/Lang/lang';
import { buttonStyle } from '@/features/Landing/landingSettings';
import { I18n } from '@lingui/core';
import { Box, Button, Stack, Typography } from '@mui/material';
import { JSX } from 'react';

const INTERVIEW_PRACTICE_HREF = 'practice?rolePlayId=job-interview';

type InterviewAnswer = {
  question: string;
  cue: string;
  answer: string;
};

const englishAnswers = (i18n: I18n): InterviewAnswer[] => [
  {
    question: 'Tell me about yourself.',
    cue: i18n._(
      'Start with your job, one result, and why you want this role. Keep it under one minute.',
    ),
    answer:
      'I am a project coordinator with four years of experience in customer support. In my last role I helped the team answer common questions faster. I want this job because I can do that for your customers.',
  },
  {
    question: 'Why do you want this job?',
    cue: i18n._('Name this job, not a generic compliment.'),
    answer:
      'I want this job because it uses my experience with customers, and I can help the team respond faster.',
  },
  {
    question: 'What are your strengths?',
    cue: i18n._('Pick two skills from the job description, then one example.'),
    answer:
      'My strengths are staying calm with customers and explaining the next step clearly. Last year I trained two new teammates on our most common questions.',
  },
  {
    question: 'What is your weakness?',
    cue: i18n._('Name a real habit and what you already do about it.'),
    answer:
      'I used to take on too many tasks at once. I now write the top three for the day before I start.',
  },
  {
    question: 'Why should we hire you?',
    cue: i18n._('Give one skill and one proof.'),
    answer:
      'I can explain a problem in simple English, and I have already helped a team answer customers faster. I am ready to do that here.',
  },
  {
    question: 'Tell me about a challenge you handled.',
    cue: i18n._('Use a short story: what happened, what you did, and what changed.'),
    answer:
      'A customer waited two days for an answer. I found the missing update, wrote to them the same day, and we started sharing those updates with the whole team.',
  },
  {
    question: 'Where do you see yourself in five years?',
    cue: i18n._('Talk about the work you want next, not a fantasy title.'),
    answer: 'In five years I want to lead a small team and still talk to customers myself.',
  },
  {
    question: 'Why are you leaving your current job?',
    cue: i18n._('Talk about what you want next, not what you dislike.'),
    answer:
      'I learned a lot in my current job. I am leaving because I want more responsibility with customers, and this role offers that.',
  },
  {
    question: 'How do you work with other people?',
    cue: i18n._('Give one example of working with someone else.'),
    answer:
      'I ask a teammate what they need, then I say what I can finish today. On the last project we split the questions and finished a day early.',
  },
  {
    question: 'Do you have any questions for us?',
    cue: i18n._('Ask about the work, the team, or how they know someone is doing well.'),
    answer: 'Could you tell me what the first month looks like for someone in this role?',
  },
];

export const getInterviewInEnglishFaq = (i18n: I18n) =>
  englishAnswers(i18n).map((item) => ({
    question: item.question,
    answer: `${item.cue} “${item.answer}”`,
  }));

export const PhrasesArticles = ({ lang }: { lang: SupportedLanguage }): JSX.Element => {
  const i18n = getI18nInstance(lang);
  const answers = englishAnswers(i18n);
  const practiceHref = `${getAppUrlStart(lang)}${INTERVIEW_PRACTICE_HREF}`;

  return (
    <Stack sx={{ width: '100%', gap: '16px' }}>
      <Typography variant="h2">{i18n._('Questions and sample answers')}</Typography>
      <Typography>
        {i18n._(
          'Ten questions from a real English job interview. Read one answer, then practice saying it.',
        )}
      </Typography>
      {answers.map((item, index) => {
        const ctaId = index === 0 ? 'blog-interview-cta' : `blog-interview-answer-${index + 1}`;
        return (
          <Box
            key={item.question}
            sx={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(43, 35, 88, 0.15)',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <Typography
              component="h3"
              lang="en"
              dir="ltr"
              sx={{ fontSize: '1.15rem', fontWeight: 700 }}
            >
              {index + 1}. {item.question}
            </Typography>
            <Typography sx={{ color: '#444' }}>{item.cue}</Typography>
            <Typography
              lang="en"
              dir="ltr"
              sx={{
                color: '#222',
                backgroundColor: 'rgba(43, 35, 88, 0.06)',
                borderRadius: '12px',
                padding: '14px 16px',
              }}
            >
              “{item.answer}”
            </Typography>
            <Button
              href={practiceHref}
              id={ctaId}
              data-analytics={ctaId}
              variant="contained"
              sx={{
                ...buttonStyle,
                alignSelf: 'flex-start',
                height: '3rem',
              }}
            >
              {i18n._('Practice this answer')}
            </Button>
          </Box>
        );
      })}
    </Stack>
  );
};
