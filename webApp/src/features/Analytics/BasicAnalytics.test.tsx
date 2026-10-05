/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { isDev } from './isDev';
import { initGTag } from './initGTag';
import { BasicAnalytics } from './BasicAnalytics';

jest.mock('./isDev', () => ({
  isDev: jest.fn(() => false),
}));

jest.mock('./initGTag', () => ({
  initGTag: jest.fn(),
}));

const mockedIsDev = isDev as jest.MockedFunction<typeof isDev>;
const mockedInit = initGTag as jest.MockedFunction<typeof initGTag>;

describe('BasicAnalytics', () => {
  beforeEach(() => {
    mockedIsDev.mockReturnValue(false);
    mockedInit.mockClear();
  });

  it('loads the existing tag on a top-level page', () => {
    render(<BasicAnalytics />);
    expect(mockedInit).toHaveBeenCalledTimes(1);
  });

  it('does not load the tag on localhost', () => {
    mockedIsDev.mockReturnValue(true);
    render(<BasicAnalytics />);
    expect(mockedInit).not.toHaveBeenCalled();
  });
});
