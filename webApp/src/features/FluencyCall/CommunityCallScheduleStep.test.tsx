/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { CommunityCallScheduleStep } from './CommunityCallScheduleStep';
import { FluencyCall } from './types';
import { useListedFluencyCalls, useFluencyCallRsvps } from './useFluencyCalls';

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: null,
    loading: false,
    isIdentified: false,
  }),
}));

jest.mock('./useFluencyCalls', () => ({
  useListedFluencyCalls: jest.fn(),
  useFluencyCallRsvps: jest.fn(),
}));

const useListedFluencyCallsMock = useListedFluencyCalls as jest.MockedFunction<
  typeof useListedFluencyCalls
>;
const useFluencyCallRsvpsMock = useFluencyCallRsvps as jest.MockedFunction<
  typeof useFluencyCallRsvps
>;

const call = (id: string, startsAtIso: string): FluencyCall => ({
  id,
  startsAtIso,
  link: 'https://meet.example.com/room',
  status: 'scheduled',
  createdAtIso: '2026-10-01T00:00:00.000Z',
  updatedAtIso: '2026-10-01T00:00:00.000Z',
  stoppedAtIso: null,
  languageCode: 'en',
});

describe('CommunityCallScheduleStep', () => {
  beforeEach(() => {
    useFluencyCallRsvpsMock.mockReturnValue({
      rsvps: [],
      joinCount: 1,
      isJoining: false,
      loading: false,
    });
  });

  it('makes each call the continue button', () => {
    useListedFluencyCallsMock.mockReturnValue({
      calls: [call('sat-21', '2026-10-10T21:00:00.000Z')],
      loading: false,
    });
    const onChoose = jest.fn();
    const onContinue = jest.fn();

    render(
      <I18nWrapper>
        <CommunityCallScheduleStep language="en" onChoose={onChoose} onContinue={onContinue} />
      </I18nWrapper>,
    );

    const row = screen.getByTestId('community-call-scheduled-sat-21');
    expect(row.tagName).toBe('BUTTON');
    expect(row).toHaveAttribute('data-analytics', 'community-call-calls-continue');
    expect(screen.queryByTestId('community-call-next')).not.toBeInTheDocument();

    fireEvent.click(row);
    expect(onChoose).toHaveBeenCalledWith('sat-21');
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('keeps Continue when the list is empty', () => {
    useListedFluencyCallsMock.mockReturnValue({ calls: [], loading: false });
    const onChoose = jest.fn();
    const onContinue = jest.fn();

    render(
      <I18nWrapper>
        <CommunityCallScheduleStep language="en" onChoose={onChoose} onContinue={onContinue} />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('community-call-no-calls')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('community-call-next'));
    expect(onContinue).toHaveBeenCalled();
    expect(onChoose).not.toHaveBeenCalled();
  });
});
