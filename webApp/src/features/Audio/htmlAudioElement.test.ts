/**
 * @jest-environment jsdom
 */

import {
  assignHtmlAudioSource,
  ensureHtmlAudioElementHasSource,
  isUnsupportedSourcePlayError,
  resetHtmlAudioElement,
  SILENT_WAV_DATA_URI,
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

describe('ensureHtmlAudioElementHasSource', () => {
  it('sets a decodable src before Web Audio wraps an empty element', () => {
    const el = document.createElement('audio');

    ensureHtmlAudioElementHasSource(el);

    expect(el.getAttribute('src')).toBe(SILENT_WAV_DATA_URI);
  });

  it('does not replace a source that is already set', () => {
    const el = document.createElement('audio');
    el.src = '/api/ttsStream?cache=true';

    ensureHtmlAudioElementHasSource(el);

    expect(el.getAttribute('src')).toBe('/api/ttsStream?cache=true');
  });
});

describe('assignHtmlAudioSource', () => {
  it('loads the new URL so WebKit drops a previous unsupported-source error', () => {
    const el = document.createElement('audio');
    const load = jest.spyOn(el, 'load');

    assignHtmlAudioSource(el, '/api/ttsStream?cache=true');

    expect(el.getAttribute('src')).toBe('/api/ttsStream?cache=true');
    expect(load).toHaveBeenCalled();
  });
});

describe('isUnsupportedSourcePlayError', () => {
  it('retries iOS NotSupportedError from a reused media element', () => {
    const error = new Error('The operation is not supported.');
    error.name = 'NotSupportedError';
    expect(isUnsupportedSourcePlayError(error)).toBe(true);
  });

  it('does not retry user-gesture aborts', () => {
    const error = new Error('play() was interrupted');
    error.name = 'AbortError';
    expect(isUnsupportedSourcePlayError(error)).toBe(false);
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
    expect(el.getAttribute('src')).toBe(SILENT_WAV_DATA_URI);
  });
});
