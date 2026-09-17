/**
 * @jest-environment jsdom
 */

import { captureUiContext, hashUiContext, screenIdFromPath } from './captureUiContext';

describe('screenIdFromPath', () => {
  it('maps quiz steps, just talk and role play', () => {
    expect(screenIdFromPath('/quiz?currentStep=goalReview', '')).toBe('quiz.goalReview');
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
});
