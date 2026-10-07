/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { renderWithI18n } from '@/features/Alias/test-utils/i18nTestHelper';
import { GroupConversationJoinButton } from './GroupConversationJoinButton';
import { GroupConversationSchedule } from './GroupConversationSchedule';
import { groupCallTimeLabel } from './groupCallTimeLabel';
import { resetEnglishGroupCallsCache } from './useEnglishGroupCalls';

const sooner = '2027-06-03T17:00:00.000Z';
const later = '2027-06-04T18:30:00.000Z';
const href = 'https://app.fluencypal.com/community-call';

const payload = {
  calls: [
    { id: 'later', startsAtIso: later, languageCode: 'en', joinCount: 2 },
    { id: 'sooner', startsAtIso: sooner, languageCode: 'en', joinCount: 1 },
    { id: 'spanish', startsAtIso: sooner, languageCode: 'es', joinCount: 9 },
  ],
};

describe('group conversation times', () => {
  beforeEach(() => {
    resetEnglishGroupCallsCache();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    }) as unknown as typeof fetch;
  });

  it('links each English time into the group-call flow, soonest first', async () => {
    render(renderWithI18n(<GroupConversationSchedule moreHref={href} />));

    const rows = await screen.findAllByTestId('group-conversations-schedule-row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute('href', href);
    expect(rows[0]).toHaveAttribute('data-analytics', 'community-call-schedule-row');
    expect(rows[1]).toHaveAttribute('href', href);
    expect(screen.getByTestId('group-conversations-show-more')).toHaveAttribute('href', href);
    expect(screen.queryByText('9')).not.toBeInTheDocument();
  });

  it('names the next call on the hero button', async () => {
    render(renderWithI18n(<GroupConversationJoinButton href={href} />));

    expect(screen.getByTestId('group-conversations-cta')).toHaveTextContent('See upcoming calls');
    const when = groupCallTimeLabel(sooner, 'en', Intl.DateTimeFormat().resolvedOptions().timeZone);
    await waitFor(() => {
      expect(screen.getByTestId('group-conversations-cta')).toHaveTextContent(
        when.live ? 'Join now' : `Join ${when.when}`,
      );
    });
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
    expect(screen.getByTestId('group-conversations-cta')).toHaveTextContent('See upcoming calls');
    expect(screen.queryByTestId('group-conversations-schedule-row')).not.toBeInTheDocument();
  });
});
