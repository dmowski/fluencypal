import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { FluencyCallEmptyCard, FluencyCallEmptyCardProps } from './FluencyCallEmptyCard';

const baseProps: FluencyCallEmptyCardProps = {
  isMember: true,
  membershipReady: true,
  requestedAtLabel: null,
  onInitiateCall: () => {},
  onJoinMembership: () => {},
};

function renderCard(overrides: Partial<FluencyCallEmptyCardProps> = {}) {
  return render(
    <BrowserAppShell>
      <div
        data-testid="fluency-call-shot"
        style={{ width: 640, background: 'rgb(10, 18, 30)', padding: 16 }}
      >
        <FluencyCallEmptyCard {...baseProps} {...overrides} />
      </div>
    </BrowserAppShell>,
  );
}

test('no call offers initiate call', async () => {
  await renderCard();

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('no-call');
});

test('a sent request shows the local time and a reply note', async () => {
  await renderCard({ requestedAtLabel: 'Saturday, 3 Oct, 18:00' });

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('request-sent');
});

test('a non-member is asked to join instead of initiating', async () => {
  await renderCard({ isMember: false });

  await expect
    .element(page.getByTestId('fluency-call-shot'))
    .toMatchScreenshot('no-call-non-member');
});

test('initiate and change time notify the card', async () => {
  const onInitiateCall = vi.fn();
  const proposed = await renderCard({ onInitiateCall });
  await userEvent.click(page.getByTestId('fluency-call-initiate'));
  expect(onInitiateCall).toHaveBeenCalledTimes(1);

  proposed.unmount();
  await renderCard({ onInitiateCall, requestedAtLabel: 'Saturday, 3 Oct, 18:00' });
  await userEvent.click(page.getByTestId('fluency-call-change-time'));
  expect(onInitiateCall).toHaveBeenCalledTimes(2);
});
