import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { FluencyCallRequestForm, FluencyCallRequestFormProps } from './FluencyCallRequestForm';

const baseProps: FluencyCallRequestFormProps = {
  date: '2026-10-03',
  time: '18:00',
  languageCode: 'en',
  previewLabel: 'Saturday, 3 Oct, 18:00',
  error: '',
  isSending: false,
  isSent: false,
  sentLabel: '',
  now: new Date(2026, 9, 1, 12, 0, 0, 0),
  onDateChange: () => {},
  onTimeChange: () => {},
  onLanguageChange: () => {},
  onSubmit: () => {},
  onDone: () => {},
};

function renderForm(overrides: Partial<FluencyCallRequestFormProps> = {}) {
  return render(
    <BrowserAppShell>
      <div
        data-testid="fluency-call-shot"
        style={{ width: 500, background: 'rgb(28, 30, 36)', padding: 24 }}
      >
        <FluencyCallRequestForm {...baseProps} {...overrides} />
      </div>
    </BrowserAppShell>,
  );
}

test('request form shows the local time before sending', async () => {
  await renderForm();

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('request-form');
});

test('after sending, the form says the request is on its way', async () => {
  await renderForm({ isSent: true, sentLabel: 'Saturday, 3 Oct, 18:00' });

  await expect
    .element(page.getByTestId('fluency-call-shot'))
    .toMatchScreenshot('request-form-sent');
});

test('the language selector reports a different practice language', async () => {
  const onLanguageChange = vi.fn();
  await renderForm({ onLanguageChange });

  await userEvent.click(page.getByTestId('fluency-call-request-language'));
  await userEvent.click(page.getByRole('option', { name: /Español/ }));

  expect(onLanguageChange).toHaveBeenCalledWith('es');
});

test('submit uses the chosen date and time', async () => {
  const onSubmit = vi.fn();
  await renderForm({ onSubmit });

  await userEvent.click(page.getByTestId('fluency-call-request-submit'));
  expect(onSubmit).toHaveBeenCalledTimes(1);
});
