/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { RolePlayOpeningPreview } from './RolePlayOpeningPreview';

describe('RolePlayOpeningPreview', () => {
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

  it('shows the transcript without a Teacher label and plays the hosted clip', () => {
    render(
      <I18nWrapper>
        <RolePlayOpeningPreview
          text="Hello, I'm your AI partner for the Alias game."
          audioSrc="/audio/role-openings/alias-game.mp3"
        />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('roleplay-opening-preview')).toBeInTheDocument();
    expect(screen.queryByText('Teacher:')).not.toBeInTheDocument();
    expect(
      screen.getByText("Hello, I'm your AI partner for the Alias game."),
    ).toBeInTheDocument();
    expect(screen.getByTestId('roleplay-opening-audio')).toHaveAttribute(
      'src',
      '/audio/role-openings/alias-game.mp3',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Hear the first line' }));
    expect(play).toHaveBeenCalled();
  });
});
