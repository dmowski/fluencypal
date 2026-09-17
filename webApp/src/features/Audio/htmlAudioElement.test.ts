/**
 * @jest-environment jsdom
 */

import { resetHtmlAudioElement, shouldRetryPlayOnFreshElement } from './htmlAudioElement';

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
