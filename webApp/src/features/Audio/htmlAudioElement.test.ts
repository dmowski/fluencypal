/**
 * @jest-environment jsdom
 */

import {
  resetHtmlAudioElement,
  shouldRetryPlayOnFreshElement,
  startHtmlAudioPrimeFromGesture,
} from './htmlAudioElement';

describe('resetHtmlAudioElement', () => {
  it('pauses and rewinds without calling load() on an empty source', () => {
    const el = document.createElement('audio');
    const load = jest.spyOn(el, 'load');
    const pause = jest.spyOn(el, 'pause');

    resetHtmlAudioElement(el);

    expect(pause).toHaveBeenCalled();
    expect(load).not.toHaveBeenCalled();
    expect(el.getAttribute('src')).toBeNull();
  });
});

describe('shouldRetryPlayOnFreshElement', () => {
  it('retries iOS NotSupportedError from a reused media element', () => {
    const error = new Error('The operation is not supported.');
    error.name = 'NotSupportedError';
    expect(shouldRetryPlayOnFreshElement(error)).toBe(true);
  });

  it('does not retry user-gesture aborts', () => {
    const error = new Error('play() was interrupted');
    error.name = 'AbortError';
    expect(shouldRetryPlayOnFreshElement(error)).toBe(false);
  });
});

describe('startHtmlAudioPrimeFromGesture', () => {
  it('calls play() before the returned promise settles', async () => {
    const el = document.createElement('audio');
    let playCalled = false;
    const play = jest.spyOn(el, 'play').mockImplementation(() => {
      playCalled = true;
      return Promise.resolve();
    });
    const pause = jest.spyOn(el, 'pause').mockImplementation(() => {});

    const pending = startHtmlAudioPrimeFromGesture(el);
    expect(playCalled).toBe(true);

    await pending;

    expect(play).toHaveBeenCalledTimes(1);
    expect(pause).toHaveBeenCalled();
    expect(el.getAttribute('src')).toBeNull();
  });
});
