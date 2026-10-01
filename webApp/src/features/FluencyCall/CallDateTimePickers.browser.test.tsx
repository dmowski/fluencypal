import React, { useState } from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { CallTimePicker } from './CallDateTimePickers';

const now = new Date(2026, 9, 1, 12, 0, 0, 0);

function AdminTimePicker() {
  const [time, setTime] = useState('18:00');
  return (
    <BrowserAppShell>
      <div
        data-testid="fluency-call-shot"
        style={{ width: 420, background: 'rgb(10, 18, 30)', padding: 16 }}
      >
        <CallTimePicker date="2026-10-03" time={time} now={now} minuteStep={1} onChange={setTime} />
      </div>
    </BrowserAppShell>
  );
}

test('current hour stays open when the chosen minute is already past', async () => {
  function CurrentHourPicker() {
    const [time, setTime] = useState('22:00');
    return (
      <BrowserAppShell>
        <CallTimePicker
          date="2026-10-01"
          time={time}
          now={new Date(2026, 9, 1, 21, 30, 0, 0)}
          minuteStep={1}
          onChange={setTime}
        />
      </BrowserAppShell>
    );
  }

  await render(<CurrentHourPicker />);

  await expect.element(page.getByTestId('fluency-call-hour-20')).toBeDisabled();
  await expect.element(page.getByTestId('fluency-call-hour-21')).toBeEnabled();

  await userEvent.click(page.getByTestId('fluency-call-hour-21'));

  await expect
    .element(page.getByTestId('fluency-call-hour-21'))
    .toHaveAttribute('aria-pressed', 'true');
  await expect
    .element(page.getByTestId('fluency-call-minute-30'))
    .toHaveAttribute('aria-pressed', 'true');
  await expect.element(page.getByTestId('fluency-call-minute-00')).toBeDisabled();
});

test('admin time picker selects any minute', async () => {
  await render(<AdminTimePicker />);

  await expect.element(page.getByTestId('fluency-call-minute-00')).toBeVisible();
  await expect.element(page.getByTestId('fluency-call-minute-59')).toBeVisible();

  await userEvent.click(page.getByTestId('fluency-call-minute-07'));

  await expect
    .element(page.getByTestId('fluency-call-minute-07'))
    .toHaveAttribute('aria-pressed', 'true');
  await expect
    .element(page.getByTestId('fluency-call-shot'))
    .toMatchScreenshot('admin-minute-picker');
});
