/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { WebCamButtons } from './WebCamButtons';

describe('WebCamButtons', () => {
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
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
      configurable: true,
      get: () => true,
    });
  });

  it('starts muted and plays the clip on unmute', () => {
    render(<WebCamButtons audioSrc="/call/marin/talk.mp3" />);

    const button = screen.getByTestId('webcam-mute-button');
    const audio = screen.getByTestId('webcam-preview-audio');

    expect(button).toHaveAttribute('aria-label', 'Unmute');
    expect(audio).toHaveAttribute('src', '/call/marin/talk.mp3');
    expect(play).not.toHaveBeenCalled();

    fireEvent.click(button);

    expect(play).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-label', 'Mute');
    expect(button).toHaveAttribute('data-analytics', 'webcam-mute');
  });

  it('pauses the clip when muted again', () => {
    render(<WebCamButtons audioSrc="/call/marin/talk.mp3" />);

    const button = screen.getByTestId('webcam-mute-button');
    fireEvent.click(button);
    fireEvent.click(button);

    expect(pause).toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-label', 'Unmute');
  });
});
