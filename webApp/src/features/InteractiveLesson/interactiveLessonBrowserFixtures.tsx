import { Button, Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { InteractiveLessonDashboardView } from './InteractiveLessonDashboardView';
import { LessonHistoryView } from './LessonHistoryView';
import { LessonPreparingView } from './LessonPreparingView';
import { LessonResultsView } from './LessonResultsView';
import { SpeechAnswerPanelView } from './SpeechAnswerPanelView';
import {
  FIXTURE_FINISHED_LESSON,
  FIXTURE_LESSON,
  FIXTURE_SPEECH_PART,
  noop,
} from './interactiveLessonFixtureData';
import { LessonPartState } from './types';

export function InteractiveLessonTestShell({
  children,
  testId,
  width = 720,
}: {
  children: ReactNode;
  testId: string;
  width?: number;
}) {
  return (
    <BrowserAppShell>
      <Stack
        data-testid={testId}
        sx={{
          width: `${width}px`,
          maxWidth: '100%',
          bgcolor: '#37373a',
          color: '#EBEBF5',
          p: 2,
          gap: 2,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Stack>
    </BrowserAppShell>
  );
}

export function InteractiveLessonDashboardFixture({ isDoneToday }: { isDoneToday: boolean }) {
  return (
    <BrowserAppShell>
      <Stack data-testid="interactive-lesson-dashboard-fixture" sx={{ width: '720px', p: 2 }}>
        <InteractiveLessonDashboardView
          title="Interactive Lesson"
          subTitle="Read, speak, and build a daily speaking habit."
          cardTitle={isDoneToday ? 'Past Simple' : 'Today’s lesson'}
          cardSubTitle="Talk about yesterday"
          historyButtonTitle="History"
          badge={isDoneToday ? 'Done today' : undefined}
          isDoneToday={isDoneToday}
          onOpen={noop}
          onHistoryClick={noop}
        />
      </Stack>
    </BrowserAppShell>
  );
}

export function LanguageSetupFixture() {
  return (
    <InteractiveLessonTestShell testId="interactive-lesson-language-fixture">
      <Stack sx={{ gap: '20px' }} data-testid="interactive-lesson-language-setup">
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Set native and target languages
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85 }}>
          This lesson needs two different languages: the one you already speak, and the one you want
          to practice.
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Native language
        </Typography>
        <Stack
          sx={{
            padding: '14px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          English
        </Stack>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Language to learn
        </Typography>
        <Stack
          sx={{
            padding: '14px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          English
        </Stack>
        <Button variant="contained" color="info" disabled sx={{ alignSelf: 'flex-start' }}>
          Continue
        </Button>
      </Stack>
    </InteractiveLessonTestShell>
  );
}

export function LessonPreparingFixture() {
  return (
    <InteractiveLessonTestShell testId="interactive-lesson-preparing-fixture">
      <LessonPreparingView />
    </InteractiveLessonTestShell>
  );
}

export function LessonModalFixture({ finished = false }: { finished?: boolean }) {
  const lesson = finished ? FIXTURE_FINISHED_LESSON : FIXTURE_LESSON;
  return (
    <InteractiveLessonTestShell testId="interactive-lesson-modal-fixture" width={800}>
      <Stack sx={{ gap: '24px', padding: '20px 5px' }}>
        <Stack>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {lesson.title}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8 }}>
            {lesson.subTitle}
          </Typography>
        </Stack>
        {lesson.parts.map((part, index) => (
          <Stack key={`${lesson.id}-${index}`} sx={{ gap: '12px' }}>
            {index > 0 && (
              <Stack sx={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.12)' }} />
            )}
            <Typography
              variant="caption"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}
            >
              {part.type === 'read' ? 'Read' : 'Speak'}
            </Typography>
            <Typography sx={{ fontSize: '20px', lineHeight: 1.5 }}>{part.contentMD}</Typography>
            {part.type === 'speech' && (
              <SpeechAnswerPanelView
                part={part}
                partIndex={index}
                isEvaluating={false}
                isRecording={false}
                isTranscribing={false}
                transcription={null}
                error=""
                visualizer={null}
                needMoreText={false}
                onToggleRecord={noop}
                onSubmit={noop}
                onClear={noop}
              />
            )}
          </Stack>
        ))}
        <Button variant="contained" color="info" disabled={finished} sx={{ alignSelf: 'flex-start' }}>
          I am done
        </Button>
        {finished && (
          <LessonResultsView
            results={lesson.lessonResults}
            languageCode="en"
            isGeneratingResults={false}
            isGeneratingNext={false}
            onNextLesson={noop}
            onFinish={noop}
          />
        )}
      </Stack>
    </InteractiveLessonTestShell>
  );
}

export function SpeechPanelFixture({
  state,
  part = FIXTURE_SPEECH_PART,
}: {
  state: 'idle' | 'recording' | 'ready' | 'thinking' | 'answered';
  part?: LessonPartState;
}) {
  const answeredPart: LessonPartState =
    state === 'answered'
      ? {
          ...part,
          userVoiceTranscript: 'Yesterday I walked in the park.',
          aiResultToUser: 'Correct. Natural word order.',
        }
      : part;

  return (
    <InteractiveLessonTestShell testId="interactive-lesson-speech-fixture">
      <SpeechAnswerPanelView
        part={answeredPart}
        partIndex={1}
        isEvaluating={state === 'thinking'}
        isRecording={state === 'recording'}
        isTranscribing={false}
        transcription={state === 'ready' ? 'Yesterday I walked in the park.' : null}
        error=""
        visualizer={
          state === 'recording' ? (
            <Stack
              sx={{
                height: '40px',
                width: '100%',
                borderRadius: '6px',
                background: 'linear-gradient(90deg, #3f9ff3 0%, #1f74be 50%, #3f9ff3 100%)',
              }}
            />
          ) : null
        }
        needMoreText={false}
        onToggleRecord={noop}
        onSubmit={noop}
        onClear={noop}
      />
    </InteractiveLessonTestShell>
  );
}

export function LessonResultsFixture() {
  return (
    <InteractiveLessonTestShell testId="interactive-lesson-results-fixture">
      <LessonResultsView
        results={FIXTURE_FINISHED_LESSON.lessonResults}
        languageCode="en"
        isGeneratingResults={false}
        isGeneratingNext={false}
        onNextLesson={noop}
        onFinish={noop}
      />
    </InteractiveLessonTestShell>
  );
}

export function LessonHistoryFixture() {
  return (
    <InteractiveLessonTestShell testId="interactive-lesson-history-fixture">
      <LessonHistoryView lessons={[FIXTURE_FINISHED_LESSON]} languageCode="en" />
    </InteractiveLessonTestShell>
  );
}
