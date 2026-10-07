/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SelectTeacher } from './SelectTeacher';

jest.mock('@/features/Audio/useConversationAudio', () => ({
  useConversationAudio: () => ({
    isPlaying: false,
  }),
}));

jest.mock('@/features/Audio/AudioPlayIcon', () => ({
  AudioPlayIcon: () => null,
}));

const setNavigator = ({
  userAgent,
  maxTouchPoints = 0,
  platform = 'Linux',
}: {
  userAgent: string;
  maxTouchPoints?: number;
  platform?: string;
}) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'maxTouchPoints', {
    value: maxTouchPoints,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'platform', {
    value: platform,
    configurable: true,
  });
};

describe('SelectTeacher', () => {
  const originalCanPlayType = HTMLMediaElement.prototype.canPlayType;

  afterEach(() => {
    HTMLMediaElement.prototype.canPlayType = originalCanPlayType;
  });

  it('keeps iPhone teacher cards on photos even when WebM is reported as playable', async () => {
    setNavigator({
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
    });
    HTMLMediaElement.prototype.canPlayType = () => 'maybe';
    const onSelectVoice = jest.fn();

    render(
      <SelectTeacher selectedVoice={null} onSelectVoice={onSelectVoice} voiceSpeed="normal" />,
    );

    expect(document.querySelectorAll('video')).toHaveLength(0);
    expect(document.querySelectorAll('img').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'ash' }));
    expect(onSelectVoice).toHaveBeenCalledWith('ash');
    expect(document.querySelectorAll('video')).toHaveLength(0);
  });

  it('plays WebM on desktop when the browser can decode it', async () => {
    setNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
      platform: 'Win32',
    });
    HTMLMediaElement.prototype.canPlayType = () => 'maybe';

    render(
      <SelectTeacher selectedVoice={null} onSelectVoice={() => undefined} voiceSpeed="normal" />,
    );

    await waitFor(() => {
      expect(document.querySelectorAll('video').length).toBeGreaterThan(0);
    });
  });
});
