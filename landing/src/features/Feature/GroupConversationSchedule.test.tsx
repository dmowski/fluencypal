/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { renderWithI18n } from '@/features/Alias/test-utils/i18nTestHelper';
import {
  englishGroupCallOnboardingHref,
  groupCallChoiceHref,
  talkWithAlexHref,
} from './groupCallOnboardingHref';
import { GroupConversationJoinButton } from './GroupConversationJoinButton';
import { GroupConversationSchedule } from './GroupConversationSchedule';
import { resetEnglishGroupCallsCache } from './useEnglishGroupCalls';

const sooner = '2027-06-03T17:00:00.000Z';
const later = '2027-06-04T18:30:00.000Z';
const afterThat = '2027-06-05T12:00:00.000Z';
const href = englishGroupCallOnboardingHref('en');

const payload = {
  calls: [
    { id: 'later', startsAtIso: later, languageCode: 'en', joinCount: 2 },
    { id: 'sooner', startsAtIso: sooner, languageCode: 'en', joinCount: 1 },
    { id: 'after', startsAtIso: afterThat, languageCode: 'en', joinCount: 3 },
    { id: 'spanish', startsAtIso: sooner, languageCode: 'es', joinCount: 9 },
  ],
};

describe('english group-call links', () => {
  it('opens the calls list with English already selected', () => {
    expect(englishGroupCallOnboardingHref('en')).toBe('https://app.fluencypal.com/community-call');
    expect(englishGroupCallOnboardingHref('ko')).toBe(
      'https://app.fluencypal.com/ko/community-call',
    );
    expect(groupCallChoiceHref(englishGroupCallOnboardingHref('en'), 'sat-21')).toBe(
      'https://app.fluencypal.com/community-call?step=native&call=sat-21',
    );
    expect(talkWithAlexHref('en')).toBe('https://app.fluencypal.com/talk-with-alex');
    expect(talkWithAlexHref('ko')).toBe('https://app.fluencypal.com/ko/talk-with-alex');
  });
});

describe('group conversation times', () => {
  beforeEach(() => {
    resetEnglishGroupCallsCache();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    }) as unknown as typeof fetch;
  });

  it('shows two placeholder rows while the schedule loads', () => {
    global.fetch = jest
      .fn()
      .mockReturnValue(new Promise(() => undefined)) as unknown as typeof fetch;
    resetEnglishGroupCallsCache();
    render(renderWithI18n(<GroupConversationSchedule moreHref={href} />));

    expect(screen.getAllByTestId('group-conversations-schedule-skeleton')).toHaveLength(2);
  });

  it('links each English time into the group-call flow, soonest first', async () => {
    render(renderWithI18n(<GroupConversationSchedule moreHref={href} />));

    const rows = await screen.findAllByTestId('group-conversations-schedule-row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute('href', groupCallChoiceHref(href, 'sooner'));
    expect(rows[0]).toHaveAttribute('data-analytics', 'community-call-schedule-row');
    expect(rows[1]).toHaveAttribute('href', groupCallChoiceHref(href, 'later'));
    expect(screen.getByTestId('group-conversations-show-more')).toHaveAttribute('href', href);
    expect(screen.queryByText('9')).not.toBeInTheDocument();
  });

  it('labels the hero button See schedule', () => {
    render(renderWithI18n(<GroupConversationJoinButton href={href} />));

    expect(screen.getByTestId('group-conversations-cta')).toHaveTextContent('See schedule');
    expect(screen.getByTestId('group-conversations-cta')).toHaveAttribute('href', href);
    expect(screen.getByTestId('group-conversations-cta')).toHaveAttribute(
      'data-analytics',
      'community-call-cta',
    );
  });

  it('keeps the hero button usable when the schedule is empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ calls: [] }),
    }) as unknown as typeof fetch;
    resetEnglishGroupCallsCache();

    render(
      renderWithI18n(
        <>
          <GroupConversationJoinButton href={href} />
          <GroupConversationSchedule moreHref={href} />
        </>,
      ),
    );

    expect(await screen.findByTestId('group-conversations-schedule-empty')).toBeInTheDocument();
    expect(screen.getByTestId('group-conversations-cta')).toHaveTextContent('See schedule');
    expect(screen.queryByTestId('group-conversations-schedule-row')).not.toBeInTheDocument();
  });
});
