/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderWithI18n } from '@/features/Alias/test-utils/i18nTestHelper';
import { MutedPreviewVideo } from './MutedPreviewVideo';

describe('MutedPreviewVideo', () => {
  beforeAll(() => {
    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => undefined;
  });

  it('plays muted, then restarts from the beginning with controls', () => {
    render(renderWithI18n(<MutedPreviewVideo src="/group_call/intro.webm" />));

    const video = screen.getByTestId('muted-preview-video') as HTMLVideoElement;
    expect(video.muted).toBe(true);
    expect(video.controls).toBe(false);
    expect(video.loop).toBe(true);
    video.currentTime = 12;

    fireEvent.click(screen.getByTestId('muted-preview-unmute'));

    expect(video.muted).toBe(false);
    expect(video.currentTime).toBe(0);
    expect(video.controls).toBe(true);
    expect(video.loop).toBe(false);
    expect(screen.queryByTestId('muted-preview-unmute')).not.toBeInTheDocument();
  });
});
