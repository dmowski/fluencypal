/**
 * @jest-environment jsdom
 */

import { scrollToLangButton } from './scroll';

describe('scrollToLangButton', () => {
  it('scrolls with window.scrollTo instead of scrollIntoView', () => {
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'en');
    button.scrollIntoView = jest.fn();
    document.body.appendChild(button);
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

    scrollToLangButton('en');

    expect(button.scrollIntoView).not.toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalled();
  });
});