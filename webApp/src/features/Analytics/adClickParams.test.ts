import { adClickUrl, captureAdClick, type AdClickStore } from './adClickParams';

const memoryStore = (): AdClickStore => {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

describe('adClickParams', () => {
  it('remembers a click id and puts it back after navigation drops it', () => {
    const store = memoryStore();
    captureAdClick('https://app.fluencypal.com/demo?gclid=click-1&gbraid=braid-1', store);
    captureAdClick('https://app.fluencypal.com/practice', store);

    expect(adClickUrl('https://app.fluencypal.com/practice?plan-id=9', store)).toBe(
      'https://app.fluencypal.com/practice?plan-id=9&gclid=click-1&gbraid=braid-1',
    );
  });

  it('does not replace a click id already on the page', () => {
    const store = memoryStore();
    captureAdClick('https://app.fluencypal.com/demo?gclid=click-1', store);

    expect(adClickUrl('https://app.fluencypal.com/demo?gclid=click-1', store)).toBeNull();
  });

  it('ignores a stored value that is not click ids', () => {
    const store = memoryStore();
    store.setItem('fp_ad_click', '{');

    expect(adClickUrl('https://app.fluencypal.com/demo', store)).toBeNull();
  });
});
