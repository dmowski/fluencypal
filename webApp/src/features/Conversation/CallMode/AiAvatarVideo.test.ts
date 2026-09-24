import { shouldUseAvatarPhoto } from './AiAvatarVideo';

describe('shouldUseAvatarPhoto', () => {
  it('stays on photos until webm support is known, including iOS where it is unsupported', () => {
    expect(shouldUseAvatarPhoto({ canPlayWebm: null, hasPhotos: true })).toBe(true);
    expect(shouldUseAvatarPhoto({ canPlayWebm: false, hasPhotos: true })).toBe(true);
  });

  it('uses video once the browser can play webm', () => {
    expect(shouldUseAvatarPhoto({ canPlayWebm: true, hasPhotos: true })).toBe(false);
  });

  it('keeps video when there is no photo to fall back to', () => {
    expect(shouldUseAvatarPhoto({ canPlayWebm: false, hasPhotos: false })).toBe(false);
  });
});
