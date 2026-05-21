/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { ReaderSettings } from '../model/types';
import { buildMeasuredParagraphWrapper, isFitInPage } from './isFitInPage';
import {
  READER_LIST_LEFT_PADDING_PX,
  READER_LIST_VERTICAL_MARGIN_PX,
} from './readerMarkdownBlockLayout';

const baseSettings: ReaderSettings = {
  language: 'en-US',
  selectedVoiceURI: null,
  translateToLanguage: null,
  fontSize: 20,
  lineHeight: 1.5,
  justifyText: false,
  translateOnHover: false,
  voiceOverSelectedText: false,
  contentWidth: 320,
  contentHeight: 200,
  paragraphGap: 12,
  columns: 1,
  columnGap: 40,
};

describe('isFitInPage', () => {
  it('returns true for empty paragraph list', () => {
    expect(isFitInPage({ paragraphs: [], settings: baseSettings })).toBe(true);
  });

  it('returns false when content width or height is zero', () => {
    expect(
      isFitInPage({
        paragraphs: [{ text: 'hello', sourceStartCharOffset: 0 }],
        settings: { ...baseSettings, contentWidth: 0 },
      }),
    ).toBe(false);
  });

  it('builds markdown list paragraphs inside ul/li with reader list padding', () => {
    const wrapper = buildMeasuredParagraphWrapper({
      paragraphText: '- **Finally, experiment.** Tell a joke.',
      sourceStartCharOffset: 0,
      settings: baseSettings,
    });

    const list = wrapper.querySelector('ul');
    expect(list).not.toBeNull();
    expect(list?.style.padding).toBe(`0px 0px 0px ${READER_LIST_LEFT_PADDING_PX}px`);
    expect(list?.style.margin).toBe(`${READER_LIST_VERTICAL_MARGIN_PX}px 0px`);
    expect(wrapper.querySelector('ul > li')).not.toBeNull();
    expect(wrapper.querySelector('p')).toBeNull();
  });

  it('builds plain paragraphs with a p element', () => {
    const wrapper = buildMeasuredParagraphWrapper({
      paragraphText: 'Finally, experiment. Tell a joke.',
      sourceStartCharOffset: 0,
      settings: baseSettings,
    });

    expect(wrapper.querySelector('p')).not.toBeNull();
    expect(wrapper.querySelector('ul')).toBeNull();
  });

  it('builds ordered list paragraphs inside ol/li', () => {
    const wrapper = buildMeasuredParagraphWrapper({
      paragraphText: '1. First item in ordered list.',
      sourceStartCharOffset: 0,
      settings: baseSettings,
    });

    expect(wrapper.querySelector('ol > li')).not.toBeNull();
    expect(wrapper.querySelector('ul')).toBeNull();
  });
});
