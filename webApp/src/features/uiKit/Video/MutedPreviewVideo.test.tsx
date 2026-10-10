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

  it('unmutes from the beginning, then a second press restores the muted preview', () => {
    render(renderWithI18n(<MutedPreviewVideo src="/group_call/intro2.webm" />));

    const video = screen.getByTestId('muted-preview-video') as HTMLVideoElement;
    const button = screen.getByTestId('muted-preview-unmute');
    expect(video.muted).toBe(true);
    expect(video.controls).toBe(false);
    expect(video.loop).toBe(true);
    expect(button).toHaveAccessibleName('Unmute');
    expect(screen.getByTestId('muted-preview-muted-icon')).toBeInTheDocument();
    video.currentTime = 12;

    fireEvent.click(video);

    expect(video.muted).toBe(false);
    expect(video.currentTime).toBe(0);
    expect(video.controls).toBe(false);
    expect(video.loop).toBe(false);
    expect(button).toHaveAccessibleName('Mute');
    expect(screen.queryByTestId('muted-preview-muted-icon')).not.toBeInTheDocument();

    video.currentTime = 8;
    fireEvent.click(video);

    expect(video.muted).toBe(true);
    expect(video.currentTime).toBe(8);
    expect(video.controls).toBe(false);
    expect(video.loop).toBe(true);
    expect(button).toHaveAccessibleName('Unmute');
    expect(screen.getByTestId('muted-preview-muted-icon')).toBeInTheDocument();
  });
});
