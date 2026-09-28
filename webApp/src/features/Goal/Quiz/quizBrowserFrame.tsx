import { ReactNode } from 'react';
import { expect } from 'vitest';
import { page } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';

export const QuizShotFrame = ({
  children,
  maxHeight,
}: {
  children: ReactNode;
  maxHeight?: number;
}) => (
  <BrowserAppShell>
    <div
      data-testid="shot"
      style={{
        width: '600px',
        background: 'rgba(10, 18, 30, 1)',
        maxHeight,
        overflow: maxHeight ? 'hidden' : undefined,
      }}
    >
      {children}
    </div>
  </BrowserAppShell>
);

export const expectQuizScreenshot = async (name: string) => {
  const shot = page.getByTestId('shot');
  await expect.element(shot).toBeVisible();
  await expect.element(shot).toMatchScreenshot(name);
};
