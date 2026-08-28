import { ANALYTICS_EVENT_NAMES, AnalyticsClientEvent, AnalyticsSourceApp } from './types';
import { classifyFunnelFlags, lastFunnelStep, mergeFunnelFlags } from './classifyFunnel';
import { isAllowedAnalyticsOrigin, isAllowedIngestHost } from './allowedOrigins';
import { createVisitorId, isValidVisitorId } from './visitorId';
import { validateClientEvent, validateVisitorId } from './validateEvent';
import { summarizeJourneys } from './backend/summarizeJourneys';
import { isBotUserAgent } from './isBotUserAgent';
import { classifyCta } from './classifyCta';
import { nextScrollBucket } from './pageEngagement';
import { parseTraffic } from './parseTraffic';

const baseEvent = (overrides: Partial<AnalyticsClientEvent> = {}): AnalyticsClientEvent => ({
  name: 'page_view',
  sourceApp: 'landing',
  path: '/',
  href: 'https://www.fluencypal.com/',
  title: 'Home',
  referrer: '',
  language: 'en',
  screen: { width: 390, height: 844 },
  ...overrides,
});

describe('allowedOrigins', () => {
  it('allows production FluencyPal hosts and localhost', () => {
    expect(isAllowedAnalyticsOrigin('https://www.fluencypal.com')).toBe(true);
    expect(isAllowedAnalyticsOrigin('https://app.fluencypal.com')).toBe(true);
    expect(isAllowedAnalyticsOrigin('http://localhost:3001')).toBe(true);
    expect(isAllowedAnalyticsOrigin('https://evil.example')).toBe(false);
    expect(isAllowedIngestHost('app.fluencypal.com')).toBe(true);
    expect(isAllowedIngestHost('attacker.com')).toBe(false);
  });
});

describe('visitorId', () => {
  it('creates and validates fpv uuids', () => {
    const id = createVisitorId();
    expect(isValidVisitorId(id)).toBe(true);
    expect(isValidVisitorId('nope')).toBe(false);
    expect(validateVisitorId(id)).toBe(id);
    expect(validateVisitorId('fpv_not-a-uuid')).toBeNull();
  });
});

describe('validateClientEvent', () => {
  it('accepts a page_view and clips extra fields', () => {
    const event = validateClientEvent({
      ...baseEvent(),
      name: ANALYTICS_EVENT_NAMES[0],
      path: `/${'x'.repeat(600)}`,
      extra: 'drop-me',
    });
    expect(event?.name).toBe('page_view');
    expect(event?.path.length).toBe(500);
    expect(event && 'extra' in event).toBe(false);
  });

  it('rejects unknown names and empty paths', () => {
    expect(validateClientEvent({ ...baseEvent(), name: 'hack' } as unknown)).toBeNull();
    expect(validateClientEvent(baseEvent({ path: '   ' }))).toBeNull();
  });
});

