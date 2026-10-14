import { OpenAiLiveApiError } from '../api';
import { describeDemoFailure, demoTimeoutReason } from './demoStartFailure';

test('names a microphone denial separately from a missing device', () => {
  expect(
    describeDemoFailure(new DOMException('Permission denied', 'NotAllowedError'), 'start'),
  ).toEqual({ errorCode: 'demo-mic-denied', callReason: 'demo-start-failed:mic-denied' });
  expect(
    describeDemoFailure(new DOMException('No device', 'NotFoundError'), 'start').errorCode,
  ).toBe('demo-mic-not-found');
});

test('keeps the provider code the demo API returned', () => {
  const error = new OpenAiLiveApiError('Could not start the live session', 400, 'openai-429');
  expect(describeDemoFailure(error, 'start')).toEqual({
    errorCode: 'demo-openai-429',
    callReason: 'demo-start-failed:openai-429',
  });
});

test('falls back to the HTTP status when the API sends no code', () => {
  expect(describeDemoFailure(new OpenAiLiveApiError('Request failed', 502), 'ready')).toEqual({
    errorCode: 'demo-ready-http-502',
    callReason: 'demo-ready-failed:http-502',
  });
});

test('names an ICE timeout and a connect-stage timeout', () => {
  expect(
    describeDemoFailure(new Error('Timed out while gathering ICE candidates'), 'start').errorCode,
  ).toBe('demo-ice-timeout');
  expect(demoTimeoutReason('offer')).toBe('demo-timeout-offer');
});
