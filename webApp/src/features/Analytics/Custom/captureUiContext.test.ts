/**
 * @jest-environment jsdom
 */

import { captureUiContext, hashUiContext, screenIdFromPath } from './captureUiContext';

describe('screenIdFromPath', () => {
  it('maps quiz steps, just talk and role play', () => {
    expect(screenIdFromPath('/quiz?currentStep=goalReview', '')).toBe('quiz.goalReview');
    expect(screenIdFromPath('/quiz?currentStep=micPermission', '')).toBe('quiz.micPermission');
    expect(screenIdFromPath('/ar/practice?justTalk=open', '')).toBe('practice.justTalk');
    expect(screenIdFromPath('/practice?rolePlayId=alias-game', '')).toBe('practice.rolePlay');
    expect(screenIdFromPath('/es/scenarios/job-interview', 'Sign in')).toBe('scenario.dialog');
    expect(screenIdFromPath('/', '')).toBe('home');
  });
});

describe('captureUiContext', () => {
  it('captures heading, named controls and a screen marker', () => {
    document.body.innerHTML = `
      <div data-analytics-screen="practice.justTalkHandoff">
        <h1>Your teacher is ready</h1>
        <div role="alert">Microphone access was blocked</div>
        <button data-analytics="enable-mic-just-talk">Enable microphone to start talking</button>
        <button disabled>Starting...</button>
      </div>
    `;
    const ctx = captureUiContext('/practice?justTalk=open');
    expect(ctx?.screenId).toBe('practice.justTalkHandoff');
    expect(ctx?.heading).toBe('Your teacher is ready');
    expect(ctx?.alerts).toEqual(['Microphone access was blocked']);
    expect(ctx?.primary).toBe('enable-mic-just-talk');
    expect(ctx?.actions.some((action) => action.disabled)).toBe(true);
    expect(hashUiContext(ctx!)).toMatch(/^[0-9a-f]+$/);
  });

  it('keeps a named Continue button and records whether it is in view', () => {
    document.body.innerHTML = `
      <div data-analytics-screen="quiz.teacherSelection">
        <h1>Choose your interlocutor</h1>
        ${Array.from({ length: 30 }, (_, index) => `<button>Voice ${index}</button>`).join('')}
        <button data-analytics="quiz-next" id="continue">Continue</button>
      </div>
    `;
    const continueButton = document.getElementById('continue') as HTMLButtonElement;
    continueButton.getBoundingClientRect = () =>
      ({
        top: 900,
        bottom: 960,
        left: 10,
        right: 200,
        width: 190,
        height: 60,
        x: 10,
        y: 900,
        toJSON: () => ({}),
      }) as DOMRect;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 400 });

    const ctx = captureUiContext('/quiz?currentStep=teacherSelection');
    const next = ctx?.actions.find((action) => action.name === 'quiz-next');
    expect(next).toEqual({ role: 'button', name: 'quiz-next', disabled: false, inView: false });
    expect(ctx?.actions).toHaveLength(20);
  });
});
