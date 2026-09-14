/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { JustTalkHandoffScreen } from './JustTalkHandoffScreen';
import { ENABLE_MIC_JUST_TALK_ANALYTICS_ID } from './justTalkHandoff';

jest.mock('../Settings/useSettings', () => ({
  useSettings: () => ({
    userSettings: { teacherVoice: 'marin' },
  }),
}));

jest.mock('@/libs/mic', () => ({
  isMicrophoneDenied: jest.fn(async () => false),
}));

describe('JustTalkHandoffScreen', () => {
  it('keeps Enable microphone as a named CTA and has no skip control', async () => {
    const onEnableMic = jest.fn(async () => 'mic-denied' as const);

    render(
      <I18nWrapper>
        <JustTalkHandoffScreen onEnableMic={onEnableMic} isStarting={false} />
      </I18nWrapper>,
    );

    const button = screen.getByRole('button', { name: 'Enable microphone to start talking' });
    expect(button).toHaveAttribute('data-analytics', ENABLE_MIC_JUST_TALK_ANALYTICS_ID);
    expect(screen.queryByRole('button', { name: /not now|later|skip/i })).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(onEnableMic).toHaveBeenCalled();

    await waitFor(() => {
      expect(
        screen.getByText(/Microphone access was blocked/i),
      ).toBeInTheDocument();
    });
  });
});
