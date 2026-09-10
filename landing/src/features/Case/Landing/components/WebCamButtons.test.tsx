/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebCamButtons } from './WebCamButtons';
import { WebcamPreviewPlayer } from './WebcamPreviewPlayer';

describe('WebCamButtons', () => {
  it('shows Play by default and Pause while playing', () => {
    const onToggle = jest.fn();
    const { rerender } = render(<WebCamButtons isPlaying={false} onToggle={onToggle} />);

    const button = screen.getByTestId('webcam-play-button');
    expect(button).toHaveAttribute('aria-label', 'Play');

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(<WebCamButtons isPlaying={true} onToggle={onToggle} />);
    expect(button).toHaveAttribute('aria-label', 'Pause');
    expect(button).toHaveAttribute('data-analytics', 'webcam-pause');
  });
});

describe('WebcamPreviewPlayer', () => {
  const play = jest.fn().mockResolvedValue(undefined);
  const pause = jest.fn();

  beforeEach(() => {
    play.mockClear();
    pause.mockClear();
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: play,
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: pause,
    });
  });

  it('plays the talking clip and returns to sit when it ends', async () => {
    render(
      <WebcamPreviewPlayer
        idleVideoUrl="/call/marin/sit.webm"
        talkingVideoUrl="/call/marin/marin_talking.webm"
      />,
    );

    const idleVideo = screen.getByTestId('webcam-idle-video');
    const talkingVideo = screen.getByTestId('webcam-talking-video');
    const button = screen.getByTestId('webcam-play-button');

    expect(idleVideo).toHaveAttribute('src', '/call/marin/sit.webm');
    expect(talkingVideo).toHaveAttribute('src', '/call/marin/marin_talking.webm');
    expect(button).toHaveAttribute('aria-label', 'Play');

    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('aria-label', 'Pause'));
    expect(play).toHaveBeenCalled();

    fireEvent.click(button);
    expect(pause).toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-label', 'Play');

    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('aria-label', 'Pause'));
    fireEvent.ended(talkingVideo);
    expect(button).toHaveAttribute('aria-label', 'Play');
  });
});
