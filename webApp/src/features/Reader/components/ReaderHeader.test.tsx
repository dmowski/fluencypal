/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { ReaderHeader } from './ReaderHeader';

const TITLE_TEXT = 'The Day the Second Sun Fell';
const SUBTITLE_TEXT = 'A quiet village, two suns in the sky, and the moment everything changed';
const TITLE_WIDTH_FACTOR = 10;
const SUBTITLE_WIDTH_FACTOR = 18;
const TITLE_FALLBACK_WIDTH_FACTOR = 12;
const SUBTITLE_FALLBACK_WIDTH_FACTOR = 22;

class ResizeObserverMock {
  observe = jest.fn();
  disconnect = jest.fn();

  constructor(public callback: ResizeObserverCallback) {}
}

describe('ReaderHeader', () => {
  const originalRequestAnimationFrame = global.requestAnimationFrame;
  const originalCancelAnimationFrame = global.cancelAnimationFrame;
  const originalResizeObserver = global.ResizeObserver;
  const originalFonts = document.fonts;
  const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
  const originalScrollWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollWidth');
  let currentTextBlockWidth = 900;

  beforeEach(() => {
    currentTextBlockWidth = 900;

    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof requestAnimationFrame;

    global.cancelAnimationFrame = jest.fn();
    global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

    jest.spyOn(window, 'getComputedStyle').mockImplementation((element: Element) => {
      const typedElement = element as HTMLElement;
      const baseFontFamily = typedElement.textContent?.trim()
        ? 'serif'
        : typedElement.style.fontFamily || 'Times New Roman';

      return {
        fontFamily: typedElement.style.fontFamily || baseFontFamily,
        fontStyle: typedElement.style.fontStyle || 'normal',
        fontWeight: typedElement.style.fontWeight || '400',
        fontStretch: typedElement.style.fontStretch || 'normal',
        fontVariant: typedElement.style.fontVariant || 'normal',
        letterSpacing: typedElement.style.letterSpacing || 'normal',
        wordSpacing: typedElement.style.wordSpacing || '0px',
        textTransform: typedElement.style.textTransform || 'none',
      } as CSSStyleDeclaration;
    });

    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: new Promise(() => {}) },
    });

    HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
      const fontSize = Number.parseFloat(this.style.fontSize || '16');
      const textContent = this.textContent?.trim() ?? '';
      const isMeasurementElement = this.getAttribute('aria-hidden') === 'true';
      const titleFactor =
        this.style.fontFamily === 'serif' ? TITLE_WIDTH_FACTOR : TITLE_FALLBACK_WIDTH_FACTOR;
      const subtitleFactor =
        this.style.fontFamily === 'serif' ? SUBTITLE_WIDTH_FACTOR : SUBTITLE_FALLBACK_WIDTH_FACTOR;

      if (textContent === TITLE_TEXT && isMeasurementElement) {
        return {
          width: fontSize * titleFactor,
          height: 64,
          top: 0,
          left: 0,
          right: fontSize * titleFactor,
          bottom: 64,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      }

      if (textContent === SUBTITLE_TEXT && isMeasurementElement) {
        return {
          width: fontSize * subtitleFactor,
          height: 36,
          top: 0,
          left: 0,
          right: fontSize * subtitleFactor,
          bottom: 36,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      }

      if (textContent === TITLE_TEXT || textContent === SUBTITLE_TEXT) {
        return {
          width: currentTextBlockWidth,
          height: textContent === TITLE_TEXT ? 64 : 36,
          top: 0,
          left: 0,
          right: currentTextBlockWidth,
          bottom: textContent === TITLE_TEXT ? 64 : 36,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      }

      if (textContent.includes(TITLE_TEXT) && textContent.includes(SUBTITLE_TEXT)) {
        return {
          width: currentTextBlockWidth,
          height: 100,
          top: 0,
          left: 0,
          right: currentTextBlockWidth,
          bottom: 100,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      }

      return {
        width: currentTextBlockWidth,
        height: 100,
        top: 0,
        left: 0,
        right: currentTextBlockWidth,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };
    };

    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get() {
        const fontSize = Number.parseFloat((this as HTMLElement).style.fontSize || '16');
        const textContent = this.textContent?.trim() ?? '';

        if (textContent === TITLE_TEXT) {
          return Math.max(fontSize * TITLE_WIDTH_FACTOR, currentTextBlockWidth);
        }

        if (textContent === SUBTITLE_TEXT) {
          return Math.max(fontSize * SUBTITLE_WIDTH_FACTOR, currentTextBlockWidth);
        }

        return currentTextBlockWidth;
      },
    });
  });

  afterEach(() => {
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
    global.ResizeObserver = originalResizeObserver;
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;

    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: originalFonts,
    });

    if (originalScrollWidth) {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', originalScrollWidth);
    }

    jest.restoreAllMocks();
  });

  it('keeps the default typography visible when the measured width is too small', async () => {
    currentTextBlockWidth = 3;

    render(
      <I18nWrapper>
        <ReaderHeader
          title={TITLE_TEXT}
          subtitle={SUBTITLE_TEXT}
          currentPage={1}
          totalPages={3}
          author="Story"
        />
      </I18nWrapper>,
    );

    const title = screen.getByText(TITLE_TEXT);
    const subtitle = screen.getByText(SUBTITLE_TEXT);

    await waitFor(() => {
      expect(title).toBeInTheDocument();
    });

    expect(title.style.fontSize).toBe('');
    expect(subtitle.style.fontSize).toBe('');
  });

  it('applies fitted sizes from the real measurement logic when width is available', async () => {
    currentTextBlockWidth = 900;

    render(
      <I18nWrapper>
        <ReaderHeader
          title={TITLE_TEXT}
          subtitle={SUBTITLE_TEXT}
          currentPage={1}
          totalPages={3}
          author="Story"
        />
      </I18nWrapper>,
    );

    await waitFor(() => {
      expect((screen.getByText(TITLE_TEXT) as HTMLElement).style.fontSize).toBe('89.75px');
      expect((screen.getByText(SUBTITLE_TEXT) as HTMLElement).style.fontSize).toBe('49.75px');
    });
  });
});
