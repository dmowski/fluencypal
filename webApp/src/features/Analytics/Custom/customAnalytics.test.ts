import { ANALYTICS_EVENT_NAMES, AnalyticsClientEvent, AnalyticsSourceApp } from './types';
import { classifyFunnelFlags, lastFunnelStep, mergeFunnelFlags } from './classifyFunnel';
import { isAllowedAnalyticsOrigin, isAllowedIngestHost } from './allowedOrigins';
import { createVisitorId, isValidVisitorId } from './visitorId';
import { validateClientEvent, validateVisitorId } from './validateEvent';
import { summarizeJourneys } from './backend/summarizeJourneys';
import { isBotUserAgent } from './isBotUserAgent';
import { isReportableVisitor, shouldPersistAnalyticsEvent } from './isReportableVisitor';
import { classifyCta } from './classifyCta';
import { nextScrollBucket } from './pageEngagement';
import { parseTraffic } from './parseTraffic';
import {
  normalizeAnalyticsPath,
  stripVisitorIdFromHref,
  isInternalAnalyticsAuthUserId,
  isInternalAnalyticsHost,
  isInternalAnalyticsPath,
  quizStepFromAnalyticsPath,
  entryKindFromAnalyticsPath,
} from './analyticsPath';
import {
  cookieDomainForHost,
  decorateAppHref,
  serializeVisitorCookie,
  visitorIdFromCookieString,
  visitorIdFromSearch,
} from './parentVisitorId';
import { ANALYTICS_VISITOR_QUERY } from './constants';

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

  it('accepts speech_start with a known surface', () => {
    const event = validateClientEvent(
      baseEvent({ name: 'speech_start', speechSurface: 'quiz', path: '/quiz' }),
    );
    expect(event?.name).toBe('speech_start');
    expect(event?.speechSurface).toBe('quiz');
    expect(
      validateClientEvent(
        baseEvent({ name: 'speech_start', path: '/quiz', speechSurface: 'nope' as never }),
      )?.speechSurface,
    ).toBeUndefined();
  });

  it('accepts permission, call_state, auth_attempt, ui_error and clips uiContext', () => {
    const event = validateClientEvent(
      baseEvent({
        name: 'permission',
        permissionKind: 'mic',
        permissionState: 'denied',
        uiContext: {
          screenId: 'practice.justTalkHandoff',
          heading: 'Your teacher is ready',
          dialog: '',
          alerts: ['Microphone access was blocked'],
          primary: 'enable-mic-just-talk',
          actions: [{ role: 'button', name: 'Enable microphone', disabled: false }],
        },
        uiContextHash: 'abc123',
      }),
    );
    expect(event?.name).toBe('permission');
    expect(event?.permissionKind).toBe('mic');
    expect(event?.permissionState).toBe('denied');
    expect(event?.uiContext?.screenId).toBe('practice.justTalkHandoff');
    expect(event?.uiContext?.alerts).toEqual(['Microphone access was blocked']);
    expect(
      validateClientEvent(baseEvent({ name: 'call_state', callState: 'failed', callReason: 'mic' }))
        ?.callState,
    ).toBe('failed');
    expect(
      validateClientEvent(
        baseEvent({ name: 'auth_attempt', authProvider: 'google', authResult: 'cancelled' }),
      )?.authResult,
    ).toBe('cancelled');
    expect(
      validateClientEvent(baseEvent({ name: 'ui_error', errorCode: 'mic_denied' }))?.errorCode,
    ).toBe('mic_denied');
    expect(validateClientEvent(baseEvent({ name: 'dead_click', tagName: 'div' }))?.name).toBe(
      'dead_click',
    );
  });
});

