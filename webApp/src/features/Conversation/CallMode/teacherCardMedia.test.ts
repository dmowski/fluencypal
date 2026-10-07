import { shouldForceTeacherCardPhoto } from './teacherCardMedia';

const iphoneSafari =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';

describe('shouldForceTeacherCardPhoto', () => {
  it('uses photos on iPhone, including the Twitter in-app browser that looks like Safari', () => {
    expect(shouldForceTeacherCardPhoto({ userAgent: iphoneSafari })).toBe(true);
    expect(
      shouldForceTeacherCardPhoto({
        userAgent: `${iphoneSafari} Twitter for iPhone`,
      }),
    ).toBe(true);
  });

  it('uses photos on iPad, including desktop-mode iPad', () => {
    expect(
      shouldForceTeacherCardPhoto({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X)' }),
    ).toBe(true);
    expect(
      shouldForceTeacherCardPhoto({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      }),
    ).toBe(true);
  });

  it('keeps video on desktop browsers that can play webm', () => {
    expect(
      shouldForceTeacherCardPhoto({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      }),
    ).toBe(false);
  });
});
