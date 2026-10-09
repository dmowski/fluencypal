/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { confirmGtag } from './confirmGtag';
import { isDev } from './isDev';
import { initGTag } from './initGTag';
import { BasicAnalytics } from './BasicAnalytics';

jest.mock('./isDev', () => ({
  isDev: jest.fn(() => false),
}));

jest.mock('./initGTag', () => ({
  initGTag: jest.fn(),
}));

jest.mock('./confirmGtag', () => ({
  confirmGtag: jest.fn(() => Promise.resolve()),
}));

const mockedIsDev = isDev as jest.MockedFunction<typeof isDev>;
const mockedInit = initGTag as jest.MockedFunction<typeof initGTag>;
const mockedConfirm = confirmGtag as jest.MockedFunction<typeof confirmGtag>;

describe('BasicAnalytics', () => {
  beforeEach(() => {
    mockedIsDev.mockReturnValue(false);
    mockedInit.mockClear();
    mockedConfirm.mockClear();
    window.history.replaceState({}, '', '/practice');
  });

  it('loads the existing tag on a top-level page', () => {
    render(<BasicAnalytics />);
    expect(mockedInit).toHaveBeenCalledTimes(1);
  });

  it('does not load the tag on localhost', () => {
    mockedIsDev.mockReturnValue(true);
    render(<BasicAnalytics />);
    expect(mockedInit).not.toHaveBeenCalled();
    expect(mockedConfirm).not.toHaveBeenCalled();
  });

  it('sends the checkout conversion again when Stripe returns a paid session', () => {
    window.history.replaceState({}, '', '/practice?paymentSuccess=true');
    render(<BasicAnalytics />);
    expect(mockedConfirm).toHaveBeenCalledTimes(1);
  });
});
