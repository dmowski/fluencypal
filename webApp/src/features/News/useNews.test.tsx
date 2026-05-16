/** @jest-environment jsdom */
import { StrictMode } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';

import { NewsProvider, useNews } from './useNews';

const mockGetTodayNewsRequest = jest.fn();
const mockGetNewsByIdRequest = jest.fn();
const mockUseAuth = jest.fn();
const mockUseSettings = jest.fn();

jest.mock('@/app/api/news/getTodayNews/getTodayNewsRequest', () => ({
  getTodayNewsRequest: (...args: unknown[]) => mockGetTodayNewsRequest(...args),
}));

jest.mock('@/app/api/news/getNewsById/getNewsByIdRequest', () => ({
  getNewsByIdRequest: (...args: unknown[]) => mockGetNewsByIdRequest(...args),
}));

jest.mock('../Auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../Settings/useSettings', () => ({
  useSettings: () => mockUseSettings(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StrictMode>
    <NewsProvider>{children}</NewsProvider>
  </StrictMode>
);

describe('useNews', () => {
  beforeEach(() => {
    mockGetTodayNewsRequest.mockReset();
    mockGetNewsByIdRequest.mockReset();
    mockUseAuth.mockReset();
    mockUseSettings.mockReset();
    window.localStorage.clear();
    mockUseAuth.mockReturnValue({ getToken: async () => 'test-token' });
  });

  it('fetches today news once even when StrictMode double-mounts the provider', async () => {
    mockUseSettings.mockReturnValue({
      userSettings: { country: 'us', countryName: 'United States' },
    });
    mockGetTodayNewsRequest.mockResolvedValue({
      items: [{ id: 'n1', title: 'T', subTitle: '', imageUrl: '', dateIso: '', countryCode: 'us', topic: 'general' }],
    });

    const { result } = renderHook(() => useNews(), { wrapper });

    await waitFor(() => expect(result.current.items).not.toBeNull());

    expect(mockGetTodayNewsRequest).toHaveBeenCalledTimes(1);
    expect(mockGetTodayNewsRequest).toHaveBeenCalledWith(
      { countryCode: 'us', countryName: 'United States', topic: 'general' },
      'test-token',
    );
  });

  it('does not fetch when country is not yet available', () => {
    mockUseSettings.mockReturnValue({ userSettings: { country: null } });

    render(
      <NewsProvider>
        <div />
      </NewsProvider>,
    );

    expect(mockGetTodayNewsRequest).not.toHaveBeenCalled();
  });

  it('persists complexity and topic in localStorage', async () => {
    mockUseSettings.mockReturnValue({
      userSettings: { country: 'us', countryName: 'United States' },
    });
    mockGetTodayNewsRequest.mockResolvedValue({ items: [] });

    const { result } = renderHook(() => useNews(), { wrapper });

    act(() => {
      result.current.setComplexity('advance');
    });
    act(() => {
      result.current.setTopic('sports');
    });

    expect(JSON.parse(window.localStorage.getItem('news.settings.v1') || '{}')).toEqual({
      complexity: 'advance',
      topic: 'sports',
    });
  });

  it('caches getNewsById results in-memory', async () => {
    mockUseSettings.mockReturnValue({ userSettings: { country: null } });
    mockGetNewsByIdRequest.mockResolvedValue({
      item: { id: 'x', versions: { beginner: 'b', middle: 'm', advance: 'a' } },
    });

    const { result } = renderHook(() => useNews(), { wrapper });

    const first = await result.current.getNewsById('x');
    const second = await result.current.getNewsById('x');

    expect(first).toEqual(second);
    expect(mockGetNewsByIdRequest).toHaveBeenCalledTimes(1);
  });
});