describe('isBotUserAgent', () => {
  it('drops crawlers and empty UA', () => {
    expect(isBotUserAgent('')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 Chrome/120.0.0.0')).toBe(false);
  });
});

describe('classifyCta', () => {
  it('maps quiz and header sign-in', () => {
    expect(
      classifyCta({ href: 'https://app.fluencypal.com/quiz', buttonId: 'hero-cta' }).ctaIntent,
    ).toBe('quiz');
    expect(
      classifyCta({ href: 'https://app.fluencypal.com/practice', buttonId: 'header-sign-in' })
        .ctaIntent,
    ).toBe('signin');
  });
});

describe('pageEngagement', () => {
  it('emits the next scroll bucket once', () => {
    expect(nextScrollBucket(0, 10)).toBeNull();
    expect(nextScrollBucket(0, 30)).toBe(25);
    expect(nextScrollBucket(25, 80)).toBe(50);
  });
});

describe('parseTraffic', () => {
  it('reads utm and referrer host', () => {
    const traffic = parseTraffic(
      'https://www.fluencypal.com/?utm_source=google&utm_medium=cpc',
      'https://www.google.com/search',
    );
    expect(traffic.utmSource).toBe('google');
    expect(traffic.referrerHost).toBe('www.google.com');
  });
});

describe('classifyFunnel', () => {
  it('marks landing, quiz, practice and merges flags', () => {
    const landing = classifyFunnelFlags(baseEvent({ sourceApp: 'landing', path: '/' }));
    const quiz = classifyFunnelFlags(
      baseEvent({ sourceApp: 'webapp' as AnalyticsSourceApp, path: '/quiz' }),
    );
    const practice = classifyFunnelFlags(baseEvent({ sourceApp: 'webapp', path: '/practice' }));
    const merged = mergeFunnelFlags(mergeFunnelFlags(landing, quiz), practice);

    expect(landing.reachedLanding).toBe(true);
    expect(quiz.reachedQuiz).toBe(true);
    expect(practice.reachedPractice).toBe(true);
    expect(lastFunnelStep(merged)).toBe('reachedPractice');
  });

  it('ranks speak, paywall and checkout above practice', () => {
    const spoke = classifyFunnelFlags(baseEvent({ name: 'conversation_start', path: '/practice' }));
    const paywall = classifyFunnelFlags(baseEvent({ name: 'paywall_view', path: '/practice' }));
    const checkout = classifyFunnelFlags(baseEvent({ name: 'checkout_start', path: '/practice' }));
    expect(lastFunnelStep(spoke)).toBe('reachedConversation');
    expect(lastFunnelStep(paywall)).toBe('reachedPaywall');
    expect(lastFunnelStep(checkout)).toBe('reachedCheckout');
  });
});

describe('summarizeJourneys', () => {
  it('counts users, drop-off paths and funnel', () => {
    const summary = summarizeJourneys('2026-08-28', [
      {
        visitorId: 'fpv_a',
        createdAtIso: '2026-08-28T10:00:00.000Z',
        lastSeenAtIso: '2026-08-28T10:01:00.000Z',
        firstPath: '/',
        lastPath: '/',
        lastEventName: 'page_view',
        lastHost: 'www.fluencypal.com',
        firstHost: 'www.fluencypal.com',
        firstSourceApp: 'landing',
        lastSourceApp: 'landing',
        eventCount: 2,
        userAgent: 'Mozilla',
        os: 'iOS 18.0',
        browser: 'Safari',
        screenWidth: 390,
        screenHeight: 844,
        language: 'en',
        authUserId: null,
        lastReferrer: '',
        reachedLanding: true,
        reachedApp: false,
        reachedAuth: false,
        reachedQuiz: false,
        reachedPractice: false,
      },
      {
        visitorId: 'fpv_b',
        createdAtIso: '2026-08-28T11:00:00.000Z',
        lastSeenAtIso: '2026-08-28T11:05:00.000Z',
        firstPath: '/',
        lastPath: '/practice',
        lastEventName: 'page_view',
        lastHost: 'app.fluencypal.com',
        firstHost: 'www.fluencypal.com',
        firstSourceApp: 'landing',
        lastSourceApp: 'webapp',
        eventCount: 5,
        userAgent: 'Mozilla',
        os: 'macOS 14.0',
        browser: 'Chrome',
        screenWidth: 1440,
        screenHeight: 900,
        language: 'en',
        authUserId: 'uid-1',
        lastReferrer: '',
        reachedLanding: true,
        reachedApp: true,
        reachedAuth: true,
        reachedQuiz: true,
        reachedPractice: true,
        reachedConversation: true,
        reachedPaywall: false,
        reachedCheckout: false,
      },
    ]);

    expect(summary.visitorCount).toBe(2);
    expect(summary.eventCount).toBe(7);
    expect(summary.funnel.landing).toBe(2);
    expect(summary.funnel.practice).toBe(1);
    expect(summary.funnel.conversation).toBe(1);
    expect(summary.funnel.paywall).toBe(0);
    expect(summary.funnel.checkout).toBe(0);
    expect(summary.dropOff.map((row) => row.path).sort()).toEqual(['/', '/practice']);
  });
});
