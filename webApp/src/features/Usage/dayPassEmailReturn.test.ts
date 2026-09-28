/**
 * @jest-environment jsdom
 */

import {
  DAY_PASS_EMAIL_RETURN_KEY,
  dayPassConfirmUrlFromHref,
  dayPassEmailReturnTarget,
  rememberDayPassEmailReturn,
} from './dayPassEmailReturn';

const confirmHref =
  'https://app.fluencypal.com/practice?justTalk=open&paymentModal=true&paymentDuration=day&paymentConfirm=true&planLesson=Greetings&planLessonDetails=Words+for+saying+hello.';

describe('dayPassEmailReturn', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps the lesson confirmation on the email continue URL', () => {
    const withLinkParams = `${confirmHref}&oobCode=abc&mode=signIn&apiKey=key&continueUrl=https%3A%2F%2Fexample.com&lang=en`;

    expect(dayPassConfirmUrlFromHref(withLinkParams)).toBe(confirmHref);
    expect(dayPassConfirmUrlFromHref('https://app.fluencypal.com/practice')).toBeNull();
  });

  it('sends a finished email sign-in to the stored confirmation', () => {
    expect(rememberDayPassEmailReturn(confirmHref)).toBe(confirmHref);

    const target = dayPassEmailReturnTarget(
      'https://app.fluencypal.com/practice?oobCode=abc&mode=signIn',
    );

    expect(target).toBe(confirmHref);
    expect(window.localStorage.getItem(DAY_PASS_EMAIL_RETURN_KEY)).toBeTruthy();
  });

  it('stays on the confirmation when the email link already opened it', () => {
    rememberDayPassEmailReturn(confirmHref);

    expect(
      dayPassEmailReturnTarget(`${confirmHref}&oobCode=abc&mode=signIn&apiKey=key`),
    ).toBeNull();
    expect(window.localStorage.getItem(DAY_PASS_EMAIL_RETURN_KEY)).toBeNull();
  });
});