describe('isBotUserAgent', () => {
  it('drops crawlers and empty UA', () => {
    expect(isBotUserAgent('')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 Chrome/120.0.0.0')).toBe(false);
  });
});

describe('shouldPersistAnalyticsEvent', () => {
  it('skips the first page_view until the visitor has engaged', () => {
    expect(shouldPersistAnalyticsEvent('page_view', false)).toBe(false);
    expect(shouldPersistAnalyticsEvent('page_view', true)).toBe(true);
    expect(shouldPersistAnalyticsEvent('page_leave', false)).toBe(true);
    expect(shouldPersistAnalyticsEvent('scroll_depth', false)).toBe(true);
    expect(shouldPersistAnalyticsEvent('click', false)).toBe(true);
    expect(shouldPersistAnalyticsEvent('identify', false)).toBe(true);
  });
});

describe('isReportableVisitor', () => {
  it('drops lone page_view sessions and keeps bounces that left or scrolled', () => {
    expect(isReportableVisitor({ eventCount: 1, lastEventName: 'page_view' })).toBe(false);
    expect(isReportableVisitor({ eventCount: 2, lastEventName: 'page_view' })).toBe(true);
    expect(isReportableVisitor({ eventCount: 1, lastEventName: 'page_leave' })).toBe(true);
    expect(isReportableVisitor({ eventCount: 1, lastEventName: 'scroll_depth' })).toBe(true);
  });
});

describe('classifyCta', () => {
  it('maps quiz and header sign-in from the element href and id', () => {
    expect(
      classifyCta({ href: 'https://app.fluencypal.com/quiz', buttonId: 'hero-cta' }).ctaIntent,
    ).toBe('quiz');
    expect(
      classifyCta({ href: 'https://app.fluencypal.com/practice', buttonId: 'header-sign-in' })
        .ctaIntent,
    ).toBe('signin');
  });

  it('does not treat the current page URL or button text as a CTA', () => {
    expect(classifyCta({ href: '', buttonId: '' }).ctaIntent).toBe('other');
    expect(
      classifyCta({
        href: '',
        buttonId: '',
      }).ctaId,
    ).toBe('other');
    expect(classifyCta({ href: 'https://app.fluencypal.com/th/quiz' }).ctaIntent).toBe('quiz');
    expect(classifyCta({ href: 'https://www.fluencypal.com/vi/features/ai-speaking-practice' }).ctaIntent).toBe(
      'other',
    );
  });

  it('keeps in-app hear and Google ids as named other CTAs', () => {
    expect(classifyCta({ href: '', buttonId: 'auth-google' })).toEqual({
      ctaId: 'auth-google',
      ctaIntent: 'other',
    });
    expect(classifyCta({ href: '', buttonId: 'hear-question' }).ctaId).toBe('hear-question');
    expect(classifyCta({ href: '', buttonId: 'hear-first-line' }).ctaId).toBe('hear-first-line');
    expect(classifyCta({ href: '', buttonId: 'reply-first-line' }).ctaId).toBe('reply-first-line');
    expect(classifyCta({ href: '', buttonId: 'quiz-guest-continue' }).ctaId).toBe(
      'quiz-guest-continue',
    );
    expect(classifyCta({ href: '', buttonId: 'enable-mic-just-talk' }).ctaId).toBe(
      'enable-mic-just-talk',
    );
    expect(classifyCta({ href: '', buttonId: 'quiz-next' }).ctaId).toBe('quiz-next');
    expect(classifyCta({ href: '', buttonId: 'quiz-start-speaking' }).ctaId).toBe(
      'quiz-start-speaking',
    );
    expect(classifyCta({ href: '', buttonId: 'call-enable-mic' }).ctaId).toBe('call-enable-mic');
    expect(classifyCta({ href: '', buttonId: 'call-end' }).ctaId).toBe('call-end');
    expect(classifyCta({ href: '', buttonId: 'call-what-to-say' }).ctaId).toBe('call-what-to-say');
    expect(classifyCta({ href: '', buttonId: 'mic-permission-grant' }).ctaId).toBe(
      'mic-permission-grant',
    );
    expect(classifyCta({ href: '', buttonId: 'teacher-preview-play' }).ctaId).toBe(
      'teacher-preview-play',
    );
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

  it('counts quiz and sign-in CTAs only on landing', () => {
    const landingQuiz = classifyFunnelFlags(
      baseEvent({ name: 'click', sourceApp: 'landing', ctaIntent: 'quiz', path: '/' }),
    );
    const appQuiz = classifyFunnelFlags(
      baseEvent({
        name: 'click',
        sourceApp: 'webapp' as AnalyticsSourceApp,
        ctaIntent: 'quiz',
        path: '/quiz',
      }),
    );
    expect(landingQuiz.clickedQuizCta).toBe(true);
    expect(appQuiz.clickedQuizCta).toBe(false);
  });

  it('marks used voice without treating it as an AI conversation', () => {
    const quizSpeech = classifyFunnelFlags(
      baseEvent({
        name: 'speech_start',
        speechSurface: 'quiz',
        path: '/th/quiz',
        sourceApp: 'webapp',
      }),
    );
    expect(quizSpeech.reachedSpeech).toBe(true);
    expect(quizSpeech.reachedConversation).toBe(false);
    expect(lastFunnelStep(quizSpeech)).toBe('reachedQuiz');
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
      {
        visitorId: 'fpv_crawler',
        createdAtIso: '2026-08-28T12:00:00.000Z',
        lastSeenAtIso: '2026-08-28T12:00:01.000Z',
        firstPath: '/zh/practice?rolePlayId=talking-to-a-doctor',
        lastPath: '/zh/practice?rolePlayId=talking-to-a-doctor',
        lastEventName: 'page_view',
        lastHost: 'app.fluencypal.com',
        firstHost: 'app.fluencypal.com',
        firstSourceApp: 'webapp',
        lastSourceApp: 'webapp',
        eventCount: 1,
        userAgent: 'Mozilla',
        os: 'Linux',
        browser: 'Chrome',
        screenWidth: 1536,
        screenHeight: 864,
        language: 'en-US',
        authUserId: null,
        lastReferrer: '',
        reachedLanding: false,
        reachedApp: true,
        reachedAuth: false,
        reachedQuiz: false,
        reachedPractice: true,
      },
      {
        visitorId: 'fpv_founder',
        createdAtIso: '2026-08-28T13:00:00.000Z',
        lastSeenAtIso: '2026-08-28T13:10:00.000Z',
        firstPath: '/practice',
        lastPath: '/practice',
        lastEventName: 'conversation_start',
        lastHost: 'app.fluencypal.com',
        firstHost: 'app.fluencypal.com',
        firstSourceApp: 'webapp',
        lastSourceApp: 'webapp',
        eventCount: 12,
        userAgent: 'Mozilla',
        os: 'macOS 14.0',
        browser: 'Chrome',
        screenWidth: 1440,
        screenHeight: 900,
        language: 'en',
        authUserId: 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2',
        lastReferrer: '',
        reachedLanding: true,
        reachedApp: true,
        reachedAuth: true,
        reachedQuiz: true,
        reachedPractice: true,
        reachedConversation: true,
        reachedSpeech: true,
        reachedPaywall: true,
        reachedCheckout: true,
      },
    ]);

    expect(summary.visitorCount).toBe(2);
    expect(summary.eventCount).toBe(7);
    expect(summary.funnel.landing).toBe(2);
    expect(summary.funnel.practice).toBe(1);
    expect(summary.funnel.conversation).toBe(1);
    expect(summary.funnel.speech).toBe(0);
    expect(summary.funnel.paywall).toBe(0);
    expect(summary.funnel.checkout).toBe(0);
    expect(summary.dropOff.map((row) => row.path).sort()).toEqual(['/', '/practice']);
    expect(summary.visitors.map((visitor) => visitor.visitorId)).not.toContain('fpv_crawler');
    expect(summary.visitors.map((visitor) => visitor.visitorId)).not.toContain('fpv_founder');
  });
});

describe('normalizeAnalyticsPath', () => {
  it('keeps quiz step and role play, drops utm and inbox ids', () => {
    expect(normalizeAnalyticsPath('/th/quiz?currentStep=recordAbout&nativeLang=th')).toBe(
      '/th/quiz?currentStep=recordAbout',
    );
    expect(normalizeAnalyticsPath('/practice?rolePlayId=custom&utm_source=chatgpt.com')).toBe(
      '/practice?rolePlayId=custom',
    );
    expect(normalizeAnalyticsPath('/id/practice?justTalk=open&fpv=fpv_1')).toBe(
      '/id/practice?justTalk=open',
    );
    expect(normalizeAnalyticsPath('/practice?inbox=true&inboxType=chat')).toBe('/practice');
    expect(normalizeAnalyticsPath('/?fpv=fpv_11111111-1111-4111-8111-111111111111')).toBe('/');
  });

  it('reads the quiz onboarding step from the stored path', () => {
    expect(quizStepFromAnalyticsPath('/ar/quiz?currentStep=before_recordAbout')).toBe(
      'before_recordAbout',
    );
    expect(quizStepFromAnalyticsPath('/quiz?currentStep=micPermission')).toBe('micPermission');
    expect(quizStepFromAnalyticsPath('/quiz')).toBe('start');
    expect(quizStepFromAnalyticsPath('/practice?rolePlayId=alias-game')).toBeNull();
  });

  it('groups first paths into entry kinds for the daily report', () => {
    expect(entryKindFromAnalyticsPath('/')).toBe('home');
    expect(entryKindFromAnalyticsPath('/ms')).toBe('home');
    expect(entryKindFromAnalyticsPath('/scenarios/hotel-check-in')).toBe('scenario');
    expect(entryKindFromAnalyticsPath('/da/scenarios/alias-game')).toBe('scenario');
    expect(entryKindFromAnalyticsPath('/fr/alias')).toBe('scenario');
    expect(entryKindFromAnalyticsPath('/ar/blog/phrases-for-an-interview-in-english')).toBe('blog');
    expect(entryKindFromAnalyticsPath('/pt/quiz?currentStep=before_recordAbout')).toBe('quiz');
    expect(entryKindFromAnalyticsPath('/practice?rolePlayId=small-talk-with-a-stranger')).toBe(
      'practice',
    );
    expect(entryKindFromAnalyticsPath('/es/features/role-play')).toBe('features');
  });

  it('flags localhost and testUi as internal', () => {
    expect(isInternalAnalyticsHost('localhost:3000')).toBe(true);
    expect(isInternalAnalyticsHost('www.fluencypal.com')).toBe(false);
    expect(isInternalAnalyticsPath('/testUi')).toBe(true);
    expect(isInternalAnalyticsPath('/practice')).toBe(false);
  });

  it('excludes the founder firebase uid from reports', () => {
    expect(isInternalAnalyticsAuthUserId('Mq2HfU3KrXTjNyOpPXqHSPg5izV2')).toBe(true);
    expect(isInternalAnalyticsAuthUserId('uid-1')).toBe(false);
    expect(isInternalAnalyticsAuthUserId(null)).toBe(false);
  });
});

describe('parentVisitorId', () => {
  const visitorId = 'fpv_11111111-1111-4111-8111-111111111111';

  it('reads the fpv query and first-party cookie', () => {
    expect(visitorIdFromSearch(`?${ANALYTICS_VISITOR_QUERY}=${visitorId}`)).toBe(visitorId);
    expect(visitorIdFromCookieString(`fp_vid=${visitorId}; other=1`)).toBe(visitorId);
    expect(visitorIdFromSearch('?fpv=nope')).toBeNull();
  });

  it('sets a shared cookie on fluencypal.com and decorates app hrefs only', () => {
    expect(cookieDomainForHost('www.fluencypal.com')).toBe('.fluencypal.com');
    expect(cookieDomainForHost('localhost')).toBeNull();
    expect(serializeVisitorCookie(visitorId, 'www.fluencypal.com', true)).toContain(
      'Domain=.fluencypal.com',
    );
    expect(
      decorateAppHref('https://app.fluencypal.com/quiz', visitorId),
    ).toBe(`https://app.fluencypal.com/quiz?fpv=${visitorId}`);
    expect(
      decorateAppHref(
        'https://app.fluencypal.com/quiz',
        visitorId,
        'https://www.fluencypal.com/es?utm_source=google&utm_medium=cpc',
      ),
    ).toBe(
      `https://app.fluencypal.com/quiz?fpv=${visitorId}&utm_source=google&utm_medium=cpc`,
    );
    expect(decorateAppHref('https://www.fluencypal.com/th', visitorId)).toBe(
      'https://www.fluencypal.com/th',
    );
    expect(
      stripVisitorIdFromHref(`https://app.fluencypal.com/quiz?fpv=${visitorId}`, ANALYTICS_VISITOR_QUERY),
    ).toBe('https://app.fluencypal.com/quiz');
  });
});
