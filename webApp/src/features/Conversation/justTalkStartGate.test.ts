/**
 * @jest-environment jsdom
 */
import {
  beginJustTalkStart,
  finishJustTalkStart,
  isJustTalkStartCurrent,
  JustTalkStartGate,
} from './justTalkStartGate';

const gate = (): JustTalkStartGate => ({ attempt: 0 });

describe('justTalkStartGate', () => {
  it('lets the first auto-start claim the attempt', () => {
    const current = gate();
    const attempt = beginJustTalkStart(current, false);
    expect(attempt).toBe(1);
    expect(isJustTalkStartCurrent(current, 1)).toBe(true);
    expect(beginJustTalkStart(current, false)).toBeNull();
  });

  it('lets an Enable-mic tap supersede a hung auto-start', () => {
    const current = gate();
    const autoStart = beginJustTalkStart(current, false);
    const tap = beginJustTalkStart(current, true);
    expect(autoStart).toBe(1);
    expect(tap).toBe(2);
    expect(isJustTalkStartCurrent(current, 1)).toBe(false);
    expect(isJustTalkStartCurrent(current, 2)).toBe(true);
    expect(finishJustTalkStart(current, 1)).toBe(false);
    expect(current.attempt).toBe(2);
    expect(finishJustTalkStart(current, 2)).toBe(true);
    expect(current.attempt).toBe(0);
  });
});
