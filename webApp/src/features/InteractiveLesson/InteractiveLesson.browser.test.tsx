import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import {
  InteractiveLessonDashboardFixture,
  LanguageSetupFixture,
  LessonHistoryFixture,
  LessonModalFixture,
  LessonPreparingFixture,
  LessonResultsFixture,
  SpeechPanelFixture,
} from './interactiveLessonBrowserFixtures';

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockNextImage({
    src,
    alt,
    style,
  }: {
    src: string;
    alt: string;
    style?: React.CSSProperties;
  }) {
    return <img src={src} alt={alt} style={{ ...style, width: '100%', height: '100%', objectFit: 'cover' }} />;
  },
}));

vi.mock('@/features/Layout/useWindowSizes', () => ({
  useWindowSizes: () => ({
    topOffset: '0px',
    bottomOffset: '0px',
  }),
}));

vi.mock('@/features/News/NewsContentWithParagraphs', () => ({
  NewsContentWithParagraphs: ({ content }: { content: string }) => (
    <p data-testid="news-content-mock" style={{ fontSize: '20px', lineHeight: 1.5, margin: 0 }}>
      {content}
    </p>
  ),
}));

test('dashboard card – today’s lesson', async () => {
  await render(<InteractiveLessonDashboardFixture isDoneToday={false} />);

  await expect
    .element(page.getByTestId('interactive-lesson-dashboard-fixture'))
    .toMatchScreenshot('dashboard-idle');
});

test('dashboard card – done today', async () => {
  await render(<InteractiveLessonDashboardFixture isDoneToday={true} />);

  await expect
    .element(page.getByTestId('interactive-lesson-dashboard-fixture'))
    .toMatchScreenshot('dashboard-done');
});

test('language setup when native equals target', async () => {
  await render(<LanguageSetupFixture />);

  await expect
    .element(page.getByTestId('interactive-lesson-language-fixture'))
    .toMatchScreenshot('language-setup');
});

test('preparing lesson loader', async () => {
  await render(<LessonPreparingFixture />);

  await expect
    .element(page.getByTestId('interactive-lesson-preparing-fixture'))
    .toMatchScreenshot('preparing');
});

test('lesson modal – in progress', async () => {
  await render(<LessonModalFixture />);

  await expect
    .element(page.getByTestId('interactive-lesson-modal-fixture'))
    .toMatchScreenshot('modal-in-progress');
});

test('lesson modal – results', async () => {
  await render(<LessonModalFixture finished={true} />);

  await expect
    .element(page.getByTestId('interactive-lesson-modal-fixture'))
    .toMatchScreenshot('modal-results');
});

test('speech panel – idle', async () => {
  await render(<SpeechPanelFixture state="idle" />);

  await expect
    .element(page.getByTestId('interactive-lesson-speech-fixture'))
    .toMatchScreenshot('speech-idle');
});

test('speech panel – recording', async () => {
  await render(<SpeechPanelFixture state="recording" />);

  await expect
    .element(page.getByTestId('interactive-lesson-speech-fixture'))
    .toMatchScreenshot('speech-recording');
});

test('speech panel – recorded', async () => {
  await render(<SpeechPanelFixture state="ready" />);

  await expect
    .element(page.getByTestId('interactive-lesson-speech-fixture'))
    .toMatchScreenshot('speech-ready');
});

test('speech panel – thinking', async () => {
  await render(<SpeechPanelFixture state="thinking" />);

  await expect
    .element(page.getByTestId('interactive-lesson-speech-fixture'))
    .toMatchScreenshot('speech-thinking');
});

test('speech panel – answered', async () => {
  await render(<SpeechPanelFixture state="answered" />);

  await expect
    .element(page.getByTestId('interactive-lesson-speech-fixture'))
    .toMatchScreenshot('speech-answered');
});

test('results actions', async () => {
  await render(<LessonResultsFixture />);

  await expect
    .element(page.getByTestId('interactive-lesson-results-fixture'))
    .toMatchScreenshot('results-actions');
});

test('history list', async () => {
  await render(<LessonHistoryFixture />);

  await expect
    .element(page.getByTestId('interactive-lesson-history-fixture'))
    .toMatchScreenshot('history-list');
});
