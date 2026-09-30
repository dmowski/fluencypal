import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { QuizDailyQuestionStep } from './QuizDailyQuestionStep';
import { QuizShotFrame } from './quizBrowserFrame';

const chat = vi.hoisted(() => ({
  messages: [] as {
    senderId: string;
    content: string;
    parentMessageId: string;
    isDeleted?: boolean;
  }[],
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) =>
    React.createElement('img', { src, alt: alt || '' }),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'user-1',
    loading: false,
    isIdentified: false,
    userInfo: null,
  }),
}));

vi.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({
    loading: false,
    languageCode: 'en',
  }),
}));

vi.mock('@/features/Chat/useChat', () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => children,
  useChat: () => ({
    messages: chat.messages,
    loading: false,
  }),
}));

vi.mock('@/features/Chat/FlatChat', () => ({
  FlatChat: () => React.createElement('div', { 'data-testid': 'daily-question-composer' }),
}));

const renderStep = async (onContinue: () => void = () => undefined) => {
  await render(
    <QuizShotFrame>
      <QuizDailyQuestionStep
        languageCode="en"
        onContinue={onContinue}
        isStepLoading={false}
      />
    </QuizShotFrame>,
  );
};

test('continue stays disabled until they send an answer', async () => {
  chat.messages = [];
  await renderStep();

  await expect.element(page.getByText("Answer today's question")).toBeVisible();
  await expect.element(page.getByText('Send your answer to continue.')).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
});

test('continue works after their own answer is sent', async () => {
  chat.messages = [
    {
      senderId: 'someone-else',
      content: 'Not mine',
      parentMessageId: '',
    },
    {
      senderId: 'user-1',
      content: 'I would keep the memory.',
      parentMessageId: '',
    },
  ];
  const onContinue = vi.fn();
  await renderStep(onContinue);

  await expect.element(page.getByText('Send your answer to continue.')).not.toBeInTheDocument();
  const continueButton = page.getByRole('button', { name: 'Continue' });
  await expect.element(continueButton).toBeEnabled();
  await continueButton.click();
  expect(onContinue).toHaveBeenCalledOnce();
});
